'use client'
import React, { useState } from 'react'
// Project Imports
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// 3rd Party Imports
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '../ui/loading-button';
import { Input } from '../ui/input';
import Tiptap from './Tiptap';

// Styles

/** ================================|| Notes Form ||=================================== **/
export const notesFormSchema = z.object({
    notes: z.string().trim(),
})

const NotesForm = () => {

    // const [isSaving, setIsSaving] = useState(false)


    const form = useForm<z.infer<typeof notesFormSchema>>({
        resolver: zodResolver(notesFormSchema),
        mode: 'onChange',
        defaultValues: {
            notes: '',

        }
    })

    // function onSubmit(values: z.infer<typeof notesFormSchema>) {
        function onSubmit(values: any) {

        // Should I be considering dompurify when saving to a db???

        // setIsSaving(true)


        console.log('onSubmit', values);





        // setIsSaving(false)
    }

    return (
        <div className=''>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField control={form.control} name='notes' render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Notes</FormLabel>
                            <FormControl>
                                <Tiptap notes={field.name} onChange={field.onChange} onFormSubmit={form.handleSubmit(onSubmit)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {/* <div className='text-right mt-2'><LoadingButton type='submit' loading={isSaving}>Save</LoadingButton></div> */}
                </form>
            </Form>

        </div>
    );
};

export default NotesForm;
