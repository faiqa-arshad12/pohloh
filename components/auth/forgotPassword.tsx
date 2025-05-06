"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {useState} from "react";
import {useSignIn} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Mail} from "lucide-react";
import {useRouter} from "next/navigation";
import Loader from "../shared/loader";

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email must not exceed 256 characters"),
});

export function ForgotPassword() {
  const {signIn} = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError("");
    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: values.email,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/reset-password"); // Redirect to verify code page
      }, 2000);
    } catch (err: unknown) {
      //@ts-expect-error:something want wrong
      setError(err?.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center lg:items-end text-white h-full rounded-2xl">
      <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <div className="relative w-full h-[44px]">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Email"
                        className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full text-black"
              disabled={loading}
            >
              {loading ? <Loader /> : "Continue"}
            </Button>
          </form>
        </Form>

        {success && (
          <p className="mt-4 text-green-400">
            6 digits code has been sent to your email!
          </p>
        )}
        {error && <p className="mt-4 text-red-400">{error}</p>}

        <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></div>
      </div>
    </div>
  );
}
