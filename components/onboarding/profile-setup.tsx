"use client";

import type React from "react";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useEffect, useRef, useState} from "react";
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
import {Loader2, Upload} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {StepIndicator} from "../shared/stepIndicator";
import {useUser} from "@clerk/nextjs";
import {
  allowedTypes,
  apiUrl,
  nameRegex,
  user_roles,
  usernameRegex,
  users,
} from "@/utils/constant";
import {ShowToast} from "../shared/show-toast";
import {UserStatus} from "@/types/enum";
import {useRouter} from "next/navigation";
import {supabase} from "@/supabase/client";
import type {Role} from "@/types/types";
import {
  getLocalStorage,
  PROFILE_DATA_KEY,
  setLocalStorage,
} from "@/lib/local-storage";
import Loader from "../shared/loader";
import {Icon} from "@iconify/react";

const formSchema = (role: Role | null) =>
  z.object({
    profilePicture: z.string().optional(),
    user_role: z.string().min(1, "Role is required"),
    custom_role: z.string().optional(),
    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must not exceed 100 characters")
      .regex(
        /^[a-zA-Z0-9\s,.-]+$/,
        "Location can only contain letters, numbers, spaces, and basic punctuation (,.-)"
      )
      .transform((val) => val.trim()),
    first_name:
      role !== "owner"
        ? z
            .string()
            .min(1, "First name is required")
            .max(50, "First name must not exceed 50 characters")
            .regex(nameRegex, "First name must contain only letters")
        : z.string().optional(),
    last_name:
      role !== "owner"
        ? z
            .string()
            .min(1, "Last name is required")
            .max(50, "Last name must not exceed 50 characters")
            .regex(nameRegex, "Last name must contain only letters")
        : z.string().optional(),
    user_name:
      role !== "owner"
        ? z
            .string()
            .min(1, "Username is required")
            .max(50, "Username must not exceed 50 characters")
            .regex(usernameRegex, "Username must not contain spaces")
        : z.string().optional(),
  });

interface ProfileData {
  user_role: string;
  first_name?: string;
  last_name?: string;
  user_name?: string;
  location: string;
  profile_picture: string;
}

