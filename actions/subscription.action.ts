// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function getSubscriptionDetails(subscriptionId: string) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: [
                'customer',
                'items.data.price.product',
                'latest_invoice',
                'pending_setup_intent',
            ],
        });

        // Extract relevant information
        const plan = subscription.items.data[0].price;
        const product = plan.product as Stripe.Product;

        return {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            plan: {
                id: plan.id,
                name: product.name,
                description: product.description,
                amount: plan.unit_amount,
                currency: plan.currency,
                interval: plan.recurring?.interval,
                subscription

            },
            nextBillingDate: subscription.current_period_end,
        };
    } catch (error) {
        console.error('Error fetching subscription:', error);
        throw error;
    }
}