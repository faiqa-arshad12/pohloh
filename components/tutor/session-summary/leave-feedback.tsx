"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"

import Tag from "@/components/ui/tags" // Update the path if needed

type FeedbackFormValues = {
    comments: string
    tags: string[]
}

export default function FeedbackForm() {
    const [isOpen, setIsOpen] = useState(true)

    const form = useForm<FeedbackFormValues>({
        defaultValues: {
            comments: "",
            tags: ["Incorrect Information", "Outdated Content", "Uncleared Output"],
        },
    })

    const handleSubmit = (data: FeedbackFormValues) => {
        console.log("Submitted:", data)
        setIsOpen(false)
    }

    // const handleTagsChange = (tags: string[]) => {
    //     form.setValue("tags", tags)
    // }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden p-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-urbanist font-bold text-[32px] leading-[100%]">Feedback</h2>
                    <Button onClick={() => setIsOpen(false)} className="text-white bg-transparent hover:bg-transparent hover:text-gray-300">
                        <X size={24} className="text-[#e0c558]" />
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div>
                            <h3 className="text-[#f0d568] text-left font-urbanist font-normal text-[24px] leading-[100%] mb-4">Help us improve this learning path</h3>

                            {/* Tag Component */}
                            <Tag
                                initialTags={form.getValues("tags")}
                                // onTagsChange={handleTagsChange}
                                confirmBeforeAdd={false}
                                className="w-full"
                                classNameTag="bg-[#FFFFFF14] w-[200px] h-[34px] text-white px-3 rounded-sm flex items-center max-w-[calc(100%-32px)] font-urbanist font-normal text-[18px] leading-[24px] tracking-[0px] align-middl"
                                classNameTagRemove="w-[10.5px] h-[10.5px] text-lg text-[#F9DB6F] bg-transparent hover:bg-transparent"
                                classNameAddTag="hidden"
                                showAddTagButton={false}
                            />

                        </div>

                        <FormField
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white font-urbanist font-normal text-[18px] leading-[24px] tracking-[0px] align-middle">Tell Us More (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum"
                                            className="w-full bg-[#2a2a2a] border-0 text-gray-300 resize-none h-32 rounded-lg"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="bg-[#333333] hover:bg-[#333333] text-white border border-white hover:border-white hover:text-white rounded-[8px] px-8 py-2 h-[48px] font-urbanist font-medium text-[14px] leading-[100%] tracking-[0]"                  >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#f0d568] hover:bg-[#e0c558] text-black  rounded-[8px] px-8 py-2 h-[48px] font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] "
                            >
                                Submit Request
                            </Button>
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    )
}
