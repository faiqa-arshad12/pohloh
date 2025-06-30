"use client";

import {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {useRouter} from "next/navigation";
import {Calendar, Loader2, Check} from "lucide-react";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useUser} from "@clerk/nextjs";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {Select, SelectTrigger, SelectContent} from "@/components/ui/select";
import {apiUrl, frontend_url} from "@/utils/constant";
import {ShowToast} from "@/components/shared/show-toast";
import Loader from "@/components/shared/loader";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {createNotification} from "@/services/notification.service";

type RenewSubscriptionProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  selectedCard: any;
};

const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title must be at least 1 characters")
    .max(256, "Title must be less than or equal to 256 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Title can only contain letters, numbers, spaces, hyphens and underscores"
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be less than 300 characters"),
  teams: z.array(z.string()).min(1, "Please select at least one team"),
  expiry_date: z
    .string()
    .min(1, "Expiry date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Expiry date must be today or in the future"),
  card_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function CreateAnnouncement({
  open,
  onClose,
  selectedCard,
}: RenewSubscriptionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [isTeamsLoading, setIsTeamsLoading] = useState(true);
  const [userData, setUserData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const {user, isLoaded: isUserLoaded} = useUser();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [savedCard, setSaved] = useState<any>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      teams: [],
      expiry_date: "",
      card_id: "",
    },
  });

  // Watch the description field for character counting
  const descriptionValue = form.watch("description");
  const descriptionLength = descriptionValue?.length || 0;
  const maxDescriptionLength = 300;

  useEffect(() => {
    if (open) {
      form.reset();
      fetchTeams();
    }
  }, [open, form]);

  useEffect(() => {
    const savedCard = localStorage.getItem("selectedAnnouncementCard");
    if (savedCard) {
      setSaved(JSON.parse(savedCard));
    }
  }, []);

  const fetchTeams = async () => {
    setIsTeamsLoading(true);
    setIsInitialLoading(true);
    try {
      if (user) {
        const userResponse = await fetch(`${apiUrl}/users/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userDataa = await userResponse.json();
        const orgId = userDataa.user.organizations?.id;
        setUserData(userDataa.user);

        if (!orgId) {
          throw new Error("User is not part of any organization");
        }

        const teamsResponse = await fetch(
          `${apiUrl}/teams/organizations/categories/${orgId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: userDataa.user.role,
              userId: userDataa.user.id,
            }),
          }
        );

        if (!teamsResponse.ok) {
          throw new Error("Failed to fetch teams");
        }

        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setTeams([]);
    } finally {
      setIsTeamsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleIconClick = () => {
    inputRef.current?.showPicker?.();
  };

  const handleClose = () => {
    onClose(false);
    form.reset();
  };

  const toggleTeamSelection = (teamId: string) => {
    const currentSelection = form.getValues("teams");
    const newSelection = currentSelection.includes(teamId)
      ? currentSelection.filter((id) => id !== teamId)
      : [...currentSelection, teamId];
    form.setValue("teams", newSelection, {shouldValidate: true});
  };

  const getSelectedTeamNames = () => {
    const selectedIds = form.getValues("teams");
    return teams
      .filter((team) => selectedIds.includes(team.id))
      .map((team) => team.name);
  };

  const renderSelectedTeams = () => {
    const selectedNames = getSelectedTeamNames();
    if (selectedNames.length === 0) {
      return <span className="text-muted-foreground">Select teams</span>;
    }
    if (selectedNames.length <= 3) {
      return selectedNames.join(", ");
    }
    return `${selectedNames.slice(0, 3).join(", ")} +${
      selectedNames.length - 3
    } more`;
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (!userData || !userData.organizations?.id) {
        throw new Error("User organization information is missing");
      }

      if (data.teams.length === 0) {
        throw new Error("Please select at least one team");
      }

      const selectedDate = new Date(data.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error("Expiry date must be today or in the future");
      }

      const cardData = {
        ...data,
        org_id: userData.organizations.id,
        user_id: userData.id,
        card_id: selectedCard?.id || null,
      };

      const response = await fetch(`${apiUrl}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create announcement";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          if (errorData.errors) {
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                form.setError(field as keyof FormData, {
                  type: "manual",
                  message: messages.join(", "),
                });
              }
            });
            throw new Error("Validation errors occurred");
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      ShowToast("Announcement created successfully", "success");

      await createNotification({
        user_id: userData.id,
        org_id: userData.organizations.id,
        message: `A New announcement: ${data.title} has been added to your team`,
        subtext: data.description,
        link: `${frontend_url}/dashboard`,
        notifying_team_ids: data.teams,
      });

      router.replace("/dashboard");
      handleClose();
    } catch (error) {
      console.error("Error creating announcement:", error);
      let userErrorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        userErrorMessage = error.message;
      }
      ShowToast(`Error: ${userErrorMessage}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUserLoaded || isInitialLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none">
          <DialogHeader>
            <Skeleton className="h-8 w-[200px] mb-6" />
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-[200px] mb-2" />
              <Skeleton className="w-full h-24 rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-[180px] mb-2" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="w-full h-12 rounded-md" />
              <Skeleton className="w-full h-12 rounded-md" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto max-h-[90vh] bg-[#222222] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Create Announcement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 text-white"
            noValidate
          >
            <FormField
              control={form.control}
              name="title"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-[16px] font-normal mb-1">
                    Announcement Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Title"
                      className="w-full h-[44px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold"
                      required
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-[16px] font-normal mb-1">
                    Announcement Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter Description"
                      className="w-full min-h-[125px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold"
                      maxLength={maxDescriptionLength}
                      required
                    />
                  </FormControl>
                  <div className="flex justify-between items-center mt-1">
                    <div></div>
                    <span
                      className={`text-sm  text-gray-400 ${
                        descriptionLength > maxDescriptionLength
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {descriptionLength}/{maxDescriptionLength}
                    </span>
                  </div>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teams"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-[16px] font-normal mb-1">
                    Select Teams to Notify
                  </FormLabel>
                  <Select
                    onOpenChange={(open) => setIsSelectOpen(open)}
                    open={isSelectOpen}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-[44px] rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-muted-foreground font-urbanist">
                        <div className="w-full text-left truncate">
                          {renderSelectedTeams()}
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#222222] border border-[#FFFFFF14] text-muted-foreground max-h-[300px] overflow-y-auto">
                      {isTeamsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading teams...
                        </div>
                      ) : teams.length > 0 ? (
                        <>
                          <div
                            className="px-8 py-2 text-sm text-[#F9DB6F] cursor-pointer hover:bg-[#FFFFFF14]"
                            onClick={(e) => {
                              e.preventDefault();
                              const allIds = teams.map((t) => t.id);
                              form.setValue("teams", allIds, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Select All
                          </div>
                          {teams.map((team) => (
                            <div
                              key={team.id}
                              className="relative flex items-center px-2 py-2 hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleTeamSelection(team.id);
                              }}
                              style={{borderRadius: "8px"}}
                            >
                              {field.value.includes(team.id) && (
                                <Check className="absolute left-2 h-4 w-4" />
                              )}
                              <span className="ml-6">{team.name}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-8 py-2 text-gray-400">
                          No teams available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="text-[16px] font-normal mb-2 block">
                Selected Card
              </FormLabel>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
                  disabled
                  type="button"
                >
                  {selectedCard.title}
                </Button>
              </div>
              <FormMessage className="text-red-400">
                {form.formState.errors.card_id?.message}
              </FormMessage>
            </div>

            <FormField
              control={form.control}
              name="expiry_date"
              render={({field}) => (
                <FormItem>
                  <FormLabel className="text-[16px] font-normal mb-1">
                    Expiry Date
                  </FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <input
                        {...field}
                        ref={inputRef}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full h-[44px] pr-10 px-3 rounded-md border border-[#FFFFFF14] bg-[#FFFFFF14] text-white font-urbanist font-semibold appearance-none
                          [&::-webkit-calendar-picker-indicator]:appearance-none
                          [&::-webkit-calendar-picker-indicator]:invisible
                          [&::-webkit-calendar-picker-indicator]:w-0
                          [&::-webkit-calendar-picker-indicator]:h-0"
                        required
                      />
                      <Calendar
                        size={18}
                        onClick={handleIconClick}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full h-[48px] rounded-md border border-white text-white font-urbanist font-semibold hover:bg-[#F9DB6F1a] transition cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full h-[48px] rounded-md bg-[#F9DB6F] text-black font-urbanist font-semibold hover:opacity-90 transition cursor-pointer justify-center text-center flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex flex-row justify-center items-center">
                    <Loader />
                  </div>
                ) : (
                  "Create Announcement"
                )}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAnnouncement;
