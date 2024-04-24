import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

export async function POST(request: Request) {

  const body = await request.text()

  const signature = headers().get('Stripe-Signature') ?? ''     // First we check for the stripe signature                        

  let event: Stripe.Event

  try {
    // Then we validate that this event actually came from stripe because no user should be able to invoke this
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'
      }`,
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.kindeId) {

    return new Response(null, { status: 200, })
  }

  // If the user buys for the first time
  if (event.type === 'checkout.session.completed') {

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    await db.user.update({
      where: {
        id: session.metadata.kindeId, // Comes from /trpc/index/createStripeSession and see metadata
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })
  }

  // When there monthly plan renews
  if (event.type === 'invoice.payment_succeeded') {

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    const mongoUSer = await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    })   
  }
  // Send stripe a 200 so they know everything went ok
  return new Response(null, { status: 200 })
}