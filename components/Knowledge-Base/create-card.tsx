"use client";

import React, {useEffect, useRef, useState, useCallback} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {Pen, CalendarDays, Trash2} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useUser} from "@clerk/nextjs";
import {supabase} from "@/supabase/client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Tag from "./tags";
import {ManageCategory} from "./Create-Card/manage-category";
import Loader from "../shared/loader";
import {ShowToast} from "../shared/show-toast";
import {
  apiUrl,
  calculateDateFromPeriod,
  CardStatus,
  determinePeriodType,
  formatPeriodDisplay,
  visibilityLabels,
  visibilityOptions,
} from "@/utils/constant";
import ArrowBack from "../shared/ArrowBack";
import {cn} from "@/lib/utils";
import ChooseTeamModal from "./ChooseTeamModal";
import ChooseUserModal from "./ChooseUserModal";
import SelectUserModal from "./ChooseSelectedUsers";

const TipTapEditor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Loader />
      <span className="ml-2 text-white">Loading Editor...</span>
    </div>
  ),
});

interface Team {
  id: string;
  name: string;
  org_id: string;
  lead_id: string | null;
  user_id: string | null;
  created_at: string;
}

interface Subcategory {
  id: string;
  team_id: string;
  name: string;
  created_at: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TagData {
  id?: string;
  name: string;
  color?: string;
}

const CustomDateInput = React.forwardRef<HTMLInputElement, any>(
  ({value, onClick, placeholder}, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between w-full h-[44px] px-4 bg-[#2C2D2E] text-[#FFFFFF52] rounded-[6px] border border-white/10 cursor-pointer"
    >
      <span className={value ? "text-white" : "text-[#FFFFFF52]"}>
        {value || placeholder}
      </span>
      <CalendarDays className="w-4 h-4 text-white" />
    </div>
  )
);
CustomDateInput.displayName = "CustomDateInput";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {message: "Title must be at least 1 characters"})
    .max(256, {message: "Title must not be greater than 256 characters"})
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, {
      message:
        "Title can only contain letters, numbers, spaces, and basic punctuation",
    })
    .refine((val) => val.trim().length >= 4, {
      message: "Title cannot be empty or just whitespace",
    }),
  category_id: z.string().min(1, {message: "Please select a category"}),
  folder_id: z.string().min(1, {message: "Please select a folder"}),
  card_owner_id: z.string().min(1, {message: "Please select a card owner"}),
  verificationperiod: z.date().min(new Date(), {
    message: "Verification date must be in the future",
  }),
  verificationPeriodType: z.string().optional(),
  team_to_announce_id: z.string().optional(),
  content: z
    .string()
    .min(10, {message: "Content must be at least 10 characters"}),
  tags: z.array(z.string()).optional(),
  visibility: z.string().min(1, {message: "Please select card visibility"}),
});
export default function CreateCard({cardId}: {cardId?: string}) {
  const router = useRouter();
  const {user} = useUser();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [org_id, setOrganizationId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [originalCardData, setOriginalCardData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isTeamModalOpen, setIsTeamOpen] = useState(false);
  const [isUserModalOpen, setIsUserOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const [team, setTeam] = useState<any>();
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<
    {name: string; url: string; type: string}[]
  >([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    teams: false,
    users: false,
    subcategories: false,
    card: false,
    submitting: false,
  });
  const [errors, setErrors] = useState({
    subcategories: null as string | null,
    users: null as string | null,
    form: null as string | null,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category_id: "",
      folder_id: "",
      card_owner_id: "",
      verificationperiod: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      verificationPeriodType: "2week",
      team_to_announce_id: "",
      content: "",
      tags: [],
    },
  });

  const selectedCategory = form.watch("category_id");
  const verificationPeriod = form.watch("verificationperiod");
  const verificationPeriodType = form.watch("verificationPeriodType");

  const setLoading = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates((prev) => ({...prev, [key]: value}));
  };

  const setError = (key: keyof typeof errors, value: string | null) => {
    setErrors((prev) => ({...prev, [key]: value}));
  };
  const visibility = form.watch("visibility");

  useEffect(() => {
    setSelectedUsers([]);
    if (visibility === "team_based") {
      setIsTeamOpen(true);
    }
    if (visibility === "selected_users") {
      setIsOpen(true);
    }
  }, [visibility]);

  const onTeamSelect = async (team: any) => {
    setTeam(team);
    setIsTeamOpen(false);

    setIsUserOpen(true);
  };

  const fetchCardData = useCallback(async () => {
    if (!cardId) return;

    setLoading("card", true);

    try {
      const response = await fetch(`${apiUrl}/cards/${cardId}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) throw new Error("Failed to fetch card data");

      const data = await response.json();

      if (data.success && data.card) {
        const cardData = data.card;
        setOriginalCardData(cardData);

        // Handle attachments if they exist
        if (cardData.attachments && Array.isArray(cardData.attachments)) {
          setAttachedFiles(
            cardData.attachments.map((attachment: any) => ({
              name: attachment.name || attachment.file_name,
              url: attachment.url || attachment.file_url,
              type: attachment.type || attachment.file_type,
            }))
          );
        }

        const extractedData = {
          title: cardData.title || "",
          content: cardData.content || "",
          tags: cardData.tags || [],
          verificationperiod: cardData.verificationperiod
            ? new Date(cardData.verificationperiod)
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          org_id: cardData.org_id?.id || null,
          category_id: cardData.category_id?.id || "",
          folder_id: cardData.folder_id?.id || "",
          card_owner_id: cardData.card_owner_id?.id || "",
          team: cardData?.team_access_id || null,
          team_to_announce_id: cardData.team_to_announce_id
            ? cardData.team_to_announce_id.id
            : "none",
          visibility: cardData.visibility,
        };

        const periodType = determinePeriodType(
          extractedData.verificationperiod
        );
        if (
          extractedData.visibility === "selected_users" ||
          extractedData.visibility === "team_based"
        ) {
          const response = await fetch(`${apiUrl}/cards/users/${cardId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          });

          if (!response.ok) throw new Error("Failed to fetch card data");

          const data = await response.json();
        }

        form.reset({
          ...form.getValues(),
          title: extractedData.title,
          content: extractedData.content,
          tags: extractedData.tags,
          verificationperiod: extractedData.verificationperiod,
          verificationPeriodType: periodType,
          visibility: extractedData.visibility,
        });

        setEditorContent(extractedData.content);
        setTeam(extractedData.team);
        setIsContentEmpty(!extractedData.content);
        setTags(extractedData.tags);
        setOrganizationId(extractedData.org_id);
        setOriginalCardData(extractedData);
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
      ShowToast("Failed to load card data", "error");
    } finally {
      setLoading("card", false);
    }
  }, [cardId, form]);

  useEffect(() => {
    setIsMounted(true);
    if (cardId) fetchCardData();
  }, [cardId, fetchCardData]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading("teams", true);
      setLoading("users", true);

      try {
        const userResponse = await fetch(`${apiUrl}/users/${user.id}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        });

        if (!userResponse.ok) throw new Error("Failed to fetch user details");

        const userData = await userResponse.json();
        const orgId = userData.user.organizations?.id || org_id;

        if (!orgId) {
          console.error("No organization ID found");
          return;
        }

        setOrganizationId(orgId);

        const [usersResponse, teamsResponse] = await Promise.all([
          fetch(`${apiUrl}/users/organizations/${orgId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          }),
          fetch(`${apiUrl}/teams/organizations/${orgId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          }),
        ]);

        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        const usersData = await usersResponse.json();
        if (usersData.success && Array.isArray(usersData.data)) {
          setUsers(usersData.data);
          if (isEditMode && originalCardData?.card_owner_id) {
            form.setValue("card_owner_id", originalCardData.card_owner_id);
          } else if (!isEditMode && usersData.data.length > 0) {
            form.setValue("card_owner_id", usersData.data[0].id);
          }
        }

        if (!teamsResponse.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsResponse.json();
        if (teamsData.success && Array.isArray(teamsData.teams)) {
          setTeams(teamsData.teams);
          if (isEditMode && originalCardData) {
            if (originalCardData.category_id) {
              form.setValue("category_id", originalCardData.category_id);
            }
            if (originalCardData.team_to_announce_id) {
              form.setValue(
                "team_to_announce_id",
                originalCardData.team_to_announce_id
              );
            }
          } else if (!isEditMode && teamsData.teams.length > 0) {
            form.setValue("category_id", teamsData.teams[0].id);
            form.setValue("team_to_announce_id", teamsData.teams[0].id);
          }
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("users", "Failed to load users. Please try again.");
      } finally {
        setLoading("teams", false);
        setLoading("users", false);
      }
    };

    fetchData();
  }, [user, form, isEditMode, org_id, originalCardData]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        return;
      }

      setLoading("subcategories", true);
      setError("subcategories", null);

      try {
        const response = await fetch(
          `${apiUrl}/sub-categories/teams/${selectedCategory}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          }
        );

        if (!response.ok) throw new Error("Failed to fetch subcategories");

        const data = await response.json();

        if (data.success && Array.isArray(data.subcategories)) {
          setSubcategories(data.subcategories);
          if (isEditMode && originalCardData?.folder_id) {
            const folderExists = data.subcategories.some(
              (sub: Subcategory) => sub.id === originalCardData.folder_id
            );
            if (folderExists) {
              form.setValue("folder_id", originalCardData.folder_id);
            } else {
              form.setValue("folder_id", "");
            }
          } else if (!isEditMode && data.subcategories.length > 0) {
            form.setValue("folder_id", data.subcategories[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("subcategories", "Failed to load folders. Please try again.");
      } finally {
        setLoading("subcategories", false);
      }
    };

    if (selectedCategory && (dataLoaded || isEditMode)) {
      fetchSubcategories();
    }
  }, [selectedCategory, form, isEditMode, originalCardData, dataLoaded]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !org_id) {
      setError("form", "User or organization information is missing");
      return;
    }

    // Validate all form fields
    const isValid = await form.trigger();
    if (!isValid) {
      // Show toast with specific validation errors
      const errors = form.formState.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join("\n");
      ShowToast("Please fix the following errors:\n" + errorMessages, "error");
      return;
    }

    // Additional title validation
    if (!values.title || values.title.trim().length < 4) {
      form.setError("title", {
        type: "manual",
        message: "Title must be at least 4 characters",
      });
      ShowToast("Please fix the title validation error", "error");
      return;
    }

    if (!editorContent || editorContent === "<p></p>") {
      form.setError("content", {
        type: "manual",
        message: "Content is required",
      });
      ShowToast("Please add some content to the card", "error");
      return;
    }

    setLoading("submitting", true);
    setIsPublishing(true);
    setError("form", null);
    try {
      const cardData = {
        ...values,
        title: values.title.trim(), // Ensure title is trimmed
        verificationperiod: values.verificationperiod.toISOString(),
        org_id,
        ...(!cardId && {card_status: CardStatus.PUBLISH}),
        content: editorContent,
        users: selectedUsers,
        team_access_id: team ? team.id : null,
        team_to_announce_id:
          values.team_to_announce_id === "none"
            ? null
            : values.team_to_announce_id,
        attachments: attachedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          type: file.type,
        })),
      };

      // Remove the period type before sending to backend
      delete cardData.verificationPeriodType;

      const url = isEditMode ? `${apiUrl}/cards/${cardId}` : `${apiUrl}/cards`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${isEditMode ? "update" : "create"} card`
        );
      }

      ShowToast(
        `Knowledge card ${isEditMode ? "updated" : "created"} successfully`,
        "success"
      );
      router.push("/knowledge-base");
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} card:`,
        error
      );
      setError(
        "form",
        error instanceof Error
          ? error.message
          : `Failed to ${
              isEditMode ? "update" : "create"
            } card. Please try again.`
      );
      ShowToast(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} card`,
        "error"
      );
    } finally {
      setLoading("submitting", false);
      setIsPublishing(false);
    }
  };

  const onSaveAsDraft = async () => {
    if (!user || !org_id) {
      setError("form", "User or organization information is missing");
      return;
    }

    // Validate required fields for draft
    const isValid = await form.trigger(["title", "content"]);
    if (!isValid) {
      ShowToast(
        "Please fix the validation errors before saving draft",
        "error"
      );
      return;
    }

    if (!editorContent || editorContent === "<p></p>") {
      form.setError("content", {
        type: "manual",
        message: "Content is required",
      });
      ShowToast("Please add some content to the card", "error");
      return;
    }

    setLoading("submitting", true);
    setError("form", null);

    try {
      setIsDrafting(true);

      const values = form.getValues();
      const cardData = {
        ...values,
        verificationperiod: values.verificationperiod.toISOString(),
        org_id,
        card_status: CardStatus.DRAFT,
        content: editorContent,
        users: selectedUsers,
        team_to_announce_id:
          values.team_to_announce_id === "none"
            ? null
            : values.team_to_announce_id,
        attachments: attachedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          type: file.type,
        })),
      };

      // Remove the period type before sending to backend
      delete cardData.verificationPeriodType;

      const response = await fetch(`${apiUrl}/cards`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(cardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save draft");
      }

      ShowToast("Draft saved successfully", "success");
      router.push("cards?status=draft");
    } catch (error) {
      console.error("Error saving draft:", error);
      setError(
        "form",
        error instanceof Error
          ? error.message
          : "Failed to save draft. Please try again."
      );
      ShowToast(
        error instanceof Error ? error.message : "Failed to save draft",
        "error"
      );
    } finally {
      setLoading("submitting", false);
      setIsDrafting(false);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const handleAttachFile = () => fileInputRef.current?.click();
  const handleUploadClick = () => uploadInputRef.current?.click();

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setIsContentEmpty(false);
  };

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!file) return null;

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/json",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        ShowToast(
          "Invalid file type. Please upload PDF, image, JSON, or DOC files only.",
          "error"
        );
        return null;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        ShowToast("File size too large. Maximum size is 10MB.", "error");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `card-attachments/${fileName}`;

      // First check if the bucket exists
      const {data: buckets} = await supabase.storage.listBuckets();
      const filesBucket = buckets?.find((bucket) => bucket.name === "files");

      if (!filesBucket) {
        // Create the bucket if it doesn't exist
        const {error: createError} = await supabase.storage.createBucket(
          "files",
          {
            public: true,
            allowedMimeTypes: allowedTypes,
            fileSizeLimit: maxSize,
          }
        );

        if (createError) {
          console.error("Error creating bucket:", createError);
          ShowToast("Failed to setup storage. Please try again.", "error");
          return null;
        }
      }

      // Upload the file
      const {data, error} = await supabase.storage
        .from("files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting if file exists
        });

      if (error) {
        console.error("Error uploading file:", error);
        ShowToast(`Failed to upload ${file.name}. Please try again.`, "error");
        return null;
      }

      // Get the public URL for the uploaded file
      const {
        data: {publicUrl},
      } = supabase.storage.from("files").getPublicUrl(filePath);

      if (!publicUrl) {
        ShowToast(
          `Failed to get URL for ${file.name}. Please try again.`,
          "error"
        );
        return null;
      }

      return publicUrl;
    } catch (error) {
      console.error("Error in file upload:", error);
      ShowToast("An unexpected error occurred. Please try again.", "error");
      return null;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFiles(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const url = await uploadFileToSupabase(file);
          if (url) {
            return {
              name: file.name,
              url: url,
              type: file.type,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          ShowToast(
            `Failed to upload ${file.name}. Please try again.`,
            "error"
          );
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(
        (file): file is {name: string; url: string; type: string} =>
          file !== null
      );

      if (validFiles.length > 0) {
        setAttachedFiles((prev) => [...prev, ...validFiles]);
        ShowToast(
          `Successfully uploaded ${validFiles.length} file(s)`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error handling file uploads:", error);
      ShowToast("Failed to upload files. Please try again.", "error");
    } finally {
      setIsUploadingFiles(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditorContentChange = (html: string) => {
    setEditorContent(html);
    form.setValue("content", html);
    setIsContentEmpty(!html || html === "<p></p>");
    if (html && html !== "<p></p>") {
      form.clearErrors("content");
    }
  };

  const getUserFullName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : "Select owner";
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Select team";
  };

  const isAnyLoading = Object.values(loadingStates).some((state) => state);

  // Update the FilePreview component to be more compact
  const FilePreview = ({
    file,
  }: {
    file: {name: string; url: string; type: string};
  }) => {
    return (
      <div className="flex items-center justify-between bg-[#2C2D2E] p-2 rounded-md w-[200px]">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white truncate flex-1 mr-2 hover:text-[#F9DB6F] cursor-pointer"
        >
          {file.name}
        </a>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeAttachedFile(attachedFiles.indexOf(file))}
          className="text-red-400 hover:text-red-300 p-1 flex-shrink-0 cursor-pointer"
        >
          <Trash2 className="cursor-pointer hover:text-red-300 " />
        </Button>
      </div>
    );
  };

  return (
    <div className="text-white py-4 md:py-6 min-h-screen flex flex-col">
      <div className="w-full flex-1">
        <div className="flex mb-6 md:mb-8 justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cursor-pointer">
            <ArrowBack link="/knowledge-base" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              {isEditMode ? "Edit Knowledge Card" : "Create Knowledge Card"}
            </h1>
          </div>
          <div className="flex justify-end items-center">
            <ManageCategory />
          </div>
        </div>

        {errors.form && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4">
            <p className="text-red-200">{errors.form}</p>
          </div>
        )}

        {loadingStates.card ? (
          <div className="w-full flex justify-center items-center py-8">
            <div className="flex flex-col items-center">
              <Loader />
              <p className="mt-2 text-white">Loading card data...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 min-h-[90vh]">
            {/* Left Side - Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full lg:w-[350px] xl:w-[431px] flex-shrink-0"
              >
                <div className="w-full bg-[#191919] rounded-[20px] p-6 space-y-6 h-full overflow-y-auto">
                  {/* Category Select */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-urbanist font-normal text-base leading-6 align-middle">
                        Select Category
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "cursor-pointer w-full h-[44px] bg-[#2C2D2E]  border border-white/10 rounded-[6px] px-4 py-3 justify-between",
                                  form.formState.errors.category_id &&
                                    "border-red-500"
                                )}
                              >
                                {loadingStates.teams ? (
                                  "Loading categories..."
                                ) : field.value && teams.length > 0 ? (
                                  getTeamName(field.value)
                                ) : (
                                  <span className="text-[#FFFFFF52]">
                                    Select the Category
                                  </span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2D2E] border-none text-white">
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Folder Select */}
                  <div>
                    <label className="font-urbanist font-normal text-base leading-6 align-middle">
                      Select Folder
                    </label>
                    <FormField
                      control={form.control}
                      name="folder_id"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              !selectedCategory || loadingStates.subcategories
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E]  border border-white/10 rounded-[6px] mt-2 justify-between">
                                {loadingStates.subcategories ? (
                                  "Loading folders..."
                                ) : !selectedCategory ? (
                                  "Select a category first"
                                ) : field.value && subcategories.length > 0 ? (
                                  subcategories.find(
                                    (sub) => sub.id === field.value
                                  )?.name || "Select folder"
                                ) : (
                                  <span className="text-[#FFFFFF52]">
                                    Select folder
                                  </span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2D2E] border-none text-white">
                              {subcategories.map((subcategory) => (
                                <SelectItem
                                  key={subcategory.id}
                                  value={subcategory.id}
                                >
                                  {subcategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Owner Select */}
                  <div>
                    <label className="font-urbanist font-normal text-base leading-6 align-middle">
                      Assign Card Owner
                    </label>
                    <FormField
                      control={form.control}
                      name="card_owner_id"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={loadingStates.users}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E]   border border-white/10 rounded-[6px] mt-2 justify-between">
                                {loadingStates.users ? (
                                  "Loading users..."
                                ) : field.value && users.length > 0 ? (
                                  getUserFullName(field.value)
                                ) : (
                                  <span className="text-[#FFFFFF52]">
                                    Select owner
                                  </span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2D2E] border-none text-white">
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {`${user.first_name} ${
                                    user.last_name || ""
                                  }`.trim()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <label className="font-urbanist font-normal text-base leading-6 align-middle">
                      Card Visibility
                    </label>
                    <FormField
                      control={form.control}
                      name="visibility"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E]   border border-white/10 rounded-[6px] mt-2 justify-between">
                                {field.value ? (
                                  visibilityLabels[field.value]
                                ) : (
                                  <span className="text-[#FFFFFF52]">
                                    Select visibility
                                  </span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2D2E] border-none text-white">
                              {visibilityOptions.map(({value, label}) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Verification Period */}
                  <div>
                    <label className="font-urbanist font-normal text-base leading-6 align-middle">
                      Select Verification Period
                    </label>
                    <FormField
                      control={form.control}
                      name="verificationPeriodType"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value !== "custom") {
                                const date = calculateDateFromPeriod(value);
                                form.setValue("verificationperiod", date);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E]   border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2">
                                <SelectValue placeholder="Select verification period">
                                  {field.value ? (
                                    formatPeriodDisplay(field.value)
                                  ) : (
                                    <span className="text-[#FFFFFF52]">
                                      Select period
                                    </span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2D2D2E] border-none text-white">
                              <SelectItem value="2week">2 Weeks</SelectItem>
                              <SelectItem value="1month">1 Month</SelectItem>
                              <SelectItem value="6months">6 Months</SelectItem>
                              <SelectItem value="12months">1 Year</SelectItem>
                              <SelectItem value="custom">
                                Custom Date
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {verificationPeriodType === "custom" && (
                      <div className="relative mt-2 w-full">
                        <DatePicker
                          selected={verificationPeriod}
                          onChange={(date) => {
                            if (date) {
                              form.setValue("verificationperiod", date);
                            }
                          }}
                          minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                          dateFormat="MMM d, yyyy"
                          customInput={<CustomDateInput />}
                          calendarClassName="custom-datepicker"
                          popperClassName="!z-50"
                          wrapperClassName="w-full"
                        />
                      </div>
                    )}

                    {verificationPeriodType &&
                      verificationPeriodType !== "custom" && (
                        <div className="mt-2 text-sm text-gray-400">
                          {/* {formatPeriodDisplay(verificationPeriodType)} */}
                        </div>
                      )}
                  </div>

                  {/* Notifying Team Select */}
                  <div>
                    <label className="font-urbanist font-normal text-base leading-6 align-middle">
                      Select Notifying Team
                    </label>
                    <FormField
                      control={form.control}
                      name="team_to_announce_id"
                      render={({field}) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={loadingStates.teams}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E]   border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2">
                                {loadingStates.teams ? (
                                  "Loading teams..."
                                ) : field.value ? (
                                  getTeamName(field.value)
                                ) : (
                                  <span className="text-[#FFFFFF52]">
                                    Select Team
                                  </span>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#2C2D2E] border-none text-white">
                              <SelectItem value="none">None</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-4 flex flex-col items-center">
                    <Button
                      type="submit"
                      className="w-full max-w-[232px] h-[48px] flex items-center justify-center gap-1 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-[8px] border border-black/10 px-4 py-3 cursor-pointer"
                      disabled={
                        isAnyLoading ||
                        isExtracting ||
                        isDrafting ||
                        isPublishing
                      }
                    >
                      {loadingStates.submitting ? (
                        <div className="flex items-center">
                          <Loader />
                          <span>
                            {/* {isEditMode ? "Updating..." : "Publishing..."} */}
                          </span>
                        </div>
                      ) : isAnyLoading &&
                        !loadingStates.submitting &&
                        isPublishing ? (
                        <div className="flex items-center">
                          <Loader />
                          {/* <span>Loading...</span> */}
                        </div>
                      ) : isEditMode ? (
                        "Update"
                      ) : (
                        "Publish"
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={onSaveAsDraft}
                      variant="outline"
                      className="w-full max-w-[232px]  h-[48px] flex items-center justify-center gap-1 bg-[#333435] text-white font-medium rounded-[8px] border border-white px-4 py-3 hover:bg-[#333435] hover:text-white opacity-100 cursor-pointer"
                      disabled={
                        isAnyLoading ||
                        isExtracting ||
                        isDrafting ||
                        isPublishing
                      }
                    >
                      {loadingStates.submitting && isDrafting ? (
                        <div className="flex items-center">
                          <Loader />
                          {/* <span>Saving...</span> */}
                        </div>
                      ) : (
                        "Save as Draft"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>

            {/* Right Side - Content Editor */}
            <div className="flex-1 bg-[#191919] rounded-[20px] p-6 md:p-10 flex flex-col">
              <Form {...form}>
                <div className="w-full bg-[#191919] rounded-[20px] flex flex-col h-full">
                  {/* Title */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                          <FormItem className="w-full">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    aria-label="Card title"
                                    placeholder="Enter your title here..."
                                    className={cn(
                                      "bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-xl sm:text-2xl md:text-[32px] leading-[24px] text-center align-middle text-white hover:bg-transparent w-auto placeholder:text-[#FFFFFF52] placeholder:font-urbanist",
                                      "transition-all duration-200 ease-in-out",
                                      "hover:scale-[1.02] focus:scale-[1.02]",
                                      "font-urbanist tracking-tight",
                                      "shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
                                      form.formState.errors.title &&
                                        "border-b border-red-500"
                                    )}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      field.onChange(value);
                                      form.trigger("title");
                                    }}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  aria-label="Edit title"
                                  className="p-1 flex items-center justify-center text-white hover:bg-transparent hover:text-white cursor-pointer"
                                >
                                  <Pen className="w-[24px] h-[24px]" />
                                </Button>
                              </div>
                            </div>
                            <FormMessage className="text-red-400 text-sm mt-1 text-center" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({field}) => (
                        <FormItem className="flex-1 flex flex-col">
                          <div
                            className={cn(
                              "flex-1 w-full border rounded-[20px] flex items-center justify-center p-2 border-none overflow-auto",
                              form.formState.errors.content &&
                                "border border-red-500"
                            )}
                          >
                            {isMounted && (
                              <TipTapEditor
                                content={editorContent}
                                onChange={handleEditorContentChange}
                                isContentEmpty={isContentEmpty}
                                onUploadClick={handleUploadClick}
                                isExtracting={isExtracting}
                                setIsExtracting={setIsExtracting}
                              />
                            )}
                            <input
                              type="file"
                              ref={uploadInputRef}
                              onChange={handleUploadChange}
                              className="hidden"
                              accept=".doc,.docx,.pdf,.txt"
                              aria-label="Upload document"
                            />
                          </div>
                          <FormMessage className="text-red-400 text-sm mt-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bottom Actions - Fixed at bottom */}
                  <div className="mt-4 sticky bottom-0 bg-[#191919] pt-4 pb-2">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      {/* Attach Files Section */}
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.json,.doc,.docx"
                          multiple
                          aria-label="Attach files"
                        />
                        <Button
                          type="button"
                          onClick={handleAttachFile}
                          className="bg-[#F9DB6F] h-[48px] w-full sm:w-[232px] hover:bg-[#F9DB6F]/90 text-black font-urbanist font-medium text-[14px] leading-[100%] justify-center items-center cursor-pointer"
                          disabled={isUploadingFiles}
                        >
                          {isUploadingFiles ? (
                            <div className="flex items-center">
                              <Loader />
                            </div>
                          ) : (
                            <>
                              <Image
                                alt="Paperclip icon"
                                src="/icons/paper-file.svg"
                                height={20}
                                width={16}
                                className="mr-2"
                              />
                              Attach Files
                            </>
                          )}
                        </Button>

                        {/* Attached Files List */}
                        {attachedFiles.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex-shrink-0">
                                <FilePreview file={file} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tags Section */}
                      <div className="w-full sm:w-auto">
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                          <Tag
                            initialTags={tags}
                            onTagsChange={handleTagsChange}
                            className="w-auto"
                            orgId={org_id || undefined}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ChooseTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamOpen(false)}
        teams={teams}
        onTeamSelect={onTeamSelect}
        selectedTeam={team}
      />
      <ChooseUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserOpen(false)}
        team={team}
        onConfirm={(users: any) => {
          setSelectedUsers(users);
        }}
      />
      <SelectUserModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(users: any) => {
          setSelectedUsers(users);
        }}
        org={org_id}
      />
    </div>
  );
}