interface ProfileSetupProps {
  profileData?: ProfileData;
  updateProfile?: (data: ProfileData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  role: Role | null;
  org_id?: string;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  profileData,
  updateProfile,
  onNext,
  onPrevious,
  role,
  org_id,
}) => {
  const steps = ["Organization Details", "Setup Profile", "Choose Plan"];
  const currentStep = 2;
  const {user} = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [localData, setLocalData] = useState<ProfileData | null>(null);
  const [showCustomRole, setShowCustomRole] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      try {
        const savedData = getLocalStorage<ProfileData>(
          PROFILE_DATA_KEY,
          user.id
        );
        if (savedData) {
          setLocalData(savedData);
          if (savedData.profile_picture) {
            setProfilePictureUrl(savedData.profile_picture);
          }
        }
      } catch (error) {
        console.error("Error loading profile data from localStorage:", error);
      }
    }
  }, [user?.id]);

  // Save data to localStorage
  const saveToLocalStorage = (data: ProfileData) => {
    if (user?.id) {
      setLocalStorage(PROFILE_DATA_KEY, user.id, data);
    }
  };

  // Priority: 1. Props data (from parent) 2. localStorage data 3. Default values
  const initialData = profileData ||
    localData || {
      user_role: "",
      location: "",
      profile_picture: "",
    };

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(role)),
    defaultValues: {
      profilePicture: initialData.profile_picture || "",
      user_role: initialData.user_role || "Software Engineer",
      custom_role: "",
      location: initialData.location || "",
      first_name: initialData.first_name || user?.firstName || "",
      last_name: initialData.last_name || user?.lastName || "",
      user_name: initialData.user_name || user?.username || "",
    },
  });

  const router = useRouter();

  // Upload file to Supabase and return the public URL
  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!file) return null;

      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const {data, error} = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        ShowToast("Failed to upload profile picture", "error");
        return null;
      }

      // Get the public URL for the uploaded file
      const {
        data: {publicUrl},
      } = supabase.storage.from("images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in file upload:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image selection and upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!allowedTypes.includes(file.type)) {
        ShowToast(
          "Please upload a valid image file (JPEG, PNG, or GIF)",
          "error"
        );
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        ShowToast("Image size should be less than 2MB", "error");
        return;
      }
      // Upload to Supabase immediately
      const uploadedUrl = await uploadFileToSupabase(file);

      if (uploadedUrl) {
        // Set the URL for display
        setProfilePictureUrl(uploadedUrl);

        // Update form value
        form.setValue("profilePicture", uploadedUrl);

        // Save to localStorage and update parent component
        if (user?.id && updateProfile) {
          const currentValues = form.getValues();
          const profileData: ProfileData = {
            user_role: currentValues.user_role || "",
            location: currentValues.location || "",
            first_name: currentValues.first_name,
            last_name: currentValues.last_name,
            user_name: currentValues.user_name,
            profile_picture: uploadedUrl,
          };

          updateProfile(profileData);
          saveToLocalStorage(profileData);
          ShowToast("Profile picture uploaded successfully", "success");
        }
      }
    } catch (error) {
      console.error("Error handling image upload:", error);
      ShowToast("Failed to process image", "error");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const submitProfile = async () => {
    try {
      if (!user) {
        console.error("User not found");
        return null;
      }

      const values = form.getValues();

      const profilePictureUrl =
        values.profilePicture || initialData.profile_picture || "";

      if (role !== "owner") {
        await user.update({
          firstName: values.first_name,
          lastName: values.last_name,
          unsafeMetadata: {
            ...user.unsafeMetadata,

            status: UserStatus.approved,
            isProfileComplete: true, // New role
          },
        });
      }

      const userData = {
        ...(role !== "owner" && {
          user_name: values.user_name ?? user?.username ?? "",
          first_name: values.first_name ?? user?.firstName ?? "",
          last_name: values.last_name ?? user?.lastName ?? "",
        }),
        user_role: values.user_role ?? "",
        location: values.location ?? "",
        status:
          role === "owner" ? UserStatus.SetupProfile : UserStatus.approved,
        profile_picture: profilePictureUrl,
      };
      return userData;
    } catch (error) {
      console.error("Error updating user:", error);
      ShowToast("Error updating user", "error");
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<ReturnType<typeof formSchema>>) => {
    setLoading(true);
    try {
      if (role === "owner") {
        if (updateProfile) {
          const profileData = {
            user_role:
              values.user_role === "Other"
                ? values.custom_role || "Other"
                : values.user_role || "",
            location: values.location,
            profile_picture:
              profilePictureUrl || initialData?.profile_picture || "",
          };
          updateProfile(profileData);

          // Save final data to localStorage
          if (user?.id) {
            saveToLocalStorage(profileData);
          }
        }

        if (onNext) onNext();
      } else {
        const profileData = {
          user_role:
            values.user_role === "Other"
              ? values.custom_role || "Other"
              : values.user_role || "",
          first_name: values.first_name,
          last_name: values.last_name,
          user_name: values.user_name,
          status: UserStatus.approved,
          location: values.location,
          org_id: org_id || "",
          profile_picture:
            profilePictureUrl || initialData?.profile_picture || "",
        };
        const checkUrl = `${apiUrl}/${users}/${user?.id}`;
        const checkResponse = await fetch(checkUrl, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(profileData),
        });

        if (!checkResponse.ok) {
          throw new Error("Failed to create subscription");
        }
        await user?.update({
          firstName: values.first_name,
          lastName: values.last_name,
          unsafeMetadata: {
            ...user.unsafeMetadata,

            status: UserStatus.approved,
            isProfileComplete: true, // New role
          },
        });
      }
      setLoading(false);
      ShowToast("User profile has been saved!", "success");
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      ShowToast("Failed to update profile", "error");
      console.error("Error submitting form:", error);
    }
  };

  // Watch form changes and update parent component + localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (updateProfile && user?.id) {
        const profileData: ProfileData = {
          user_role: value.user_role || "",
          location: value.location || "",
          first_name: value.first_name,
          last_name: value.last_name,
          user_name: value.user_name,
          profile_picture:
            profilePictureUrl || initialData?.profile_picture || "",
        };

        updateProfile(profileData);
        saveToLocalStorage(profileData);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, updateProfile, initialData, profilePictureUrl, user?.id]);

  return (
    <div className="flex flex-col items-center justify-center text-white min-h-screen">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Header Section */}
        <div className="w-full max-w-2xl text-center mb-4">
          <h1 className="text-[40px] font-medium mb-2">Setup Profile</h1>
          <p className="text-[20px] text-[#D1D1D1] px-8">
            Add your personal details to get the most out of Pohloh.
          </p>
        </div>

        {/* Step Indicator */}
        {role === "owner" && (
          <div className="w-full max-w-2xl mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        )}

        {/* Form Container */}
        <div className="w-full max-w-[700px] p-8 rounded-2xl shadow-sm backdrop-invert backdrop-opacity-10 py-16">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <FormLabel className="text-lg">Profile Picture</FormLabel>
                <div className="flex flex-col items-center mb-6">
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Image Preview */}
                    <div className="w-24 h-24 rounded-full bg-[#40423A] flex items-center justify-center overflow-hidden border border-0">
                      {profilePictureUrl || initialData.profile_picture ? (
                        <Image
                          src={
                            profilePictureUrl ||
                            initialData.profile_picture ||
                            "/placeholder.svg"
                          }
                          alt="Profile preview"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Icon
                          icon="mdi:user"
                          width="71"
                          height="71"
                          color="#A2A2A2"
                        />
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={() => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Upload Button */}
                    <Button
                      variant="outline"
                      className="bg-[#F9DB6F] w-full max-w-[175px] border-0 text-black hover:bg-[#F9DB6F] cursor-pointer h-[48px]"
                      onClick={triggerFileInput}
                      type="button"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader />
                        </>
                      ) : (
                        <>Upload Picture</>
                      )}
                    </Button>
                  </div>
                </div>

                {role !== "owner" && (
                  <>
                    {/* First Name Input */}
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the First Name"
                              className="placeholder:text-[14px] placeholder:text-[#FFFFFF52]  h-[44px] border border-[#FFFFFF0F] bg-[#FFFFFF14]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Last Name Input */}
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-base">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the Last Name"
                              className="placeholder:text-[14px] placeholder:text-[#FFFFFF52] h-[44px] border border-[#FFFFFF0F] bg-[#FFFFFF14]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Username Input */}
                    <FormField
                      control={form.control}
                      name="user_name"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel className="text-base">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the username"
                              className="placeholder:text-[14px] placeholder:text-[#FFFFFF52]  h-[44px] border border-[#FFFFFF0F] bg-[#FFFFFF14]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Role Dropdown */}
                <FormField
                  control={form.control}
                  name="user_role"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className="text-base text-normal">
                        What best describes your role?
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomRole(value === "Other");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl className="w-full !h-[44px] py-3 rounded-[6px] border border-[#FFFFFF0F] text-white bg-[#FFFFFF14] placeholder:text-sm placeholder:text-gray-400">
                          <SelectTrigger className="w-full placeholder:text-[14px] placeholder:text-[#FFFFFF52] ">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2D2E] text-white hover:bg-[#2C2D2E]/90">
                          {user_roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Role Input */}
                {showCustomRole && (
                  <FormField
                    control={form.control}
                    name="custom_role"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          Please specify your role
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your role"
                            className="placeholder:text-[14px] placeholder:text-[14px] placeholder:text-[#FFFFFF52]  h-[44px] border border-[#FFFFFF0F] bg-[#FFFFFF14] "
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Location Input */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className="text-base">Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="i.e: Montreal"
                          className="placeholder:text-[14px] placeholder:text-[#FFFFFF52]  h-[44px] border border-[#FFFFFF0F] bg-[#FFFFFF14]"
                          {...field}
                          onChange={(e) => {
                            // Remove any special characters except allowed ones
                            const value = e.target.value.replace(
                              /[^a-zA-Z0-9\s,.-]/g,
                              ""
                            );
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-[48px] rounded-[8px] text-white border border-gray-300 bg-[#2C2D2E] cursor-pointer"
                  type="button"
                  onClick={onPrevious}
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-[48px] rounded-[8px] bg-[#F9DB6F] text-black hover:bg-[#F9DB6F] cursor-pointer"
                  disabled={isLoading || isUploading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <p>Save & Continue</p>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Background Pattern */}
          <div className="absolute bottom-0 left-0 -z-10 h-[20%] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></div>
        </div>
      </div>
    </div>
  );
};
