import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
    //@ts-expect-error: have some error with types
    apiVersion: '2024-12-18.acacia',
});

// First calculate the actual price based on quantity
async function calculatePrice(priceId: string, quantity: number) {
    try {
        const price = await stripe.prices.retrieve(priceId);

        if (!price || typeof price.unit_amount !== 'number' || !price.currency) {
            throw new Error('Invalid price object or missing amount/currency');
        }

        const totalAmount = price.unit_amount * quantity;
        
        return {
            unitAmount: price.unit_amount,
            totalAmount,
            currency: price.currency
        };
    } catch (error) {
        console.error('Price calculation failed:', error);
        throw error;
    }
}

async function createSubscription(priceId: string, email: string, quantity: number) {
    try {
        // Calculate price first
        const { totalAmount, currency } = await calculatePrice(priceId, quantity);
        
        const customers = await stripe.customers.search({
            query: `email:'${email}'`,
        });

        let customerId = customers.data.length > 0 ? customers.data[0].id : null;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                payment_method: 'pm_card_visa',
                invoice_settings: {
                    default_payment_method: 'pm_card_visa',
                },
            });
            customerId = customer.id;
        }

        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId, quantity: quantity }],
        });

        return {
            subscription,
            customerId,
            amount: totalAmount,
            currency,
        };
    } catch (error) {
        console.error('Subscription creation failed:', error);
        throw error;
    }
}

async function createPaymentIntent(amount: number, customerId: string, currency: string) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
            payment_method: 'pm_card_visa',
        });
        return {
            clientSecret: paymentIntent.client_secret
        }
    } catch (error) {
        console.error('Payment intent creation failed:', error);
        throw error;
    }
}

export async function POST(req: Request) {
    const { price_id, email, quantity } = await req.json();
    console.log("quantity", quantity);
    
    try {
        // Use default quantity of 1 if not provided
        const actualQuantity = quantity || 1;
        
        // First calculate the price to validate and show to user
        const priceInfo = await calculatePrice(price_id, actualQuantity);
        console.log("Calculated price details:", {
            unitPrice: priceInfo.unitAmount / 100, // Convert cents to dollars/currency units for logging
            quantity: actualQuantity,
            totalAmount: priceInfo.totalAmount / 100, // Convert cents to dollars/currency units for logging
            currency: priceInfo.currency
        });
        
        const { customerId, amount, currency, subscription } = await createSubscription(
            price_id, 
            email, 
            actualQuantity
        );
        
        const { clientSecret } = await createPaymentIntent(amount, customerId, currency);
        
        return NextResponse.json({ 
            clientSecret,
            amount,
            currency,
            quantity: actualQuantity,
            subscription,
            customerId,
            unitPrice: priceInfo.unitAmount / 100
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}