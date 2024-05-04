import React from 'react'

/** ================================|| Split Layout ||=================================== **/

interface SplitLayoutProps {
    leftChildren: React.ReactNode
    rightChildren: React.ReactNode
}
const SplitLayout = ({leftChildren, rightChildren}: SplitLayoutProps) => {
    return (
        <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
            <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>

                {/* LEFT SIDE */}
                <div className='flex-1 xl:flex'>
                    <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                        <div className='mx-auto max-w-7xl xl:p-10'>

                            {leftChildren}

                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0 '>

                    {rightChildren}

                </div>
            </div>
        </div>
    );
};

export default SplitLayout;
