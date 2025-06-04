import {useCallback, useEffect, useState} from "react";
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
import {
  allowedTypes,
  apiUrl,
  nameRegex,
  user_roles,
  usernameRegex,
  users,
} from "@/utils/constant";
import {Plus, PlusIcon} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

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
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .regex(nameRegex, "First name must contain only letters"),
  lastName: z
    .string()
    .min(1, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(nameRegex, "Last name must contain only letters"),
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must not exceed 50 characters")
    .regex(usernameRegex, "Username must not contain spaces"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must not exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9\s,.-]+$/,
      "Location can only contain letters, numbers, spaces, and basic punctuation (,.-)"
    )
    .transform((val) => val.trim()),
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
  team_id?: string;
  organizations: any;
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
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [isLoadingOrgUsers, setIsLoadingOrgUsers] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
      const isCustomRole = !user_roles.includes(userData.user_role);
      form.reset({
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        username: userData.user_name || "",
        location: userData.location || "",
        user_role: isCustomRole ? "Other" : userData.user_role || "",
      });
      setShowCustomRole(isCustomRole);
      if (isCustomRole) {
        setCustomRoleInput(userData.user_role);
      }
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
    if (!file) return;
    // Validate file type
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

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Check dimensions
      const maxDimension = 2000; // Max width/height of 2000px
      if (img.width > maxDimension || img.height > maxDimension) {
        URL.revokeObjectURL(objectUrl);
        ShowToast(
          "Image dimensions should not exceed 2000x2000 pixels",
          "error"
        );
        return;
      }

      URL.revokeObjectURL(objectUrl);
      // If all validations pass, set the file and preview
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      ShowToast("Failed to load image", "error");
    };

    img.src = objectUrl;
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

      // Validate custom role if "Other" is selected
      if (data.user_role === "Other") {
        if (!customRoleInput || customRoleInput.length < 2) {
          ShowToast(
            "Please enter a valid custom role (2-50 characters)",
            "error"
          );
          return;
        }
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
        user_role:
          data.user_role === "Other" ? customRoleInput : data.user_role,
        location: data.location,
        profile_picture: profilePictureUrl,
      };

      const response = await fetch(`${apiUrl}/${users}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
        // // credentials: "include",
      });

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
  const handleError = (error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : `An error occurred while ${context.toLowerCase()}`;

    ShowToast(errorMessage, "error");
    return errorMessage;
  };

  const fetchUserTeam = useCallback(async () => {
    if (!userData?.team_id) return null;

    try {
      const apiRoute = `${apiUrl}/teams/${userData.team_id}`;

      if (!apiRoute) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(apiRoute, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch team data (Status: ${response.status})`
        );
      }

      const data = await response.json();
      return data.teams;
    } catch (error) {
      handleError(error, "fetching team data");
      return null;
    }
  }, [userData?.team_id]);
  const fetchOrgTeams = useCallback(async () => {
    if (!userData?.organizations.id) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      const api = `${apiUrl}/teams/organizations/${userData?.organizations.id}`;

      if (!api) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(api, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch teams (Status: ${response.status})`
        );
      }

      const res = await response.json();
    } catch (error) {
      const errorMessage = handleError(error, "fetching organization teams");
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.organizations.id]);

  const fetchTeamMembers = useCallback(async () => {
    if (!userData?.organizations || !userData?.team_id) return;

    try {
      setIsLoadingTeamMembers(true);
      const api = `${apiUrl}/users/organizations/${userData?.organizations.id}`;

      const response = await fetch(api, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch team members (Status: ${response.status})`
        );
      }

      const data = await response.json();
      // const filteredMembers = data.data.filter(
      //   (user: any) => user.team_id === form.getValues("team_id")
      // );

      const onlyUsersInTeam = (data.data || []).filter(
        (member: any) =>
          member.role === "user" &&
          member.team_id !== null &&
          member.team_id === userData.team_id
      );
      setTeamMembers(onlyUsersInTeam);
      // setTeamMembers(filteredMembers || []);
    } catch (error) {
      handleError(error, "fetching team members");
    } finally {
      setIsLoadingTeamMembers(false);
    }
  }, [userData?.organizations.id, form]);

  const fetchOrgUsers = useCallback(async () => {
    if (!userData?.organizations.id) return;

    try {
      setIsLoadingOrgUsers(true);
      const api = `${apiUrl}/users/organizations/${userData?.organizations.id}`;

      const response = await fetch(api, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch organization users (Status: ${response.status})`
        );
      }

      const data = await response.json();
      setOrgUsers(data.data || []);
    } catch (error) {
      handleError(error, "fetching organization users");
    } finally {
      setIsLoadingOrgUsers(false);
    }
  }, [userData?.organizations.id]);

  const addUserToTeam = async (newUser: any) => {
    // const addUserToTeam = async (newUser: any) => {

    const currentTeamId = userData?.team_id;
    if (!currentTeamId || !newUser) return;

    try {
      const api = `${apiUrl}/users/${newUser.user_id}`;

      const response = await fetch(api, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({team_id: currentTeamId}),
        // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        ShowToast(
          errorData.message ||
            `Failed to add user to team (Status: ${response.status})`,
          "error"
        );
        throw new Error(
          errorData.message ||
            `Failed to add user to team (Status: ${response.status})`
        );
      }

      ShowToast("User added to team successfully");

      // await Promise.all([fetchTeamMembers(), fetchOrgUsers()]);
      setTeamMembers((prevMembers) => [...prevMembers, newUser]);
    } catch (error) {
      handleError(error, "adding user to team");
    }
  };

  const removeUserFromTeam = async (userId: string) => {
    if (!userId) return;

    try {
      const api = `${apiUrl}/users/${userId}`;

      const response = await fetch(api, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({team_id: null}),
        // credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to remove user from team (Status: ${response.status})`
        );
      }

      ShowToast("User removed from team successfully");
      await Promise.all([fetchTeamMembers(), fetchOrgUsers()]);
    } catch (error) {
      handleError(error, "removing user from team");
    }
  };

  useEffect(() => {
    if (userData?.role === "admin" && userData?.team_id) {
      fetchTeamMembers();
    }
  }, [userData, fetchTeamMembers]);

  useEffect(() => {
    const loadData = async () => {
      if (!userData) return;

      setIsLoading(true);
      setFetchError(null);

      try {
        const [teamData] = await Promise.all([
          fetchUserTeam(),
          fetchOrgTeams(),
        ]);

        if (userData.role === "admin") {
          await fetchOrgUsers();
          if (userData.team_id) {
            await fetchTeamMembers();
          }
        }
      } catch (error) {
        const errorMessage = handleError(error, "loading user data");
        setFetchError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userData) {
      loadData();
    }
  }, [userData, isOpen, fetchUserTeam, fetchOrgTeams, form]);
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="w-full md:max-w-[800px] bg-[#1A1A1C] border-none overflow-y-auto max-h-[90vh] bg-[#0E0F11] !rounded-xl"
        style={{borderRadius: "30px"}}
      >
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

              <div className="flex gap-6 w-full ml-5 mt-5 md:m-0">
                <label className="flex w-[210px] items-center h-[48px] justify-center gap-2 p-2 rounded-lg bg-[#F9E36C] text-black cursor-pointer hover:opacity-500">
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {/* <Upload className="w-4 h-4" /> */}
                  <img src="/upload-image.png" alt="user" />
                  <span className="text-[14px] font-semibold text-[#0E0F11]">
                    Upload Image
                  </span>
                </label>

                <Button
                  type="button"
                  onClick={removeImage}
                  disabled={!profileImage}
                  className={`border border-white w-[166px] h-[47px] cursor-pointer ${
                    profileImage
                      ? "bg-[#2A2A2C] text-white hover:bg-[#3A3B3C]"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[14px] font-normal">Remove Image</span>
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
                          className="h-[44px] pl-10 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
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
                          className="h-[44px] pl-10  bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
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
                          className="h-[44px] pl-10  bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
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
                          className="h-[44px] pl-10 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomRole(value === "Other");
                        if (value !== "Other") {
                          setCustomRoleInput("");
                        }
                      }}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-[48px] pl-4  bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none cursor-pointer">
                          <SelectValue placeholder="Select your role">
                            {field.value === "Other" && customRoleInput
                              ? customRoleInput
                              : field.value}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2C2D2E] text-white border-none">
                        {user_roles.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="focus:bg-[#2C2D2E]/80"
                          >
                            {role}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="Other"
                          className="focus:bg-[#2C2D2E]/80"
                        >
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {showCustomRole && (
                <FormField
                  control={form.control}
                  name="user_role"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel className="text-white font-urbanist">
                        Please specify your role
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={customRoleInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCustomRoleInput(value);
                            field.onChange("Other");
                          }}
                          placeholder="Enter your role"
                          className="h-[44px]  bg-[#FFFFFF14] text-[#FFFFFF52] rounded-md border-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {userData?.role === "admin" && userData?.team_id && (
                <div className="mt-2 pt-2">
                  <h3 className="text-sm mb-4 text-white">
                    Manage Team Members
                  </h3>

                  {isLoadingTeamMembers ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#F9E36C]"></div>
                    </div>
                  ) : (
                    <div
                      className="space-y-4 bg-[#2A2A2C] py-2"
                      style={{borderRadius: "6px"}}
                    >
                      <div className="flex flex-wrap gap-2 items-center p-2">
                        {teamMembers.length > 0 ? (
                          teamMembers.map((member) => (
                            <Badge
                              key={member.user_id}
                              className="bg-[#F9DB6F] text-black cursor-pointer"
                              style={{
                                borderRadius: "4px",
                                height: "24px",
                                width: "79px",
                              }}
                            >
                              <Avatar className="h-[20px] w-[20px]">
                                <AvatarImage
                                  src={member.profile_picture || ""}
                                  alt={member.first_name}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-[#F9E36C] text-black text-xs font-normal">
                                  {member.first_name?.charAt(0)}
                                  {member.last_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              <span
                                className="text-black text-[10.44px] font-normal max-w-[60px] truncate overflow-hidden whitespace-nowrap"
                                title={member.first_name}
                              >
                                {member.first_name}
                              </span>

                              {member.user_id !== userData.user_id && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeUserFromTeam(member.user_id)
                                  }
                                  className="text-black hover:text-white cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-400">No team members found</p>
                        )}

                        <Popover>
                          <PopoverTrigger asChild className="bg-[#191919]">
                            <Button
                              type="button"
                              variant="add"
                              size="sm"
                              className="ml-2"
                            >
                              Add members
                              <PlusIcon className="ml-1" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-90 p-0 bg-[#191919] border-none text-white"
                            style={{borderRadius: "30px"}}
                          >
                            <div className="p-4 border-b border-[#828282] px-2">
                              <h4 className="font-medium">Add Team Members</h4>
                              <p className="text-sm text-[#FFFFFF52]">
                                Select users to add to this team
                              </p>
                            </div>

                            {isLoadingOrgUsers ? (
                              <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#F9E36C]"></div>
                              </div>
                            ) : (
                              <ScrollArea className="h-72">
                                <div className="p-4">
                                  {orgUsers
                                    .filter(
                                      (user) =>
                                        user.role === "user" &&
                                        !teamMembers.some(
                                          (member) =>
                                            member.user_id === user.user_id
                                        )
                                    )
                                    .map((user) => (
                                      <div
                                        key={user.user_id}
                                        className="flex items-center justify-between  rounded cursor-pointer gap-3"
                                        // onClick={() => addUserToTeam(user)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-12 w-12">
                                            <AvatarImage
                                              src={user.profile_picture || ""}
                                              alt={user.first_name}
                                            />
                                            <AvatarFallback className="bg-[#F9E36C] text-black">
                                              {user.first_name?.charAt(0)}
                                              {user.last_name?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="text-sm font-medium">
                                              {user.first_name} {user.last_name}
                                            </p>
                                            <p className="text-xs text-[#FFFFFF52]">
                                              {user.email}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => addUserToTeam(user)}
                                          className="text-[10.33px] w-[65.67px] h-[20px] hover:opacaity-80 opacity-100 cursor-pointer bg-[#F9DB6F] text-black"
                                          style={{
                                            pointerEvents: "auto",
                                            borderRadius: "2.67px",
                                          }}
                                        >
                                          Add
                                        </button>
                                      </div>
                                    ))}

                                  {orgUsers.filter(
                                    (user) =>
                                      user.role === "user" &&
                                      !teamMembers.some(
                                        (member) =>
                                          member.user_id === user.user_id
                                      )
                                  ).length === 0 && (
                                    <p className="text-center text-gray-400 py-4">
                                      No available users to add
                                    </p>
                                  )}
                                </div>
                              </ScrollArea>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#2A2A2C] h-[48px] text-white hover:bg-[#3A3B3C] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#F9E36C] h-[48px] text-black hover:bg-[#f8d84e] cursor-pointer"
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
