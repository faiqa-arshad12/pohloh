import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "editor", "viewer"]),
  seatType: z.enum(["design", "dev", "qa"]),
  team: z.enum(["design", "dev", "qa"]),
});

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { 
    name: string;
    role: string;
    seatType: string;
    team: string;
  }) => void;
  defaultValues?: {
    name: string;
    role: string;
    seatType: string;
    team: string;
  };
  title?: string;
  description?: string;
  className?: string;
}

export function EditUserModal({
  open,
  onOpenChange,
  onSave,
  className
}: EditUserModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-[32px]">Edit User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-base text-white">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter the user name"
                      className="bg-[#2A2A2C] border-none text-white placeholder:text-gray-400 h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Select */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-base text-white">
                    Select the Role
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-[#2A2A2C] text-white border-0 h-[44px]">
                        <SelectValue placeholder="Select the role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seat Type Select */}
            <FormField
              control={form.control}
              name="seatType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-base text-white">
                    Select the Seat Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-[#2A2A2C] text-white border-0 h-[44px]">
                        <SelectValue placeholder="Select the Team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Select */}
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-base text-white">
                    Assign to Team
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-[#2A2A2C] text-white border-0 h-[44px]">
                        <SelectValue placeholder="Select the Team" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/2 border bg-[#2A2A2C] border-[#828282] text-white hover:bg-[#2A2A2C] h-[48px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-1/2 bg-[#F9E36C] text-black hover:bg-[#f8d84e] h-[48px]"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}