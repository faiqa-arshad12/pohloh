"use client";
import * as React from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
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
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {inviteUser} from "@/actions/auth";
import Loader from "@/components/shared/loader";
import {ShowToast} from "@/components/shared/show-toast";
// import {auth} from "@clerk/nextjs/server";

const formSchema = z.object({
  seatType: z.enum(["admin", "user"]),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email must not exceed 256 characters"),
});

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  className?: string;
}

export function InviteUserModal({
  open,
  onOpenChange,
  className,
}: InviteUserModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seatType: "user",
      email: "",
    },
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // const {userId} = await auth();
      const response: any = await inviteUser(values.email, values.seatType, "");
      if (response?.success) {
        ShowToast(response?.message || "User invited successfully", "success");
        onOpenChange(false);
        form.reset();
      } else {
        ShowToast(response?.message || "Failed to invite user", "error");
      }
    } catch (error) {
      console.error("Invite failed:", error);
      ShowToast("Something went wrong while inviting the user.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none ${className} bg-[#0E0F11] !rounded-xl`}
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <DialogTitle className="text-[32px]">Invite User</DialogTitle>
          <div>
            <p className="text-[#828282] font-urbanist font-normal text-[14px] mb-2 mt-[-5px]">
              Invite more users to get in this platform.
            </p>
            <div className="bg-[#828282] h-[1px]" />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-5"
          >
            {/* Seat Type Field */}
            <FormField
              control={form.control}
              name="seatType"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-[16px] text-white">
                    Seat type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#2A2A2C] w-full border-none text-white placeholder:text-gray-400 h-[44px] cursor-pointer">
                        <SelectValue placeholder="Select seat type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black text-white">
                      <SelectItem value="admin">Admin</SelectItem>
                      {/* <SelectItem value="editor">Editor</SelectItem> */}
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="block font-urbanist font-normal text-[16px] text-white">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email"
                      className="bg-[#2A2A2C] border-none text-white placeholder:text-gray-400 h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/2 border border-[#828282] text-white hover:bg-[#2A2A2C] bg-transparent h-[48px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-1/2 bg-[#F9E36C] text-black h-[48px] cursor-pointer"
              >
                {isLoading ? <Loader /> : " Invite user"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
