import React from 'react'

// 3rd Party Imports
import NotesForm from './NotesForm';
import { trpcServer } from '@/trpc/trpc-caller';

/** ================================|| Notes ||=================================== **/

interface NotesProps {
    researchKey: string
    type: 'project' | 'question' | 'file'
}

const Notes = async ({ researchKey, type }: NotesProps) => {

    const notes = await trpcServer.getNotes({ type: type, key: researchKey })
    const mainNote = notes.find(note => note.name === 'main note') || { id: 'someUUID', name: 'Blank Note', content: 'Nothing noted yet...' }

    return (
        <main className='mx-auto max-w-7xl'>

            <div className={`
                flex flex-col items-start justify-between gap-4
                sm:flex-row sm:items-center sm:gap-0 
                mt-2 sm:mt-8                  
                pb-2`}
            >
                <h1 className='mb-3 font-bold text-2xl lg:text-3xl text-gray-900'>
                    Notes
                </h1>
            </div>

            <NotesForm researchKey={researchKey} type={type} notes={mainNote} />

        </main>
    );
};

export default Notes;