import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase/client'

// Use a placeholder if no key is provided yet
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any,
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { items, orderId, customerEmail } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            // Simulate success for testing if no key is provided
            console.warn('No STRIPE_SECRET_KEY provided, simulating success.')
            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderId}` })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customerEmail,
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'cop',
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [],
                    },
                    unit_amount: Math.round(item.price), // COP is a zero-decimal currency in Stripe
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
            metadata: {
                orderId: orderId
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
