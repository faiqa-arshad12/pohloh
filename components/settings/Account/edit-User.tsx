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
import {nameRegex, user_roles} from "@/utils/constant";
import {ShowToast} from "@/components/shared/show-toast";
import Loader from "@/components/shared/loader";
import {useUser} from "@clerk/nextjs";
import {X, Plus, PlusIcon} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

const formSchema = z.object({
  user_name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters")
    .regex(nameRegex, "Name must not contain spaces"),
  role: z.string().min(1, "Seat Type is required"),
  user_role: z.string().min(1, "User Role is required"),
  team_id: z.string().min(1, "Team is required"),
});

interface EditUserModalProps {
  open: boolean;
  userDetails: any;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function EditUserModal({
  open,
  onOpenChange,
  className,
  userDetails,
}: EditUserModalProps) {
  const [orgDepartments, setOrgDepartments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const {user} = useUser();

  const [currentTeam, setCurrentTeam] = React.useState<any>(null);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [orgUsers, setOrgUsers] = React.useState<any[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = React.useState(false);
  const [isLoadingOrgUsers, setIsLoadingOrgUsers] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      role: "",
      user_role: "",
      team_id: "",
    },
  });

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

  const fetchUserTeam = React.useCallback(async () => {
    if (!userDetails?.team_id) return null;

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${userDetails.team_id}`;

      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
  }, [userDetails?.team_id]);

  const fetchOrgTeams = React.useCallback(async () => {
    if (!userDetails?.org_id) return;

    try {
      setIsLoading(true);
      setFetchError(null);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams/organizations/${userDetails.org_id}`;

      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to fetch teams (Status: ${response.status})`
        );
      }

      const res = await response.json();
      setOrgDepartments(res.teams || []);
    } catch (error) {
      const errorMessage = handleError(error, "fetching organization teams");
      setFetchError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userDetails?.org_id]);

  const fetchTeamMembers = React.useCallback(async () => {
    if (!userDetails?.org_id || !form.getValues("team_id")) return;

    try {
      setIsLoadingTeamMembers(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/organizations/${userDetails.org_id}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
          member.team_id === form.getValues("team_id")
        );
      console.log(onlyUsersInTeam, "only", userDetails, "sls");
      setTeamMembers(onlyUsersInTeam);
      // setTeamMembers(filteredMembers || []);
    } catch (error) {
      handleError(error, "fetching team members");
    } finally {
      setIsLoadingTeamMembers(false);
    }
  }, [userDetails?.org_id, form]);
  console.log(teamMembers, "mene");

  const fetchOrgUsers = React.useCallback(async () => {
    if (!userDetails?.org_id) return;

    try {
      setIsLoadingOrgUsers(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/organizations/${userDetails.org_id}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
  }, [userDetails?.org_id]);

  const addUserToTeam = async (newUser: any) => {
    // const addUserToTeam = async (newUser: any) => {

    const currentTeamId = form.getValues("team_id");
    if (!currentTeamId || !newUser) return;

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${newUser.user_id}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({team_id: currentTeamId}),
        credentials: "include",
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
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({team_id: null}),
        credentials: "include",
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

  React.useEffect(() => {
    if (form.watch("role") === "admin" && form.watch("team_id")) {
      fetchTeamMembers();
    }
  }, [form.watch("team_id"), form.watch("role"), fetchTeamMembers]);

  React.useEffect(() => {
    const loadData = async () => {
      if (!userDetails) return;

      setIsLoading(true);
      setFetchError(null);

      try {
        const [teamData] = await Promise.all([
          fetchUserTeam(),
          fetchOrgTeams(),
        ]);

        setCurrentTeam(teamData);
        form.reset({
          user_name: userDetails.user_name || "",
          role: userDetails.role || "user",
          user_role: userDetails.user_role || "",
          team_id: userDetails.team_id || teamData?.id || "",
        });

        if (userDetails.role === "admin") {
          await fetchOrgUsers();
          if (userDetails.team_id) {
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

    if (open && userDetails) {
      loadData();
    }
  }, [userDetails, open, fetchUserTeam, fetchOrgTeams, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsUpdating(true);

      if (!userDetails) {
        throw new Error("User details not found");
      }

      if (!user) {
        throw new Error("Current user not authenticated");
      }

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: values.role,
        },
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userDetails.user_id}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update user (Status: ${response.status})`
        );
      }

      if (values.role === "admin") {
        const teamData = {
          lead_id: userDetails.id,
          user_id: userDetails.user_id,
        };

        const teamApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${values.team_id}`;

        const teamResponse = await fetch(teamApiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(teamData),
          credentials: "include",
        });

        if (!teamResponse.ok) {
          const errorData = await teamResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to update team lead (Status: ${teamResponse.status})`
          );
        }
      }

      ShowToast("User has been updated successfully");
      onOpenChange(false);
    } catch (error) {
      handleError(error, "updating user");
    } finally {
      setIsUpdating(false);
    }
  }

  const retryLoading = () => {
    if (userDetails) {
      setFetchError(null);
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [teamData] = await Promise.all([
            fetchUserTeam(),
            fetchOrgTeams(),
          ]);
          setCurrentTeam(teamData);
        } catch (error) {
          handleError(error, "retrying data load");
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`overflow-y-auto w-full max-w-[864px] h-auto bg-[#191919] text-white border-none ${className}`}
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <DialogTitle className="text-[32px]">
            Edit {userDetails?.role === "admin" ? "Lead" : "User"}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-[#828282] h-[1px]" />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9E36C]"></div>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-red-400 mb-4">{fetchError}</p>
            <Button
              onClick={retryLoading}
              className="bg-[#F9E36C] text-black hover:bg-[#f8d84e]"
            >
              Retry
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="user_name"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="block font-urbanist font-normal text-base text-white">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter username"
                        className="w-full p-2 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_role"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="block font-urbanist font-normal text-base text-white">
                      Select the Role
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full p-2 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none cursor-pointer">
                          <SelectValue placeholder="Select the role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                        {user_roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="block font-urbanist font-normal text-base text-white">
                      Select the Seat Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-2 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none cursor-pointer">
                          <SelectValue placeholder="Select the role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                render={({field}) => (
                  <FormItem>
                    <FormLabel className="block font-urbanist font-normal text-base text-white">
                      Assign to Team
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (form.getValues("role") === "admin") {
                          fetchTeamMembers();
                        }
                      }}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full p-2 bg-[#FFFFFF14] h-[44px] text-[#FFFFFF52] rounded-md border-none cursor-pointer">
                          <SelectValue placeholder="Select the team">
                            {orgDepartments.find(
                              (team) => team.id === field.value
                            )?.name ||
                              currentTeam?.name ||
                              "Select the team"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#2A2A2C] text-white border border-gray-700 z-[1001]">
                        {orgDepartments.length > 0 ? (
                          orgDepartments.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No teams available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* {form.watch("role") === "admin" && form.watch("team_id") && ( */}
              {form.watch("role") === "admin" && form.watch("team_id") && (
                <div className="mt-2 pt-2">
                  <h3 className="text-xl mb-4">Manage Team Members</h3>

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

                              {member.user_id !== userDetails.user_id && (
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

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-1/2 border bg-[#2A2A2C] border-[#828282] text-white hover:bg-[#2A2A2C] h-[48px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full sm:w-1/2 bg-[#F9E36C] text-black hover:bg-[#f8d84e] h-[48px] cursor-pointer"
                >
                  {isUpdating ? <Loader /> : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
