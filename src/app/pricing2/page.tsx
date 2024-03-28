import React from 'react'
// Project Imports
// 3rd Party Imports
// Styles

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { buttonVariants } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { PLANS } from '@/config/stripe'
import { cn } from '@/lib/utils'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
    ArrowRight,
    Check,
    HelpCircle,
    Minus,
} from 'lucide-react'
import Link from 'next/link'
import UpgradeButton from '@/components/UpgradeButton'

const pricingItems = [
    {
        plan: 'Free',
        tagline: 'For small side projects.',
        quota: 10,
        features: [
            {
                text: '5 pages per PDF',
                footnote:
                    'The maximum amount of pages per PDF-file.',
            },
            {
                text: '4MB file size limit',
                footnote:
                    'The maximum file size of a single PDF file.',
            },
            {
                text: 'Mobile-friendly interface',
            },
            {
                text: 'Higher-quality responses',
                footnote:
                    'Better algorithmic responses for enhanced content quality',
                negative: true,
            },
            {
                text: 'Priority support',
                negative: true,
            },
        ],
    },
    {
        plan: 'Plus',
        tagline: 'For larger projects with higher needs.',
        quota: PLANS.find((p) => p.slug === 'plus')!.quota,
        features: [
            {
                text: '25 pages per PDF',
                footnote:
                    'The maximum amount of pages per PDF-file.',
            },
            {
                text: '16MB file size limit',
                footnote:
                    'The maximum file size of a single PDF file.',
            },
            {
                text: 'Mobile-friendly interface',
            },
            {
                text: 'Higher-quality responses',
                footnote:
                    'Better algorithmic responses for enhanced content quality',
            },
            {
                text: 'Priority support',
            },
        ],
    },
    {
        plan: 'Plus',
        tagline: 'For larger projects with higher needs.',
        quota: PLANS.find((p) => p.slug === 'plus')!.quota,
        features: [
            {
                text: '25 pages per PDF',
                footnote:
                    'The maximum amount of pages per PDF-file.',
            },
            {
                text: '16MB file size limit',
                footnote:
                    'The maximum file size of a single PDF file.',
            },
            {
                text: 'Mobile-friendly interface',
            },
            {
                text: 'Higher-quality responses',
                footnote:
                    'Better algorithmic responses for enhanced content quality',
            },
            {
                text: 'Priority support',
            },
        ],
    },
]

/** ================================|| Pricing Page ||=================================== **/
const PricingPage = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    return (
        <>
            <MaxWidthWrapper className='mb-8 mt-24 text-center max-w-7xl'>

                <section className='mx-auto mb-10 sm:max-w-lg'>
                    <h1 className='text-6xl font-bold sm:text-7xl'>Pricing</h1>
                    <p className='mt-5 text-gray-600 sm:text-lg'>
                        Whether you&apos;re just trying out our service or need more, we&apos;ve got you covered.
                    </p>
                </section>

                <div className='pt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3'>
                    <TooltipProvider>
                        {pricingItems.map((item) => {
                            const price = PLANS.find((p) => p.slug === item.plan.toLowerCase())?.price.amount || 0;
                            return (
                                <PricingPlans
                                    key={item.plan}
                                    plan={item.plan}
                                    tagline={item.tagline}
                                    quota={item.quota}
                                    features={item.features}
                                    price={price}
                                    user={user}
                                />
                            );
                        })}
                    </TooltipProvider>
                </div>

            </MaxWidthWrapper>
        </>
    );
};
export default PricingPage;

