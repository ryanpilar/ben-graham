
import Navbar from "@/components/Navbar";

import "./globals.css";
import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/toaster";
import { NUIProvider } from "@/components/providers/NUIProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata()

/** ================================|| Layout ||=================================== **/


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className="light">

      <Providers>
        <body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}>
          <NUIProvider>

            <Toaster />
            <Navbar />
            {children}

          </NUIProvider>
        </body>
      </Providers>

    </html>
  );
}
