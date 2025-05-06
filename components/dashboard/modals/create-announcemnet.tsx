"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type RenewSubscriptionProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};

type FormData = {
  title: string;
  description: string;
  teams: string;
  expiryDate: string;
};

function CreateAnnouncement({ open, onClose }: RenewSubscriptionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      teams: "",
      expiryDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(); // reset form when modal opens
    }
  }, [open, form]);

  const handleIconClick = () => {
    inputRef.current?.showPicker?.();
  };

  const handleClose = () => {
    onClose(false);
  };

  const onSubmit = (data: FormData) => {
    router.replace("/settings?page=2");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Create Announcement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Title"
                      className="w-full h-[44px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter Description"
                      className="w-full min-h-[80px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teams */}
            <FormField
              control={form.control}
              name="teams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Team’s to Notify</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Teams"
                      className="w-full h-[44px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <input
                        {...field}
                        ref={inputRef}
                        type="date"
                        className="w-full h-[44px] pr-10 px-3 rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold appearance-none
                          [&::-webkit-calendar-picker-indicator]:appearance-none
                          [&::-webkit-calendar-picker-indicator]:invisible
                          [&::-webkit-calendar-picker-indicator]:w-0
                          [&::-webkit-calendar-picker-indicator]:h-0"
                      />
                      <Calendar
                        size={18}
                        onClick={handleIconClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full h-[48px] rounded-md border border-white text-white font-urbanist font-semibold hover:bg-[#F9DB6F1a] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full h-[48px] rounded-md bg-[#F9DB6F] text-black font-urbanist font-semibold hover:opacity-90 transition"
              >
                Create Announcement
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAnnouncement;
