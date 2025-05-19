import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET(request: Request) {
    try {
        const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
            apiVersion: "2025-02-24.acacia",
        })

        // Get customer ID from query params
        const { searchParams } = new URL(request.url)
        const customerId = searchParams.get("customerId")

        if (!customerId) {
            return NextResponse.json(
                { error: "Customer ID is required" },
                { status: 400 }
            )
        }

        // Fetch invoices for the customer
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: 100, // Adjust as needed
        })

        return NextResponse.json(invoices.data)
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return NextResponse.json(
            { error: "Failed to fetch invoices" },
            { status: 500 }
        )
    }
}
