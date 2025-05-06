import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
     //@ts-expect-error: have some error with types
     apiVersion: '2024-12-18.acacia',
});


export async function GET() {
  try {
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });
    const plans = products.data.map(product => {
      const productPrices = prices.data
        .filter(price => price.product === product.id)
        .map(price => ({
          id: price.id,
          interval: price.recurring?.interval,
          amount: price.unit_amount! / 100,
          currency: price.currency,
        }));

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        prices: productPrices,
      };
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}