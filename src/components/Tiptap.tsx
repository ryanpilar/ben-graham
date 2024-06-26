'use client'

import React, { useEffect } from 'react'
// Project Imports
// 3rd Party Imports
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import Heading from '@tiptap/extension-heading'
import Underline from "@tiptap/extension-underline";
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
// import Document from '@tiptap/extension-document'
// import Paragraph from '@tiptap/extension-paragraph'
// import Text from '@tiptap/extension-text'
// import Blockquote from '@tiptap/extension-blockquote'
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import { useDebounce } from 'use-debounce'

/** ================================|| Tip Tap ||=================================== **/

interface TiptapProps {
    notes: string
    onChange: (richText: string) => void
    onFormSubmit: () => void
}
const Tiptap = ({ notes, onChange, onFormSubmit }: TiptapProps) => {

    // Initialize the Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Heading.configure({
                HTMLAttributes: {
                    class: 'text-xl font-bold',
                    levels: [2],
                }
            }),
            Underline,
            OrderedList.configure({
                HTMLAttributes: {
                    class: 'list-decimal pl-4',
                },
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-disc pl-4',
                },
            }),
            // Blockquote,
            TaskList.configure({
                HTMLAttributes: {
                    class: "not-prose pl-2",
                },
            }),
            TaskItem.configure({
                HTMLAttributes: {
                    class: "flex gap-x-2",
                },
                nested: true,
            }),
            ListItem.configure({
                HTMLAttributes: {
                    class: "px-2",
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Typography,
        ],
        content: notes,
        editorProps: {
            attributes: {
                class:
                    "border focus:outline-none focus:border-2 focus:ring-1 focus:border-primary rounded-none h-full min-h-[400px] border-input text-slate-800 text-default px-4 py-3 mt-0.5 disabled:cursor-not-allowed disabled:opacity-50",
            }
        },
        
        onUpdate({ editor }) {
            // convert it to what you need, getHTML()?, getTEXT(), getJSON()?
            const html = editor.getHTML()
            onChange(html)            
        },
    })

    const [debouncedEditor] = useDebounce(editor?.state.doc.content, 1000);

    useEffect(() => {
        if (debouncedEditor && onFormSubmit) {           
            onFormSubmit()
        }
    }, [debouncedEditor])  

    return (
        <div className='flex h-full w-full border-input rounded-none flex-col justify-stretch'>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default Tiptap;
