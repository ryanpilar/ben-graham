'use client'
import React from 'react'
// Project Imports
import { Toggle } from './ui/toggle'
// 3rd Party Imports
import { type Editor } from '@tiptap/react'
import { Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Redo, Undo, Quote, Underline, LayoutList, AlignLeft, AlignCenter, AlignRight  } from 'lucide-react'




// Styles

/** ================================|| Toolbar ||=================================== **/

type ToolbarProps = {
    editor: Editor | null
}
const Toolbar = ({ editor }: ToolbarProps) => {

    if (!editor) { return null }

    return (
        <div className='border-input bg-transparent rounded-sm'>
            <Toggle
                size='sm'
                pressed={editor.isActive('heading')}
                onPressedChange={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
            >
                <Heading2 className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive('bold')}
                onPressedChange={() =>
                    editor.chain().focus().toggleBold().run()
                }
            >
                <Bold className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive('italic')}
                onPressedChange={() =>
                    editor.chain().focus().toggleItalic().run()
                }
            >
                <Italic className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive('strike')}
                onPressedChange={() =>
                    editor.chain().focus().toggleStrike().run()
                }
            >
                <Strikethrough className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive('bulletList')}
                onPressedChange={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
            >
                <List className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive('orderedList')}
                onPressedChange={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
            >
                <ListOrdered className='h-4 w-4' />
            </Toggle>

            <Toggle
                size='sm'
                pressed={editor.isActive("taskList")}
                onPressedChange={() =>
                    editor.chain().focus().toggleTaskList().run()
                }
            >
                <LayoutList className='h-4 w-4' />
            </Toggle>


            <Toggle
                size='sm'
                pressed={editor.isActive("underline")}
                onPressedChange={() =>
                    editor.chain().focus().toggleUnderline().run()
                }
            >
                <Underline className='h-4 w-4' />
            </Toggle>

            {/* <Toggle
                size='sm'
                pressed={editor.isActive("blockquote")}
                onPressedChange={() =>
                    editor.chain().focus().toggleBlockquote().run()
                }
            >
                <Quote className='h-4 w-4' />
            </Toggle> */}

            <Toggle
                size='sm'
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign('left').run()
                }
            >
                <AlignLeft className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign('center').run()
                }
            >
                <AlignCenter className='h-4 w-4' />
            </Toggle>
            <Toggle
                size='sm'
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() =>
                    editor.chain().focus().setTextAlign('right').run()
                }
            >
                <AlignRight className='h-4 w-4' />
            </Toggle>

            <Toggle
                size='sm'
                pressed={editor.isActive("undo")}
                onPressedChange={() =>
                    editor.chain().focus().undo().run()
                }
            >
                <Undo className='h-4 w-4' />
            </Toggle>

            <Toggle
                size='sm'
                pressed={editor.isActive("redo")}
                onPressedChange={() =>
                    editor.chain().focus().redo().run()
                }
            >
                <Redo className='h-4 w-4' />
            </Toggle>

            

        </div>
    );
};

export default Toolbar;
