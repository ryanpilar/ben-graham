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
          target='_blank'>
          Get started{' '}
          <ArrowRight className='h-5 w-5 ml-2' />
        </Link>

      </MaxWidthWrapper>

      {/* TRANSLUCENT BG WAVY THING */}
      <TranslucentGlowBGLayer />
      {/* LARGE IMAGE */}
      <div>
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
      </div>

    </>
  );
}
