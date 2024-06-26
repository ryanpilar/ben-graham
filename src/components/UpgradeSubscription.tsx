"use client"
// Project Imports
import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
// 3rd Party Imports
import { trpc } from '@/app/_trpc/client'

/** ================================|| Upgrade Button ||=================================== 

    When the button is clicked, we want to create a checkout session so the user can buy
    there upgrades.


**/

const UpgradeSubscription = () => {

      const {mutate: createStripeSession} = trpc.createStripeSession.useMutation({
        onSuccess: ({url}) => {
          window.location.href = url ?? "/billing"
        }
      })

    return (
        <Button
            onClick={() => createStripeSession()}
            className='w-full'>
            Upgrade now <ArrowRight className='h-5 w-5 ml-1.5' />
        </Button>
    )
}

export default UpgradeSubscription