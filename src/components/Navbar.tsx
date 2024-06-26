import React from 'react'
// Project Imports
import Link from 'next/link';
import { buttonVariants } from './ui/button';
import MaxWidthWrapper from './MaxWidthWrapper';
// 3rd Party Imports
import { ArrowRight } from 'lucide-react';
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import UserAccountNav from './UserAccountNav';
import MobileNav from './MobileNav';

/** ================================|| Navbar ||=================================== **/

const Navbar = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    return (
        <nav className='sticky h-14 inset-x-0 top-0 z-40 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
            <MaxWidthWrapper>
                <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
                    <Link
                        href='/'
                        className='flex z-40 font-semibold'>
                        <span>ben-g.</span>
                    </Link>

                    <MobileNav isAuth={!!user} />

                    <div className='hidden items-center space-x-4 sm:flex'>
                        {!user ? (
                            <>
                                <Link
                                    href='/pricing'
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                    })}>
                                    Pricing
                                </Link>
                                <LoginLink
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                    })}>
                                    Sign in
                                </LoginLink>
                                <RegisterLink
                                    className={buttonVariants({
                                        size: 'sm',
                                    })}>
                                    Get started{' '}
                                    <ArrowRight className='ml-1.5 h-5 w-5' />
                                </RegisterLink>
                            </>
                        ) : (
                            <>

                                <Link
                                    href='/research'
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                    })}>
                                    Research
                                </Link>
                                <Link
                                    href='/files'
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                    })}>
                                    Files
                                </Link>

                                <UserAccountNav
                                    name={
                                        !user.given_name || !user.family_name ? 'Your Account'
                                            : `${user.given_name} ${user.family_name}`
                                    }
                                    email={user.email ?? ''}
                                    imageUrl={user.picture ?? ''}
                                />
                            </>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar