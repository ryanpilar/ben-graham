
import React from 'react';
import { db } from '@/db';
import PdfRenderer from '@/components/pdf/PdfRenderer';
import ChatWrapper from '@/components/chat/FileChatWrapper';
import { cookies } from "next/headers";
import { notFound, redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';



/** ================================|| Single File ||=================================== **/


interface PageProps {
  params: {
    fileid: string
  }
}

const File = async ({ params }: PageProps) => {

  const { fileid } = params;
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user || !user.id) redirect(`/auth-callback?origin=files/${fileid}`);

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      kindeId: user.id
    }
  });

  if (!file) notFound();

  // Handle caching of resizable handles
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  let defaultCollapsed;

  if (collapsed?.value === undefined || collapsed?.value === "undefined") {
    defaultCollapsed = false;

  } else {

    try {
      defaultCollapsed = JSON.parse(collapsed.value);
    } catch (error) {
      console.error("Error parsing collapsed value:", error);
      defaultCollapsed = false;
    }
  }

  let defaultLayout;

  try {
    defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  } catch (error) {
    console.error("Error parsing layout value:", error);
    defaultLayout = undefined;
  }

  const LeftView = () => {
    return (
      <div className='flex-1 xl:flex'>
        <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>

          <PdfRenderer url={file.url} />

        </div>
      </div>
    );
  };

  const RightView = () => {
    return (
      <>
        {/* ADJUSTABLE LAYOUT */}
        {/* <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:border-l lg:border-t-0'>
        <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} />
        <ChatWrapper fileId={file.id} />
      </div> */}

        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
          {/* <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
          <ChatWrapper fileId={file.id} />
        </div>
      </>
    );
  };

  return (
    <>
      {/* ADJUSTABLE LAYOUT */}
      {/* <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>

        <ResizableLayout
          accounts={accounts}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={7}
          // middle={<MiddleView />}
          leftView={<LeftView />}
          rightView={<RightView />}
        />
    </div> */}

      <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
        <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
          <LeftView />
          <RightView />
        </div>
      </div>

      {/* <SplitLayout
            leftChildren={<PdfRenderer url={file.url} />}
            rightChildren={<ChatWrapper type='file' researchKey={file.id} />}
        /> */}

    </>

  );
};

export default File
