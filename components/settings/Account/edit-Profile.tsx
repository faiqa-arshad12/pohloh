import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Edit, User, Upload, Trash2, X, MapPin} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useUser} from "@clerk/nextjs";
import {user_roles, users} from "@/utils/constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ShowToast} from "@/components/shared/show-toast";
import {supabase} from "@/supabase/client";
import Loader from "@/components/shared/loader";
import * as z from "zod";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name should only contain letters, spaces, hyphens, or apostrophes"
    ),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name should only contain letters, spaces, hyphens, or apostrophes"
    ),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  user_role: z.string().min(1, "Please select a role"),
});

type FormValues = z.infer<typeof formSchema>;

type UserDetails = {
  id: string;
  created_at: string;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  user_id: string;
  org_id: string;
  role: string;
  user_role: string;
  location: string;
  status: string;
  profile_picture: string;
};

type EditProfileModalProps = {
  userData: UserDetails | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const EditProfileModal = ({
  userData,
  isOpen,
  setIsOpen,
}: EditProfileModalProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      location: "",
      user_role: "",
    },
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        username: userData.user_name || "",
        location: userData.location || "",
        user_role: userData.user_role || "",
      });
      setProfileImage(userData.profile_picture || null);
    }
  }, [userData, form]);

  const handleClose = () => setIsOpen(false);

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!file || !user) return null;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
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

      const {
        data: {publicUrl},
      } = supabase.storage.from("images").getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Error in file upload:", error);
      return null;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setFileToUpload(null);
  };

  const submitProfile = async (data: FormValues) => {
    try {
      setIsLoading(true);
      if (!user) {
        console.error("User not found");
        return null;
      }

      // Upload profile picture if available
      let profilePictureUrl = profileImage || "";

      if (fileToUpload) {
        const uploadedUrl = await uploadFileToSupabase(fileToUpload);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        }
      }

      // Update Clerk user
      await user.update({
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
      });

      // Update in your database
      const updatedUserData = {
        user_name: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        user_role: data.user_role,
        location: data.location,
        profile_picture: profilePictureUrl,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${users}/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUserData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user in database");
      }

      ShowToast("Profile updated successfully");
      handleClose();
    } catch (error) {
      ShowToast("Failed to update profile", "error");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full md:max-w-[800px] bg-[#1A1A1C] border-none overflow-y-auto max-h-[90vh] bg-[#0E0F11] !rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-urbanist font-bold text-[32px] text-white">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitProfile)}
            className="space-y-5"
          >
            {/* Profile Image Upload */}
            <div className="h-[140px] flex flex-col md:flex-row items-center mb-6">
              <div className="rounded-full bg-[#7963E4] flex items-center justify-center mr-4">
                {profileImage ? (
                  <div className="w-[150px] h-[150px] rounded-full overflow-hidden">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[150px] h-[150px] rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full ml-5 mt-5 md:m-0">
                <label className="flex w-[210px] items-center h-[44px] justify-center gap-2 p-2 rounded-lg bg-[#F9E36C] text-black cursor-pointer hover:bg-[#f8d84e]">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </label>

                <Button
                  type="button"
                  onClick={removeImage}
                  disabled={!profileImage}
                  className={`w-[210px] h-[44px] ${
                    profileImage
                      ? "bg-[#2A2A2C] text-white hover:bg-[#3A3B3C]"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="firstName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-white font-urbanist">
                      First Name
                    </FormLabel>
                    <div className="relative">
                      <img
                        src="/first_name_icon.png"
                        alt="first name"
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="First Name"
                          className="h-[44px] pl-10 bg-white/10 border-transparent text-white"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-white font-urbanist">
                      Last Name
                    </FormLabel>
                    <div className="relative">
                      <img
                        src="/last_name.png"
                        alt="last name"
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Last Name"
                          className="h-[44px] pl-10 bg-white/10 border-transparent text-white"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-white font-urbanist">
                      Username
                    </FormLabel>
                    <div className="relative">
                      <img
                        src="/user_name.png"
                        alt="username"
                        className="absolute left-3 top-[14px] w-[16.57px] h-[15px] text-gray-400"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Username"
                          className="h-[44px] pl-10 bg-white/10 border-transparent text-white"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-white font-urbanist">
                      Location
                    </FormLabel>
                    <div className="relative">
                      <img
                        src="/location.png"
                        alt="location"
                        className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Location"
                          className="h-[44px] pl-10 bg-white/10 border-transparent text-white"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_role"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="text-white font-urbanist">
                      What best describes your role?
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-[48px] pl-4 bg-white/10 border-transparent text-white placeholder:text-white/50">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2C2D2E] text-white border-none">
                        {user_roles.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="hover:bg-[#2C2D2E]/80 focus:bg-[#2C2D2E]/80"
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#2A2A2C] h-[48px] text-white hover:bg-[#3A3B3C]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F9E36C] h-[48px] text-black hover:bg-[#f8d84e]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader />
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
