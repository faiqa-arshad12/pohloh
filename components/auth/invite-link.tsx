"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
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
import {Lock, Eye, EyeOff} from "lucide-react";
import {useState, useEffect} from "react";
import {useSignUp, useUser} from "@clerk/nextjs";
import {useSearchParams, useRouter} from "next/navigation";
import {ShowToast} from "../shared/show-toast";
import Loader from "../shared/loader";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum length is 8 characters")
      .max(256, "Password must not exceed 256 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SignupForm() {
  const {user} = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("__clerk_ticket");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {isLoaded, signUp, setActive} = useSignUp();

  // Handle signed-in users visiting this page
  useEffect(() => {
    if (user?.id) {
      router.push("/");
    }
  }, [user, router]);

  // If there is no invitation token, restrict access to this page
  if (!token) {
    return (
      <div className="flex flex-col justify-center items-center lg:items-end text-white h-full lg:min-h-screen rounded-2xl">
        <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">
          <p className="text-white text-center">No invitation token found.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      const signUpAttempt = await signUp.create({
        strategy: "ticket",
        ticket: token,
        password: values.password,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({session: signUpAttempt.createdSessionId});
        ShowToast("Password has been set successfully!");
        router.push("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        ShowToast("Please complete the sign-up process", "success");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      ShowToast(err.errors?.[0]?.message || "Sign up failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center lg:items-end text-white h-full rounded-2xl">
      <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({field}) => {
                const togglePasswordVisibility = () => {
                  setShowPassword((prev) => !prev);
                };

                return (
                  <FormItem>
                    <FormLabel className="font-normal text-base leading-6 align-middle">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative w-full h-[44px]">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <p className="text-sm mt-1 text-secondary">
                      Minimum length is 8 characters.
                    </p>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({field}) => {
                const toggleConfirmPasswordVisibility = () => {
                  setShowConfirmPassword((prev) => !prev);
                };

                return (
                  <FormItem>
                    <FormLabel className="font-normal text-base leading-6 align-middle">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative w-full h-[44px]">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <Button
              type="submit"
              className="w-full text-black cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <Loader /> : "Set Password"}
            </Button>
          </form>
        </Form>

        <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10 rounded-b-2xl" />
      </div>
    </div>
  );
}