

import { AppRouter } from '@/trpc'
import { inferRouterOutputs } from '@trpc/server'


/** ================================|| TRPC Message Type ||=================================== 

    TRPC advanced magic...
    First infer the type of data we get back from trpc, do this their 'type RouterOutput'

    The type of Messages that are returned from getFileMessages, that is the type we need to
    infer.

    We also have a loading message inside of our messages, and this does not render out a string
    as its text, but rather a jsx element, so we need to accomodate. And first we omit the 
    original message property.

    Import ExtendedText type wherever we render out a message

    By doing this, we can keep in line will full typescript benefits inside components where 
    this inferring is happening.

**/

type RouterOutput = inferRouterOutputs<AppRouter>   // Pass in the structure of our entire api structure, or the AppRouter in trpc

type Messages = RouterOutput['getFileMessages']['messages']

type OmitText = Omit<Messages[number], 'text'>      // We only want one single array element, not the whole list. 'text' property 
                                                    // is the value we want to omit. By default its string, but we want string and jsx element
type ExtendedText = {                               // This ExtendedText syntax, accomodates for both our message strings our jsx loader
  text: string | JSX.Element
}

// The result will be everything the original message has, but it will be either string or jsx element instead of just string
export type ExtendedMessage = OmitText & ExtendedText


