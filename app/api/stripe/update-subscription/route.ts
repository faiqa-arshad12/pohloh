// app/api/subscriptions/update/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia', // Using stable API version
});

interface RequestBody {
    subscriptionId: string;
    currentPriceId: string;
    newPriceId?: string;
    quantity?: number;
}

export async function POST(req: Request) {
    try {
        const { subscriptionId, currentPriceId, newPriceId, quantity }: RequestBody = await req.json();

        // Validate required fields
        if (!subscriptionId || !currentPriceId) {
            return NextResponse.json(
                { error: 'subscriptionId and currentPriceId are required' },
                { status: 400 }
            );
        }

        // Validate at least one modification is requested
        if (!newPriceId && !quantity) {
            return NextResponse.json(
                { error: 'Either newPriceId or quantity must be provided' },
                { status: 400 }
            );
        }

        // Retrieve current subscription
        const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Only allow updates if subscription is active or trialing
        if (currentSubscription.status !== 'active' && currentSubscription.status !== 'trialing') {
            return NextResponse.json(
                {
                    error: `Subscription cannot be updated in its current state (${currentSubscription.status}). Please create a new subscription instead.`,
                    status: currentSubscription.status,
                },
                { status: 409 }
            );
        }

        const currentItem = currentSubscription.items.data.find(
            item => item.price.id === currentPriceId
        );

        if (!currentItem) {
            return NextResponse.json(
                { error: 'Current price not found in subscription' },
                { status: 400 }
            );
        }

        // Prepare update parameters
        const updateParams: Stripe.SubscriptionUpdateParams = {
            cancel_at_period_end: false,
            proration_behavior: 'create_prorations',
            items: [],
            payment_behavior: 'default_incomplete', // Ensure payment intent is created
            payment_settings: {
                payment_method_types: ['card'],
            },
            expand: ['latest_invoice.payment_intent'],
        };

        // Determine update type
        if (quantity && !newPriceId) {
            // Case 1: Quantity change only
            updateParams.items = [{ id: currentItem.id, quantity }];
        } else if (newPriceId && !quantity) {
            // Case 2: Plan change only
            updateParams.items = [
                { id: currentItem.id, deleted: true },
                { price: newPriceId },
            ];
        } else if (newPriceId && quantity) {
            // Case 3: Both plan and quantity change
            updateParams.items = [
                { id: currentItem.id, deleted: true },
                { price: newPriceId, quantity },
            ];
        }

        // Update subscription
        const updatedSubscription = await stripe.subscriptions.update(
            subscriptionId,
            updateParams
        );

        // Extract payment intent details safely
        let clientSecret = null;
        let requiresPayment = false;

        if (updatedSubscription.latest_invoice &&
            typeof updatedSubscription.latest_invoice === 'object' &&
            'payment_intent' in updatedSubscription.latest_invoice) {
            const invoice = updatedSubscription.latest_invoice as Stripe.Invoice;
            if (invoice.payment_intent &&
                typeof invoice.payment_intent === 'object' &&
                'client_secret' in invoice.payment_intent) {
                const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
                clientSecret = paymentIntent.client_secret;
                requiresPayment = paymentIntent.status === 'requires_payment_method';
            }
        }

        // Return appropriate response
        if (requiresPayment && clientSecret) {
            return NextResponse.json({
                status: 'requires_payment',
                clientSecret,
                subscriptionId: updatedSubscription.id,
                invoiceId: updatedSubscription.latest_invoice?.toString(),
            });
        }

        // Success response (no immediate payment needed)
        return NextResponse.json({
            status: 'success',
            subscriptionId: updatedSubscription.id,
            currentPeriodEnd: updatedSubscription.current_period_end,
        });

    } catch (error: unknown) {
        console.error('Subscription update error:', error);

        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                {
                    error: error.message,
                    code: error.code,
                    type: error.type,
                    status: 'error'
                },
                { status: error.statusCode || 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', status: 'error' },
            { status: 500 }
        );
    }
}