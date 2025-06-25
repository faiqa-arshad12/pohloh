"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useSignIn, useClerk} from "@clerk/nextjs";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";

import {Input} from "@/components/ui/input";
import {Lock, Eye, EyeOff, Key} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loader from "../shared/loader";
import {ShowToast} from "../shared/show-toast";

const formSchema = z
  .object({
    code: z.string().min(6, "Must be 6 digits").max(6, "Must be 6 digits"),
    password: z
      .string()
      .min(8, "Minimum length is 8 characters")
      .max(256, "Password must not exceed 256 characters"),
    confirmPassword: z
      .string()
      .min(8, "Minimum length is 8 characters")
      .max(256, "Password must not exceed 256 characters"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const {signIn} = useSignIn();
  const {signOut} = useClerk();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setError("");
    try {
      // Use the code from form input instead of URL params
      await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: values.code,
        password: values.password,
      });

      // Sign out current session
      await signOut();
      ShowToast("password reset successfully");

      // Redirect to login
      router.push("/login");
    } catch (err) {
      console.log(err);

      setError(
        "Failed to reset password. Please check the code and try again."
      );
      ShowToast(
        "Failed to reset password. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center lg:items-end text-white h-full rounded-2xl lg:max-h-screen">
      <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Verification Code Field */}
            <FormField
              control={form.control}
              name="code"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="mb-1">Verification Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                      <Input
                        type="text"
                        placeholder="6-digit code"
                        maxLength={6}
                        className="w-full h-[44px] pl-10 pr-4 py-[12px] rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full h-[44px] pl-10 pr-10 py-[12px] rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-gray-400"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="w-full h-[44px] pl-10 pr-10 py-[12px] rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-gray-400"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer h-[48px]"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6 text-black cursor-pointer"
              disabled={loading}
            >
              {loading ? <Loader /> : "Reset Password"}
            </Button>
          </form>
        </Form>

        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

        <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10 rounded-b-2xl" />
      </div>
    </div>
  );
}
