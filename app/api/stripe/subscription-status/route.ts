import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  if (!customerId)
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
    expand: ["data.latest_invoice.payment_intent"],
  });
  if (!subs.data.length) return NextResponse.json({ status: "none" });

  const sub = subs.data[0];
  let clientSecret = null;
  if (
    sub.latest_invoice &&
    typeof sub.latest_invoice === "object" &&
    "payment_intent" in sub.latest_invoice
  ) {
    const invoice = sub.latest_invoice as Stripe.Invoice;
    if (
      invoice.payment_intent &&
      typeof invoice.payment_intent === "object" &&
      "client_secret" in invoice.payment_intent
    ) {
      clientSecret = (invoice.payment_intent as Stripe.PaymentIntent)
        .client_secret;
    }
  }

  const activeOrIncomplete = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.latest_invoice.payment_intent"],
  });
  console.log(activeOrIncomplete, "jkjkjkjjk");
  const existingSub = activeOrIncomplete.data.find(
    (s) => s.status === "active" || s.status === "incomplete"
  );

  if (existingSub) {
    if (existingSub.status === "incomplete") {
      const invoiceId =
        typeof existingSub.latest_invoice === "string"
          ? existingSub.latest_invoice
          : existingSub.latest_invoice?.id;
      if (invoiceId) {
        const invoice = await stripe.invoices.retrieve(invoiceId, {
          expand: ["payment_intent"],
        });
        if (
          invoice.payment_intent &&
          typeof invoice.payment_intent === "object" &&
          "client_secret" in invoice.payment_intent
        ) {
          clientSecret = invoice.payment_intent.client_secret;
        }
      }
      return NextResponse.json(
        {
          error:
            "You have an incomplete subscription. Please complete payment.",
          existingSubscription: existingSub.id,
          isExistingSubscriber: true,
          status: existingSub.status,
          clientSecret,
        },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription. Please update or cancel your existing subscription before creating a new one.",
          existingSubscription: existingSub.id,
          isExistingSubscriber: true,
          status: existingSub.status,
        },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({
    status: sub.status,
    plan: sub.items.data[0].price.id,
    interval: sub.items.data[0].price.recurring?.interval,
    quantity: sub.items.data[0].quantity,
    nextBillingDate: sub.current_period_end,
    clientSecret,
    subscriptionId: sub.id,
  });
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

// Add POST handler to allow frontend to trigger cleanup if needed
export async function POST(req: Request) {
  const { customerId } = await req.json();
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }
  await cancelAllIncompleteSubscriptions(customerId);
  return NextResponse.json({ message: "All incomplete subscriptions cancelled for customer." });
}
