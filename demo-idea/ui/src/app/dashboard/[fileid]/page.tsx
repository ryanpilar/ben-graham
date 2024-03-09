
import React from 'react'
// Project Imports
// 3rd Party Imports
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import PdfRenderer from '@/components/PdfRenderer';
// Styles

/** ================================|| File ||=================================== **/

interface PageProps {
    params: {
        fileid: string
    }
}

const File = async ({ params }: PageProps) => {

    // retrieve the file id
    const { fileid } = params
    // Check kinde auth
    
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`)
    
    // Make db call
    const file = await db.file.findFirst({
        where: {
            id: fileid,
            kindeId: user.id
        }
    })

    if (!file) notFound() // nextjs helps us throw a 404 error

    return (
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
        {/* Left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
            {/* Main area */}
            {/* <PdfRenderer url={file.url} /> */}
            <PdfRenderer  />

          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          {/* <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
        </div>
      </div>
    </div>
    );
};

export default File;