/** ================================|| Pricing Plans Container ||=================================== **/
interface Feature {
    text: string;
    footnote?: string;
    negative?: boolean;
}
interface PricingPlansProps {
    plan: string;
    tagline: string;
    quota: number;
    features: Feature[];
    price: number;
    user: any; // You might want to define a more specific type based on the user object structure
}
const PricingPlans: React.FC<PricingPlansProps> = ({ plan, tagline, quota, features, price, user }) => (
    <div className={cn('relative rounded-2xl bg-white shadow-lg', {
        'border-2 border-blue-600 shadow-blue-200': plan === 'Plus',
        'border border-gray-200': plan !== 'Plus',
    })}>
        {/* Plan Upgrade Banner */}
        {plan === 'Plus' && (
            <div className='absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white'>
                Upgrade now
            </div>
        )}
        {/* Plan Details */}
        <div className='p-5'>
            <h3 className='my-3 text-center font-display text-3xl font-bold'>{plan}</h3>
            <p className='text-gray-500'>{tagline}</p>
            <p className='my-5 font-display text-6xl font-semibold'>${price}</p>
            <p className='text-gray-500'>per month</p>
        </div>
        {/* Quota and Features */}
        <QuotaSection quota={quota} />
        <ul className='my-10 space-y-5 px-8'>
            {features.map((feature, index) => (
                <FeatureItem key={index} {...feature} />
            ))}
        </ul>
        {/* Call to Action */}
        <ActionSection plan={plan} user={user} />
    </div>
);
/** ================================|| Quota Section ||=================================== **/
interface QuotaSectionProps {
    quota: number;
}
const QuotaSection: React.FC<QuotaSectionProps> = ({ quota }) => (
    <div className='flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50'>
        <div className='flex items-center space-x-1'>
            <p>
                {quota.toLocaleString()} PDFs/mo included
            </p>
            <TooltipWithTrigger text="How many PDFs you can upload per month.">
                <HelpCircle className='h-4 w-4 text-zinc-500' />
            </TooltipWithTrigger>
        </div>
    </div>
);

/** ================================|| Feature Item ||=================================== **/
interface FeatureItemProps {
    text: string;
    footnote?: string;
    negative?: boolean;
}
const FeatureItem: React.FC<FeatureItemProps> = ({ text, footnote, negative }) => (
    <li className='flex text-left space-x-5'>
        <div className='flex-shrink-0'>
            {negative ? (
                <Minus className='h-6 w-6 text-gray-300' />
            ) : (
                <Check className='h-6 w-6 text-blue-500' />
            )}
        </div>
        {footnote ? (
            <div className='flex gap-x-1 '>
                <p className={cn('text-gray-600', { 'text-gray-400': negative })}>
                    {text}
                </p>
                <TooltipWithTrigger text={footnote}>
                    <HelpCircle className='h-4 w-4 text-zinc-500' />
                </TooltipWithTrigger>
            </div>

        ) : (
            <p className={cn('text-gray-600', { 'text-gray-400': negative })}>
                {text}
            </p>
        )}
    </li>
);
/** ================================|| CTA ||=================================== **/

interface ActionSectionProps {
    plan: string;
    user: any; // Again, consider defining a more specific type
}

const ActionSection: React.FC<ActionSectionProps> = ({ plan, user }) => (
    <div className='p-5'>
        {plan === 'Free' ? (
            <Link
                href={user ? '/dashboard' : '/sign-in'}
                className={buttonVariants({
                    className: 'w-full',
                    variant: 'secondary',
                })}>
                {user ? 'Upgrade now' : 'Sign up'}
                <ArrowRight className='h-5 w-5 ml-1.5' />
            </Link>
        ) : user ? (
            <UpgradeButton />
        ) : (
            <Link
                href='/sign-in'
                className={buttonVariants({
                    className: 'w-full',
                })}>
                Sign up
                <ArrowRight className='h-5 w-5 ml-1.5' />
            </Link>
        )}
    </div>
)

/** ================================|| Tooltip w/ Trigger ||=================================== **/

interface TooltipWithTriggerProps {
    text: string;
    children: React.ReactNode;
}
const TooltipWithTrigger: React.FC<TooltipWithTriggerProps> = ({ children, text }) => (
    <Tooltip delayDuration={300}>
        <TooltipTrigger className='cursor-default ml-1.5'>
            {children}
        </TooltipTrigger>
        <TooltipContent className='w-80 p-2'>
            {text}
        </TooltipContent>
    </Tooltip>
);