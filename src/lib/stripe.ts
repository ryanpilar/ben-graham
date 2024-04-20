import { PLANS } from '@/config/stripe'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Stripe from 'stripe'


/** ================================|| Stripe ||=================================== 

    To see if the user is subscribed or not, and return communicating data
**/

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2023-10-16',
    typescript: true,
})

export async function getUserSubscriptionPlan() {

    // Get the current user, whoever is logged in
    const { getUser } = getKindeServerSession()
    const kindeUser = await getUser()

    // If not a user yet, return null and false to indicate that this user is not subscribed
    if (!kindeUser?.id) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null,
        }
    }
    const dbUser = await db.user.findFirst({
        where: {
            id: kindeUser?.id,
        },
    })

    // Go into the db to see if we have entries for this user, or if theres no records, return with false and null
    if (!dbUser) {
        console.log('no dbUser FOUND!');

        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            stripeCurrentPeriodEnd: null,
        }
    }

    // Are they on the plus plan or not?
    const isSubscribed = Boolean(
        dbUser.stripePriceId &&
        dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
        dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    )

    const plan = isSubscribed ? PLANS.find( (plan) => plan.price.priceIds.test === dbUser.stripePriceId )
        : null

    // Has the user cancelled their plan?
    let isCanceled = false
    if (isSubscribed && dbUser.stripeSubscriptionId) {
        const stripePlan = await stripe.subscriptions.retrieve(
            dbUser.stripeSubscriptionId
        )
        isCanceled = stripePlan.cancel_at_period_end
    }

    return {
        ...plan,
        stripeSubscriptionId: dbUser.stripeSubscriptionId,
        stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
        stripeCustomerId: dbUser.stripeCustomerId,
        isSubscribed,
        isCanceled,
    }
}