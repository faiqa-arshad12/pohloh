import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

interface SubscriptionRequest {
  priceId: string
  quantity: number
  customerId?: string
  email?: string
}

// Utility to cancel all incomplete subscriptions for a customer
async function cancelAllIncompleteSubscriptions(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  const incompleteSubs = subs.data.filter(
    (s) => s.status === "incomplete"
  );
  for (const sub of incompleteSubs) {
    try {
      await stripe.subscriptions.cancel(sub.id);
    } catch (err) {
      console.error(`Failed to cancel incomplete subscription ${sub.id}:`, err);
    }
  }
}

export async function POST(req: Request) {
  try {
    const { priceId, quantity, customerId, email }: SubscriptionRequest = await req.json()

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
    }

    // Create or retrieve customer
    let customer = customerId
    if (!customer && email) {
      // Search for existing customers with this email
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        // Use existing customer
        customer = existingCustomers.data[0].id
      } else {
        // Create new customer if none exists
        const newCustomer = await stripe.customers.create({ email })
        customer = newCustomer.id
      }
    } else if (!customer) {
      throw new Error("Customer ID or email required")
    }

    // Get all subscriptions for the customer
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customer,
      status: "all",
      limit: 100,
    });

    // Find active, incomplete, and canceled subscriptions
    const activeSubs = allSubscriptions.data.filter(s => s.status === "active");
    const incompleteSubs = allSubscriptions.data.filter(s => s.status === "incomplete");
    const canceledSubs = allSubscriptions.data.filter(s => s.status === "canceled");

    // If there is an active subscription, update it to the new plan/quantity instead of blocking
    if (activeSubs.length > 0) {
      // Only update if the first active subscription is truly 'active'
      const activeSub = activeSubs[0];
      if (activeSub.status === 'active') {
        const currentItem = activeSub.items.data[0];
        const currentPriceId = currentItem.price.id;
        const currentQuantity = currentItem.quantity;
        // Only update if plan or quantity is different
        if (currentPriceId !== priceId || currentQuantity !== quantity) {
          // Prepare update parameters
          const updateParams = {
            cancel_at_period_end: false,
            proration_behavior: 'create_prorations' as Stripe.SubscriptionUpdateParams.ProrationBehavior,
            items: [
              { id: currentItem.id, deleted: true },
              { price: priceId, quantity },
            ],
            payment_behavior: 'default_incomplete' as Stripe.SubscriptionUpdateParams.PaymentBehavior,
            payment_settings: {
              payment_method_types: ['card' as Stripe.SubscriptionUpdateParams.PaymentSettings.PaymentMethodType],
            },
            expand: ['latest_invoice.payment_intent'],
          };
          // Update subscription
          const updatedSubscription = await stripe.subscriptions.update(
            activeSub.id,
            updateParams
          );
          // Extract payment intent details safely
          let clientSecret = null;
          let requiresPayment = false;
          if (
            updatedSubscription.latest_invoice &&
            typeof updatedSubscription.latest_invoice === 'object' &&
            'payment_intent' in updatedSubscription.latest_invoice
          ) {
            const invoice = updatedSubscription.latest_invoice as Stripe.Invoice;
            if (
              invoice.payment_intent &&
              typeof invoice.payment_intent === 'object' &&
              'client_secret' in invoice.payment_intent
            ) {
              const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
              clientSecret = paymentIntent.client_secret;
              requiresPayment = paymentIntent.status === 'requires_payment_method';
            }
          }
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
        } else {
          // No change needed
          return NextResponse.json({
            status: 'no_change',
            message: 'You are already on this plan with the same quantity.',
            subscriptionId: activeSub.id,
          });
        }
      } else {
        // Cancel all non-active subscriptions (including the first one)
        for (const sub of activeSubs) {
          if (sub.status !== 'active') {
            try {
              await stripe.subscriptions.cancel(sub.id);
            } catch (err) {
              console.error(`Failed to cancel non-active subscription ${sub.id}:`, err);
            }
          }
        }
        // Then proceed to create a new subscription (do not return here)
      }
    }

    // Cancel all incomplete and canceled subscriptions before creating a new one
    for (const sub of [...incompleteSubs, ...canceledSubs]) {
      try {
        await stripe.subscriptions.cancel(sub.id);
      } catch (err) {
        console.error(`Failed to cancel subscription ${sub.id}:`, err);
      }
    }

    // Retrieve the price to get details
    const price = await stripe.prices.retrieve(priceId)

    // Calculate total amount (for informational purposes only)
    const unitAmount = price.unit_amount || 0
    const totalAmount = unitAmount * quantity

    console.log(`Unit price: ${unitAmount / 100}, Quantity: ${quantity}, Total: ${totalAmount / 100}`)

    // Create subscription using the existing price ID
    const subscription = await stripe.subscriptions.create({
      customer,
      items: [
        {
          price: priceId,
          quantity,
        },
      ],
      payment_behavior: 'default_incomplete' as Stripe.SubscriptionUpdateParams.PaymentBehavior,
      payment_settings: {
        payment_method_types: ['card' as Stripe.SubscriptionUpdateParams.PaymentSettings.PaymentMethodType],
      },
      expand: ["latest_invoice.payment_intent"],
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({
      clientSecret: paymentIntent?.client_secret,
      subscriptionId: subscription.id,
      customerId: customer,
      amount: invoice.amount_due,
      unitAmount: unitAmount / 100,
      quantity,
      totalAmount: totalAmount / 100,
    })
  } catch (error) {
    console.error("Subscription error", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment failed" }, { status: 500 })
  }
}
