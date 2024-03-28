import React from 'react'
// Project Imports
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import TranslucentGlowBGLayer from '@/components/TranslucentGlowBGLayer';
// 3rd Party Imports
import Link from "next/link";
import Image from 'next/image';
// Styles
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button';


/** ================================|| Home ||=================================== **/

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className='flex flex-col justify-center items-center mb-12 mt-28 sm:mt-40 text-center'>
        <div className={`
          flex max-w-fit items-center justify-center 
          space-x-2 mx-auto mb-4 px-7 py-2 overflow-hidden 
          rounded-full border border-gray-200 bg-white 
          shadow-md backdrop-blur transition-all 
          hover:border-gray-300 hover:bg-white/50
          `
        }>

          <p className='text-sm font-semibold text-gray-700'>Ben-G now public</p>

        </div>
        <h1 className='max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl'>
          Chat with your{' '}
          <span className='text-blue-600'>documents</span>{' '}
          in seconds.
        </h1>

        <p className='mt-5 max-w-prose text-zinc-700 sm:text-lg'>
          Ben-G allows you to have conversations with any
          PDF document. Simply upload your file and start
          asking questions right away.
        </p>

        {/* NOTE: /dashboard is a protected route, and will redirect to a login page if the user is not signed in */}
        <Link
          className={buttonVariants({
            size: 'lg',
            className: 'mt-5',
          })}
          href='/dashboard'
          target='_blank'
        >
          Get started{' '}
          <ArrowRight className='h-5 w-5 ml-2' />
        </Link>
      </MaxWidthWrapper>

      <div className='relative isolate'>
        <TranslucentGlowBGLayer />

        {/* LARGE IMAGE */}
        <section>
          <div className='mx-auto max-w-6xl px-6 lg:px-8'>
            <div className='mt-16 flow-root sm:mt-24'>
              <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
                <Image
                  src='/dashboard-preview.jpg'
                  alt='product preview'
                  width={1364}
                  height={866}
                  quality={100}
                  className='rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
                />
              </div>
            </div>
          </div>
        </section>

        <TranslucentGlowBGLayer leftOffset={{ base: '-13rem', sm: '-36rem' }} />
      </div>

      {/* FEATURE SECTION */}
      <div className='mx-auto mb-32 mt-32 max-w-5xl sm:mt-56'>
        <div className='mb-12 px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl sm:text-center'>
            <h2 className='mt-2 font-bold text-4xl text-gray-900 sm:text-5xl'>
              Start chatting in minutes
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Chatting to your PDF files has never been
              easier than with Quill.
            </p>
          </div>
        </div>

        {/* FEATURE LIST */}
        <FeatureList features={features} />

        {/* LARGE IMAGE #2 */}
        <div className='mx-auto max-w-6xl px-6 lg:px-8'>
          <div className='mt-16 flow-root sm:mt-24'>
            <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
              <Image
                src='/file-upload-preview.jpg'
                alt='uploading preview'
                width={1419}
                height={732}
                quality={100}
                className='rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** ================================|| Feature Item ||=================================== **/

export interface FeatureItemProps {
  step: string;
  title: string;
  description: JSX.Element; // Allows embedding React components, such as Link.
}

const FeatureItem: React.FC<FeatureItemProps> = ({ step, title, description }) => {
  return (
    <li className='md:flex-1'>
      <div className='flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4'>
        <span className='text-sm font-medium text-blue-600'>
          {step}
        </span>
        <span className='text-xl font-semibold'>
          {title}
        </span>
        <span className='mt-2 text-zinc-700'>
          {description}
        </span>
      </div>
    </li>
  );
}

/** ================================|| Feature List ||=================================== **/

const features: FeatureItemProps[] = [
  {
    step: 'Step 1',
    title: 'Sign up for an account',
    description: (
      <span>
        Either starting out with a free plan or choose our{' '}
        <Link href='/pricing' className='text-blue-700 underline underline-offset-2'>
          pro plan
        </Link>.
      </span>
    ),
  },
  {
    step: 'Step 2',
    title: 'Upload your PDF file',
    description: (
      <span>
        We&apos;ll process your file and make it ready for you to chat with.
      </span>
    ),
  },
  {
    step: 'Step 3',
    title: 'Start asking questions',
    description: (
      <span>
        It&apos;s that simple. Try out Ben-G.ai today - it really takes less than a minute.
      </span>
    ),
  },
]
export interface FeatureListProps {
  features: FeatureItemProps[];
}
const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  return (
    <ol className='m-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0'>
      {features.map((feature, index) => (
        <FeatureItem key={index} {...feature} />
      ))}
    </ol>
  );
};

