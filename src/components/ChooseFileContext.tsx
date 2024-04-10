// 3rd Party Imports
import Link from "next/link";
import { FileCheck2, HelpCircle } from "lucide-react";

// Project Imports
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { buttonVariants } from "./ui/button";
import { UploadedFileProps } from "./UploadFileDropzone";
import ChooseFileContextForm from "./ChooseFileContextForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpcServer } from "@/trpc/trpc-caller";
import { trpc } from "@/app/_trpc/client";
import { Dispatch, SetStateAction, Suspense } from "react";
import Skeleton from "react-loading-skeleton";

/** ================================|| Choose File Context ||=================================== **/

interface ChooseFileContextProps {
  uploadedFile?: UploadedFileProps | {}
}
const ChooseFileContext = ({ uploadedFile }: ChooseFileContextProps) => {



  return (
    <>
      <TooltipProvider>

        <div className='flex flex-col items-center justify-center h-full w-full px-6 sm:px-0'>
          <div className='flex flex-col items-center justify-center w-full h-full rounded-lg bg-gray-50 hover:bg-gray-100'>
            <div className='flex flex-col items-center justify-center pt-6 pb-1'>

              <FileCheck2 className='h-6 w-6 mb-3' />

              {uploadedFile ?
                <p className='text-sm text-zinc-700'>

                  <span className='font-semibold text-md'>
                    Upload Complete: <Link className={cn(buttonVariants({
                      variant: 'linkHover1',
                    }), 'pl-2')} href={uploadedFile.path}>{uploadedFile.fileName}</Link>
                  </span>

                </p>
                : null}
            </div>

            <div className='w-full max-w-xs mx-auto'>
              <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center'>
                <div className={`flex flex-wrap items-center justify-center text-sm text-zinc-700 text-center`}>

                  <section className="flex flex-wrap gap-x-2">
                    <Separator className='mb-5' />

                    <div>
                      Attach a file, or several, to a project, multiple projects, or questions.
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className='cursor-default ml-1.5 pt-1'>
                          <HelpCircle className='h-4 w-4 text-zinc-500 hover:text-blue-500' />
                        </TooltipTrigger>
                        <TooltipContent className='w-80 p-2'>
                          Put some helpful info about context here. You can come back to this step at anytime.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </section>

                  <section className="flex flex-row flex-wrap w-full justify-center gap-y-2 py-3">

                    <ChooseFileContextForm uploadedFile={uploadedFile} />

                  </section>

                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}
export default ChooseFileContext