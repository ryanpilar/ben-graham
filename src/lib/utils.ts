import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/** ================================|| Absolute Url ||=================================== 
    
    Receives the path string and conditionally checks if we are on the client side or not.
    Client is totally fine with relative path. 
    Also checks for production server and local server and builds url accordingly.
    
**/

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}${path}` // Root URL that the app is deployed to
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

// export function constructMetadata({
//   title = "Quill - the SaaS for students",
//   description = "Quill is an open-source software to make chatting to your PDF files easy.",
//   image = "/thumbnail.png",
//   icons = "/favicon.ico",
//   noIndex = false
// }: {
//   title?: string
//   description?: string
//   image?: string
//   icons?: string
//   noIndex?: boolean
// } = {}): Metadata {
//   return {
//     title,
//     description,
//     openGraph: {
//       title,
//       description,
//       images: [
//         {
//           url: image
//         }
//       ]
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: [image],
//       creator: "@joshtriedcoding"
//     },
//     icons,
//     metadataBase: new URL('https://quill-jet.vercel.app'),
//     themeColor: '#FFF',
//     ...(noIndex && {
//       robots: {
//         index: false,
//         follow: false
//       }
//     })
//   }
// }