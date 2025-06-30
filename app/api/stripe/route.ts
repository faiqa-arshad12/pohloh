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

        // Check if customer already has any active or incomplete subscription
        const existingSubscriptions = await stripe.subscriptions.list({
          customer: customer,
          status: "all",
          limit: 10,
        });

        const activeOrIncomplete = existingSubscriptions.data.find(
          s => s.status === "active" || s.status === "incomplete"
        );

        if (activeOrIncomplete) {
          if (activeOrIncomplete.status === "incomplete") {
            // Cancel the incomplete subscription before creating a new one
            await stripe.subscriptions.cancel(activeOrIncomplete.id);
            // Proceed to create a new subscription
          } else {
            // If active, block as before
            return NextResponse.json(
              {
                error: "You already have an active subscription. Please update or cancel your existing subscription before creating a new one.",
                existingSubscription: activeOrIncomplete.id,
                isExistingSubscriber: true,
                status: activeOrIncomplete.status,
              },
              { status: 409 }
            );
          }
        }
      } else {
        // Create new customer if none exists
        const newCustomer = await stripe.customers.create({ email })
        customer = newCustomer.id
      }
    } else if (!customer) {
      throw new Error("Customer ID or email required")
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
      payment_behavior: "default_incomplete",
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
