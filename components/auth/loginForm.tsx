"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {useAuth} from "@clerk/nextjs";
import {useEffect} from "react";

import {useState} from "react";
import {useSignIn} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
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
import {Checkbox} from "@/components/ui/checkbox";
import {Separator} from "@/components/ui/separator";
import {Mail, Lock, Eye, EyeOff} from "lucide-react";
import Image from "next/image";
import {ShowToast} from "../shared/show-toast";
import Loader from "../shared/loader";

// const formSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   remember: z.boolean().optional(),
// });
const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email must not exceed 256 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(256, "Password must not exceed 256 characters"),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const {isSignedIn} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "oauth_google" | "oauth_facebook" | "oauth_linkedin_oidc" | null
  >(null);
  const {isLoaded, signIn, setActive} = useSignIn();
  const signInWith = async (
    strategy: "oauth_google" | "oauth_facebook" | "oauth_linkedin_oidc"
  ) => {
    if (!isLoaded) return;
    setSocialLoading(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback", // make sure this route exists!
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      //@ts-expect-error:Authentication failed
      ShowToast(err.errors?.[0]?.message || "Authentication failed", "error");
      setSocialLoading(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: values.email.trim(),
        password: values.password,
      });

      if (result.status === "complete") {
        await setActive({session: result.createdSessionId});
        router.replace("/dashboard");
        ShowToast("Successfully logged in", "success");
      } else {
        ShowToast("Successfully logged in", "error");
      }
    } catch (err: unknown) {
      //@ts-expect-error : Invalid credentials
      ShowToast(err.errors?.[0]?.message || "Invalid credentials", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:justify-center items-center lg:items-end text-white lg:min-h-screen p-4">
      <div className="w-full max-w-md md:max-w-xl !p-12 sm:p-8 rounded-2xl shadow-xl backdrop-invert backdrop-opacity-10 relative">
        <h2 className="text-[14px] font-semibold text-center mb-4">
          Login with:
        </h2>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-8 w-full">
          {/* Google login button */}
          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[#FFFFFF] cursor-pointer"
            onClick={() => signInWith("oauth_google")}
            disabled={isLoading || socialLoading !== null}
          >
            {socialLoading === "oauth_google" ? (
              <Loader />
            ) : (
              <>
                <Image
                  alt="google"
                  src="/logo/google.svg"
                  width={16}
                  height={16}
                />
                <span>Google</span>
              </>
            )}
          </Button>

          {/* LinkedIn login button */}
          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[#FFFFFF] cursor-pointer"
            onClick={() => signInWith("oauth_linkedin_oidc")}
            disabled={isLoading || socialLoading !== null}
          >
            {socialLoading === "oauth_linkedin_oidc" ? (
              <Loader />
            ) : (
              <>
                <Image
                  alt="linkedin"
                  src="/logo/linkedin.svg"
                  width={16}
                  height={16}
                />
                <span>LinkedIn</span>
              </>
            )}
          </Button>

          {/* Facebook login button */}
          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[#FFFFFF] cursor-pointer"
            onClick={() => signInWith("oauth_facebook")}
            disabled={isLoading || socialLoading !== null}
          >
            {socialLoading === "oauth_facebook" ? (
              <Loader />
            ) : (
              <>
                <Image
                  alt="facebook"
                  src="/logo/facebook.svg"
                  width={16}
                  height={16}
                />
                <span>Facebook</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center my-6">
          <Separator className="flex-1 bg-[#FFFFFF14]" />
          <span className="px-4 font-normal text-sm leading-5 align-middle">
            Or
          </span>
          <Separator className="flex-1 bg-[#FFFFFF14]" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="font-normal text-base leading-6 align-middle">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full h-[44px]">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Username or email"
                        className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <div className="flex flex-col md:flex-row  justify-between items-center">
                    <FormLabel className="font-normal text-base leading-6 align-middle">
                      Password
                    </FormLabel>
                    <a
                      href="/forgot-password"
                      className="text-sm leading-5 font-normal align-middle text-primary hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <FormControl>
                    <div className="relative w-full h-[44px]">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full h-full pl-10 pr-10 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 cursor-pointer" />
                        ) : (
                          <Eye className="w-4 h-4 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember me */}
            <FormField
              control={form.control}
              name="remember"
              render={({field}) => (
                <FormItem className="flex items-center space-x-2 cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || socialLoading !== null}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="text-sm leading-5 font-normal align-middle !mt-0">
                    Remember Me
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-black cursor-pointer"
              disabled={isLoading || socialLoading !== null}
            >
              {isLoading ? <Loader /> : "Log In"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm font-normal leading-5 align-middle">
          <span className="font-normal">Do not have an account? </span>
          <a
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </a>
        </div>

        <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></div>
      </div>
    </div>
  );
}
