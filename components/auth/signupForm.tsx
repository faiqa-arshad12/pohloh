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
import {Mail, Lock, CircleUserRound, Eye, EyeOff, IdCard} from "lucide-react";
import Image from "next/image";
import UserLeftIcon from "@/public/icons/user-left";
import UserRightIcon from "@/public/icons/user-right";
import {Separator} from "@/components/ui/separator";
import {useState} from "react";
import {useSignUp, useUser} from "@clerk/nextjs";
// import {useRouter} from "next/navigation";
import {ShowToast} from "../shared/show-toast";
import Loader from "../shared/loader";
import {Role} from "@/types/types";
import {apiUrl, frontend_url, nameRegex, usernameRegex, users} from "@/utils/constant";
import {UserStatus} from "@/types/enum";

// const formSchema = z.object({

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .regex(nameRegex, "First name must contain only letters"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters")
    .regex(nameRegex, "Last name must contain only letters"),

  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must not exceed 50 characters")
    .regex(usernameRegex, "Username must not contain spaces"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(256, "Email must not exceed 256 characters"),

  password: z
    .string()
    .min(8, "Minimum length is 8 characters")
    .max(256, "Password must not exceed 256 characters"),
});

export function SignupForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      username: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("owner");
  const [isLoading, setIsLoading] = useState(false);

  // const router = useRouter();
  const [socialLoading, setSocialLoading] = useState<
    "oauth_google" | "oauth_facebook" | "oauth_linkedin_oidc" | null
  >(null);
  const {isLoaded, signUp} = useSignUp();

  const submitProfile = async (id: string) => {
    try {
      console.log("user_id", IdCard);
      const values = form.getValues();

      const userData = {
        user_name: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        user_id: id,
        role: role,
      };

      const response = await fetch(`${apiUrl}/${users}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include", // Include credentials if needed
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create user: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("User created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        unsafeMetadata: {
          role: role,
          isProfileComplete: false,
          status: UserStatus.Pending,
          // add other metadata fields here
        },
        // username: values.username,
      });
      // await setActive({session: result.createdSessionId});
      const verifyemail = await signUp.prepareEmailAddressVerification({
        strategy: "email_link",
        redirectUrl: `${frontend_url}/owner/onboarding?role=${role}`, // replace this with your actual redirect URL
      });
      // signUp.update({
      //   unsafeMetadata: {
      //     role: role,
      //     isProfileComplete:false
      //   }
      // });
      // await setUserRole(result?.id||"", 'owner')
      // ShowToast("User created successfully!");
      // const { user } = useUser();
      // await submitProfile(user?.id as string);
      ShowToast("Verification email sent. Please check your inbox!");
      // router.push("/dashboard");
    } catch (err: unknown) {
      //@ts-expect-error:Sign up failed
      ShowToast(err.errors?.[0]?.message || "Sign up failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (
    provider: "oauth_google" | "oauth_facebook" | "oauth_linkedin_oidc"
  ) => {
    if (!isLoaded) {
      ShowToast("Authentication is still loading", "error");
      return;
    }
    try {
      setSocialLoading(provider);

      // First create the signup with initial metadata
      const signUpResult = await signUp.create({
        unsafeMetadata: {
          role: role,
          status: UserStatus.Pending,
          isProfileComplete: false,
          provider: provider,
          signupMethod: "social",
          signupDate: new Date().toISOString(),
        },
      });

      // Then authenticate with the provider
      await signUpResult.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${frontend_url}/owner/onboarding`,
        redirectUrlComplete: `${frontend_url}/owner/onboarding`,
      });
    } catch (err: unknown) {
      console.error("OAuth error:", err);
      //@ts-expect-error : Failed to authenticate with provider
      ShowToast(err.message || "Failed to authenticate with provider", "error");
      setSocialLoading(null);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center lg:items-end text-white h-full lg:min-h-screen rounded-2xl">
      <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">
        <h2 className="text-sm font-semibold text-center mb-4 hover:text-[white]">
          Register with:
        </h2>

        <div className="flex  flex-col md:flex-row  justify-center gap-2 mb-3 w-full">
          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[white] cursor-pointer"
            onClick={() => handleSocialSignup("oauth_google")}
            disabled={isLoading || !isLoaded}
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

          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[white] cursor-pointer"
            onClick={() => handleSocialSignup("oauth_linkedin_oidc")}
            type="button"
            disabled={isLoading || !isLoaded}
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
                <span>Linkedin</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1 flex h-[44px] items-center justify-center gap-2 py-2.5 px-8 rounded-[8px] bg-[#FFFFFF14] border border-[#FFFFFF14] text-white hover:bg-[#FFFFFF14] hover:border-[#FFFFFF14] hover:text-[white] cursor-pointer"
            onClick={() => handleSocialSignup("oauth_facebook")}
            type="button"
            disabled={isLoading || !isLoaded}
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

        <div className="flex items-center mb-2 ">
          <Separator className="flex-1 bg-[#FFFFFF14]" />
          <span className="px-4 font-normal text-sm leading-5 align-middle">
            Or
          </span>
          <Separator className="flex-1 bg-[#FFFFFF14]" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({field}) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-normal text-base leading-6 align-middle">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative w-full h-[44px]">
                        <UserLeftIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="First name"
                          className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <div className="h-[15px]">
                      {form.formState.errors.firstName ? (
                        <FormMessage />
                      ) : (
                        <></>
                      )}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({field}) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-normal text-base leading-6 align-middle">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative w-full h-[44px]">
                        <UserRightIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Last name"
                          className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="h-[15px]">
                      {form.formState.errors.lastName ? (
                        <FormMessage className="mt-0" />
                      ) : (
                        <></>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="font-normal text-base leading-6 align-middle">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full h-[44px]">
                      <CircleUserRound className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Username"
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
                        placeholder="johndoe.pholoh@gmail.com"
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
                          placeholder="Password"
                          className="w-full h-full pl-10 pr-4 py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 cursor-pointer" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 cursor-pointer" />
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
            <Button
              type="submit"
              className="w-full text-black cursor-pointer"
              disabled={isLoading || socialLoading !== null}
            >
              {isLoading ? <Loader /> : "Sign Up"}
            </Button>
          </form>
        </Form>

        <p className="text-[14px] text-secondary mt-2 text-left">
          By creating an account, you agree to the
          <a href="/terms-of-service" className="text-white px-1">
            Terms of Service
          </a>
          {"We'll occasionally send you account-related emails."}
        </p>

        <div className="text-center mt-2">
          <p className="text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></div>
      </div>
    </div>
  );
}
