import React from 'react'
// Project Imports
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
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
          Quill allows you to have conversations with any
          PDF document. Simply upload your file and start
          asking questions right away.
        </p>

        {/* /dashboard is a protected route, and will redirect to a login page if the user is not signed in */}
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
      <div>
        <div className='relative isolate'>
          <div
            aria-hidden='true'
            className='absolute pointer-events-none  inset-x-0 -top-40 sm:-top-80 -z-10 transform-gpu overflow-hidden blur-3xl '>

            <div
              style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
              className={`
                  relative 
                  left-[calc(50%-11rem)] sm:left-[calc(50%-30rem)] 
                  w-[36.125rem] sm:w-[72.1875rem] aspect-[1155/678] 
                  -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30                    
                  `} />
          </div>
        </div>
      </div>

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
