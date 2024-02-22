import { Check, Loader2, X } from "lucide-react";
import { Button } from "./button";
import { useForm } from "react-hook-form";
import {z} from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTagSchema = z.object({
    title: z.string().min(3, {message: 'Minimum 3 characters.'}),
    slug: z.string(),
    
})

type CreateTagSchema = z.infer<typeof createTagSchema>

const getSlugFromString = (input: string) => {
    return input.normalize("NFD")//tira acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, '')//tudo que não são palavras
    .replace(/\s+/g, '-')//tudo que é espaço coloca ifen
}

export function CreateTagForm() {
    const queryClient = useQueryClient()
    
    const {register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
        resolver: zodResolver(createTagSchema)
    })
    
    
    const slug =  watch('title') ? 
    getSlugFromString( watch('title')) : ''

    const {mutateAsync} = useMutation({
        mutationFn: async ({title, slug}: CreateTagSchema) => {
            await new Promise(resolve => setTimeout(resolve, 2000))
        
            await fetch('http://localhost:3333/tags', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    slug,
                    amoutOfVideos: 0
                })
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-tags'],
                exact:false
            })
        }
    })
    const createTag = async ({ title }: CreateTagSchema ) => {
        await mutateAsync({title, slug})
    }
    return (
        <form 
        onSubmit={handleSubmit(createTag)}
        className="w-full space-y-6">
        <div className="space-y-2 ">
            <label className="text-sm font-medium block" htmlFor="title">Tag name</label>
            <input
            {...register('title')}
           
            className="
            bg-zinc-800/20 w-full
            border border-zinc-800 rounded-lg px-3 py-2.5 text-sm"
            id="name" type="text" />
            {formState.errors?.title && 
                <p className="text-sm text-red-400">{formState?.errors.title.message}</p>
            }
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium block" htmlFor="slug">Slug</label>
            <input 
            {...register('slug')}
            value={slug}
            className="
            bg-zinc-800/20 w-full
            border border-zinc-800 rounded-lg h-10 px-3 py-2.5 text-sm"
            id="slug" type="text" readOnly />
        </div>
         <div className="flex items-center justify-end gap-2">
            <Dialog.Close>
                <Button>
                    <X className="size-3"/>
                    Cancel
                </Button>
            </Dialog.Close>
            <Button
            disabled={formState.isSubmitting}
             className="bg-teal-400 text-teal-950" type="submit">
                {formState.isSubmitting ? <Loader2 className="size-3 animate-spin"/> : <Check className="size-3" />}
                Save
            </Button>
         </div>
        </form>
    )
}