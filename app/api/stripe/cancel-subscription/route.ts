import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
    try {
        const { customerId } = await req.json();

        if (!customerId) {
            return NextResponse.json(
                { error: 'Valid customer ID is required.' },
                { status: 400 }
            );
        }

        // Fetch subscriptions with expand to get latest status
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            limit: 1,
            expand: ['data.latest_invoice'] // Optional: Get more details
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'No subscription found for this customer.' },
                { status: 404 }
            );
        }

        const subscription = subscriptions.data[0];
        console.log(subscription, 'ss')

        // Enhanced status checking
        switch (subscription.status) {
            case 'canceled':
                return NextResponse.json(
                    {
                        message: 'Subscription already canceled.',
                        details: {
                            canceled_at: subscription.canceled_at,
                            cancellation_date: new Date(subscription.canceled_at! * 1000).toISOString()
                        }
                    },
                    { status: 200 }
                );

            case 'incomplete':
            case 'incomplete_expired':
            case 'unpaid':
            case 'past_due':
                return NextResponse.json(
                    {
                        error: `Subscription cannot be canceled in its current state (${subscription.status}).`,
                        resolution: 'Please contact support for assistance.'
                    },
                    { status: 409 } // Conflict status
                );

            case 'active':
            case 'trialing':
                // Proceed with cancellation
                break;

            default:
                return NextResponse.json(
                    { error: `Unexpected subscription status: ${subscription.status}` },
                    { status: 400 }
                );
        }

        // Additional check for pending cancellation
        if (subscription.cancel_at_period_end) {
            return NextResponse.json(
                {
                    message: 'Subscription is already scheduled for cancellation at period end.',
                    details: {
                        current_period_end: subscription.current_period_end,
                        cancellation_scheduled: new Date(subscription.current_period_end * 1000).toISOString()
                    }
                },
                { status: 200 }
            );
        }

        // Cancel the subscription immediately
        const canceledSubscription = await stripe.subscriptions.cancel(subscription.id, {
            invoice_now: true, // Optional: Generate final invoice immediately
            prorate: true     // Optional: Prorate any unused time
        });

        // Audit log details
        const cancellationDetails = {
            id: canceledSubscription.id,
            status: canceledSubscription.status,
            canceled_at: canceledSubscription.canceled_at,
            cancellation_effective: new Date(canceledSubscription.canceled_at! * 1000).toISOString(),
            // ending_balance: canceledSubscription.ending_balance
        };

        return NextResponse.json({
            message: 'Subscription canceled successfully',
            cancellationDetails,
            next_steps: [
                'Customer will receive final invoice',
                'No further charges will be made'
            ]
        });
    } catch (error: any) {
        console.error('Stripe cancellation error:', error);

        // Enhanced error handling
        let status = 500;
        let errorMessage = error.message || 'Failed to cancel subscription';

        if (error.type) {
            status = 400; // Bad request for Stripe errors
            errorMessage = `Stripe error: ${error.type}`;

            if (error.code === 'resource_missing') {
                status = 404;
                errorMessage = 'Subscription not found';
            }
        }

        return NextResponse.json(
            {
                error: errorMessage,
                ...(error.code && { error_code: error.code }),
                ...(error.param && { error_param: error.param })
            },
            { status }
        );
    }
}