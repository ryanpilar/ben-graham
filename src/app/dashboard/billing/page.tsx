import React from 'react'
// Project Imports
import BillingForm from "@/components/BillingForm"
import { getUserSubscriptionPlan } from "@/lib/stripe"

/** ================================|| Billing Page ||=================================== **/

const BillingPage = async () => {
    
    const subscriptionPlan = await getUserSubscriptionPlan()

    return <BillingForm subscriptionPlan={subscriptionPlan} /> 
}

export default BillingPage;
