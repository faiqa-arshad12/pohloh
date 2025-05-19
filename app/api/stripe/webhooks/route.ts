// import { updateCompanyPlan } from '@/actions/admin-actions';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '', {});
const endpointSecret = process.env.NEXT_PUBLIC_ENDPOINT_SECRET_KEY || '';

export const config = {
  api: {
    bodyParser: false,
  },
};
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  const body = await request.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('PaymentIntent was successful!');
    //   await updateCompanyPlan(event.data.object.customer as string, 'paid');
      break;

    case 'customer.subscription.deleted':
    //   await updateCompanyPlan(event.data.object.customer as string, 'pending');
      console.log('Subscription deleted');
      break;

    case 'invoice.payment_failed':
      console.log('Invoice payment failed');
      const customer = event.data.object.customer as string;
    //   const results = await updateCompanyPlan(customer, 'unpaid');
    //   if (results.error) {
    //     console.error('Failed to delete subscription:', results.error);
    //   } else {
    //     console.log('Subscription deleted successfully');
    //   }
      break;

    case 'setup_intent.setup_failed':
      console.log('Setup Intent failed');
      const setupIntent = event.data.object;
      const failedCustomerId = setupIntent.customer as string;
      const errorMessage = setupIntent.last_setup_error?.message;

      console.error(
        `Setup failed for customer ${failedCustomerId}. Error: ${errorMessage}`
      );
      const subscriptions = await stripe.subscriptions.list({
        customer: failedCustomerId,
        status: 'trialing',
        limit: 1,
      });
      const subscription = subscriptions.data[0];
      const subscriptionId = subscription.id;
      await stripe.subscriptions.cancel(subscriptionId);

      break;

    case 'invoice.payment_succeeded':
      console.log('Invoice payment succeeded');
      const customerID = event.data.object.customer as string;
    //   const response = await updateCompanyPlan(customerID, 'paid');
    //   if (response.error) {
    //     console.error('Failed to update company plan:', response.error);
    //   } else {
    //     console.log('Company plan updated successfully');
    //   }
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      if (updatedSubscription.status === 'past_due') {
        console.log('Subscription is past due');
        const pastDueCustomer = updatedSubscription.customer as string;
        // await updateCompanyPlan(pastDueCustomer, 'unpaid');
      }
      break;

    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
