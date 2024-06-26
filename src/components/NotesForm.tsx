'use client'

import React from 'react'
// Project Imports
import Tiptap from './Tiptap';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// 3rd Party Imports
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/app/_trpc/client';
import { toast } from './ui/use-toast';

/** ================================|| Notes Form ||=================================== **/

export const notesFormSchema = z.object({
    notes: z.string().trim(),
})

interface NotesFormProps {
    researchKey: string
    type: 'project' | 'question' | 'file'
    notes: {
        id: string,
        name: string,
        content: string | null
    }
}

const NotesForm = ({ researchKey, type, notes }: NotesFormProps) => {

    const { mutate: updateNotes } = trpc.updateNotes.useMutation({
        onError: () => {
            toast({
                title: 'Error updating notes',
                description: 'Please try again',
                variant: 'destructive',
            });
        },
    })

    const form = useForm<z.infer<typeof notesFormSchema>>({
        resolver: zodResolver(notesFormSchema),
        mode: 'onChange',
        defaultValues: {
            notes: notes.content || '',
        }
    })

    function onSubmit(values: z.infer<typeof notesFormSchema>) {
        if (notes) {
            updateNotes({ noteId: notes.id, content: values.notes || '' })
        }
    }

    return (
        <>
            <Form  {...form}>
                <form key={`key-${type}-${researchKey}`} id={`id-${type}-${researchKey}`}
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField control={form.control} name='notes' render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Notes</FormLabel>
                            <FormControl>
                                <Tiptap notes={field.value} onChange={field.onChange} onFormSubmit={form.handleSubmit(onSubmit)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>
        </>
    );
};

export default NotesForm;