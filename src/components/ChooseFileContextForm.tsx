'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { LoadingButton } from '@/components/ui/loading-button';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { Separator } from './ui/separator';
import { Button, buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { UploadedFileProps } from './UploadFileDropzone';


const OPTIONS: Option[] = [
  { label: 'nextjs', value: 'Nextjs' },
  { label: 'React', value: 'react' },
  { label: 'Remix', value: 'remix' },
  { label: 'Vite', value: 'vite' },
  { label: 'Nuxt', value: 'nuxt' },
  { label: 'Vue', value: 'vue' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Angular', value: 'angular' },
  { label: 'Ember', value: 'ember', disable: true },
  { label: 'Gatsby', value: 'gatsby', disable: true },
  { label: 'Astro', value: 'astro' },
];

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const FormSchema = z.object({
  projects: z.array(optionSchema).optional(),
  questions: z.array(optionSchema).optional(),
});


/** ================================|| Choose File Context Form ||=================================== **/

interface ChooseFileContextFormProps {
  uploadedFile: UploadedFileProps
}
const ChooseFileContextForm = ({ uploadedFile }: ChooseFileContextFormProps) => {

  const [loading, setLoading] = useState(false);
  const [userWantsContext, setUserWantsContext] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const router = useRouter()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { handleSubmit, setError, clearErrors, control, formState: { errors } } = form;

  function handleSelectorChange(value: any) {
    if (value && value.length > 0) {
      setSubmissionError('');
      clearErrors('projects')
      clearErrors('questions')
    }
  }

  function handleSkip() {
    setLoading(true)
    router.push(uploadedFile.path)
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {

    if ((!data?.projects || data?.projects?.length === 0) && (data?.questions?.length === 0 || !data?.questions)) {

      // No items in either array, set an error message
      setSubmissionError('To save, please add at least one project or question.');
      setError('projects', { type: "manual", message: "" }, { shouldFocus: true })
      setError('questions', { type: "manual", message: "" })

      return
    }

    setLoading(true);
    setSubmissionError('');
    clearErrors('projects')
    clearErrors('questions')

    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Your submitted data',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      });
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full text-left space-y-3 mb-4 px-6 sm:px-0">

        {userWantsContext ?
          <section>
            <FormField
              control={control}
              name="projects"
              render={({ field }) => (
                <FormItem className='pb-2 pt-3'>
                  <FormLabel className='text-default'>Add To Projects</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value}
                      // onChange={field.onChange}
                      onChange={(value) => {
                        field.onChange(value);
                        handleSelectorChange(value)
                      }}
                      defaultOptions={OPTIONS}
                      placeholder="Search your projects..."
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                      className={`bg-white ${errors.projects ? 'border-red-500' : ''}`}
                    />
                  </FormControl>
                  {errors.projects && <FormMessage className="text-red-500">{errors.projects.message}</FormMessage>}

                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="questions"
              render={({ field, fieldState: { error } }) => (
                <FormItem className='pb-1'>
                  <FormLabel htmlFor="projects-select" className='text-default'>Add To Questions</FormLabel>
                  <FormControl>
                    <MultipleSelector

                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        handleSelectorChange(value);
                      }}
                      defaultOptions={OPTIONS}
                      placeholder="Search your questions..."
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          no results found.
                        </p>
                      }
                      className={`bg-white ${errors.questions ? 'border-red-500' : ''}`}
                    />
                  </FormControl>
                  {errors.questions && <FormMessage className="text-red-500">{errors.questions.message}</FormMessage>}
                </FormItem>
              )}
            />

            {submissionError && <p className="text-red-500 text-center">{submissionError}</p>}

          </section> : null}

        <Separator className='mt-3' />

        <section className="flex w-full justify-center gap-3">
          {!userWantsContext ?
            <Button aria-label='add context' className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))} disabled={loading} onClick={() => setUserWantsContext(true)}>Add Context</Button>
            : null}
          {userWantsContext ?
            <LoadingButton aria-label='save' className={buttonVariants({ size: 'sm', variant: 'ghost' })} loading={loading} type='submit'>Save</LoadingButton>
            : null}
          <LoadingButton aria-label='skip' className={buttonVariants({ size: 'sm', variant: 'ghost' })} loading={loading} onClick={handleSkip}>Skip For Now</LoadingButton>
        </section>

      </form>
    </Form>
  );
};
export default ChooseFileContextForm;
