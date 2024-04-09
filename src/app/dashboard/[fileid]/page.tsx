
import React from 'react'
// Project Imports
import { db } from '@/db';
import PdfRenderer from '@/components/PdfRenderer';
import ChatWrapper from '@/components/chat/ChatWrapper';
// 3rd Party Imports
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

import { ChevronLeft } from "lucide-react"
import GoBack from '@/components/GoBack';

/** ================================|| File ||=================================== **/

interface PageProps {
  params: {
    fileid: string
  }
}

const File = async ({ params }: PageProps) => {

  const { fileid } = params
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`)

  // Make DB call
  const file = await db.file.findFirst({
    where: {
      id: fileid,
      kindeId: user.id
    }
  })

  if (!file) notFound()

  return (
    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>


        {/* Left sidebar & main wrapper */}
        <div className='flex-1 xl:flex'>
          <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
          <GoBack />

            {/* Main area */}
            <PdfRenderer url={file.url} />
          </div>
        </div>

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          {/* <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
          <ChatWrapper fileId={file.id} />

        </div>
      </div>
    </div>
  );
};

export default File;
