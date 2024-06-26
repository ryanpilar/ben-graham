'use client'

// Project Imports
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from './ui/card'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import MaxWidthWrapper from './MaxWidthWrapper'
import { getUserSubscriptionPlan } from '@/lib/stripe'
// 3rd Party Imports
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

/** ================================|| Billing Form ||=================================== **/

interface BillingFormProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>> // Typescript trick: goes ahead and sees what does this getUser subscription plan output? What is the the return? Its a promise so we ne to be Awaited
}

const BillingForm = ({ subscriptionPlan, }: BillingFormProps) => {

    const { toast } = useToast()

    // This is the alternative page to the pricing page that will allow us to do a similar thing, which is buy subscriptions
    const { mutate: createStripeSession, isLoading } = trpc.createStripeSession.useMutation({
        onSuccess: ({ url }) => {
            if (url) window.location.href = url
            if (!url) {
                toast({
                    title: 'There was a problem...',
                    description: 'Please try again in a moment',
                    variant: 'destructive',
                })
            }
        },
    })

    return (
        <MaxWidthWrapper className='max-w-5xl'>
            <form
                className='mt-12'
                onSubmit={(e) => {
                    e.preventDefault()
                    createStripeSession()
                }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>
                            You are currently on the{' '}
                            <strong>{subscriptionPlan.name}</strong> plan.
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>

                        <Button type='submit'>
                            {isLoading ? (
                                <Loader2 className='mr-4 h-4 w-4 animate-spin' />
                            ) : null}
                            {subscriptionPlan.isSubscribed
                                ? 'Manage Subscription'
                                : 'Upgrade to PLUS+'}
                        </Button>

                        {subscriptionPlan.isSubscribed ? (
                            <p className='rounded-full text-xs font-medium'>
                                {subscriptionPlan.isCanceled
                                    ? 'Your plan will be canceled on '
                                    : 'Your plan renews on '}
                                {format(
                                    subscriptionPlan.stripeCurrentPeriodEnd!,
                                    'dd.MM.yyyy'
                                )}
                                .
                            </p>
                        ) : null}
                    </CardFooter>
                </Card>
            </form>
        </MaxWidthWrapper>
    )
}

export default BillingForm