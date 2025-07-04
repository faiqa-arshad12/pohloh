"use client";

import {useState, useEffect} from "react";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {useUserHook} from "@/hooks/useUser";
import {apiUrl} from "@/utils/constant";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {createNotification} from "@/services/notification.service";
import Loader from "@/components/shared/loader";

type FeedbackFormValues = {
  comments: string;
  tags: string[];
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningPathId: string;
}

interface CustomTagListProps {
  tags: string[];
  onRemoveTag: (tagToRemove: string) => void;
}

const CustomTagList = ({tags, onRemoveTag}: CustomTagListProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="bg-[#FFFFFF33] h-[44px] text-[#FFFFFF] cursor-pointer text-white px-3 py-1 rounded-sm flex items-center font-urbanist font-normal text-[18px] leading-[24px] tracking-[0px]"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="ml-2 w-[10.5px] h-[10.5px] text-[24px] text-[#F9DB6F] bg-transparent hover:bg-transparent flex items-center justify-center p-0 cursor-pointer"
            aria-label={`Remove tag ${tag}`}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

const feedbackSchema = z.object({
  comments: z
    .string()
    .min(1, "Please enter a description")
    .max(500, "Comments cannot exceed 500 characters"),
  tags: z.array(z.string()).min(1, "Please select at least one tag"),
});

export default function FeedbackForm({
  isOpen,
  onClose,
  learningPathId,
}: FeedbackModalProps) {
  const {userData} = useUserHook();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    defaultValues: {
      comments: "",
      tags: ["Incorrect Information", "Outdated Content", "Uncleared Output"],
    },
    mode: "onChange",
    resolver: zodResolver(feedbackSchema),
  });

  // Add a key to force remount, and reset form on close
  // const dialogKey = isOpen ? `open-${learningPathId}` : "closed";

  // // Reset form on close
  // useEffect(() => {
  //   if (!isOpen) {
  //     form.reset({
  //       comments: "",
  //       tags: ["Incorrect Information", "Outdated Content", "Uncleared Output"],
  //     });
  //   }
  // }, [isOpen]);

  const handleSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: userData.id,
        org_id: userData.org_id,
        learning_path_id: learningPathId,
        tags: data.tags,
        feedback_text: data.comments,
      };

      const response = await fetch(`${apiUrl}/learning-path-feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      // FIX: Close modal immediately after successful submit
      // onClose();

      // Now do any further async work (notification, etc)
      try {
        const pathResponse = await fetch(
          `${apiUrl}/learning-paths/${learningPathId}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            // credentials: "include",
          }
        );

        if (!pathResponse.ok) {
          throw new Error("Failed to fetch learning path data");
        }

        const pathData = await pathResponse.json();
        const {learningPath} = pathData.path;
        if (
          learningPath &&
          learningPath.path_owner &&
          learningPath.path_owner.id
        ) {
          await createNotification({
            user_id: learningPath.path_owner.id,
            org_id: userData.org_id,
            message: `You have new feedback on your learning path: ${learningPath.title} by ${userData?.first_name}`,
            subtext: data.comments,
            // link: `/tutor/explore-learning-paths`,
            // link: null,
          });
        }
      } catch (notificationError) {
        console.error(
          "Failed to send feedback notification:",
          notificationError
        );
      }
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    form.setValue("tags", newTags, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog  open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-2xl h-[auto]"
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-[32px] font-bold">
              Feedback
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-2">
          <p className="text-[#F9DB6F] text-[24px]">
            Help us improve this learning path
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <CustomTagList
              tags={form.watch("tags")}
              onRemoveTag={handleRemoveTag}
            />

            <FormField
              name="comments"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-white font-urbanist font-normal text-[18px] leading-[24px] tracking-[0px] align-middle">
                    Tell Us More
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum"
                      className="w-full bg-[#2a2a2a] border-0 text-gray-300 resize-none h-32 rounded-[6px]"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-red-400 text-sm">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-between flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[210px] cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader />}
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
