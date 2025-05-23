"use client";
import type React from "react";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {ArrowLeft, Pen} from "lucide-react";
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
import {useEffect, useRef, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useUser} from "@clerk/nextjs";
import { apiUrl } from "@/utils/constant";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="text-white">Loading Editor...</div>,
});

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, {message: "Title is required"}),
  category: z.string().min(1, {message: "Category is required"}),
  folder: z.string().min(1, {message: "Folder is required"}),
  owner: z.string().min(1, {message: "Owner is required"}),
  verificationPeriod: z.union([z.date(), z.string()]).optional(),
  notifyingTeam: z.string().min(1, {message: "Notifying team is required"}),
  content: z.string().optional(),
  tags: z.string().optional(),
});

export default function CardDetails() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "current" | "custom" | null
  >(null);
  const {user} = useUser();

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Title of the Card",
      content: "",
      tags: "",
    },
  });

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch teams data when user is available
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;

      try {
        // Fetch user details
        const userResponse = await fetch(
          `${apiUrl}/users/${user.id}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await userResponse.json();
        const orgId = userData.user.organizations?.id;

        if (!orgId) {
          console.error("No organization ID found");
          return;
        }

        // Fetch teams for the organization
        const teamsResponse = await fetch(
          `${apiUrl}/teams/organizations/${orgId}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
          }
        );

        if (!teamsResponse.ok) {
          throw new Error("Failed to fetch teams");
        }

        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTeams();
  }, [user]);

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", values);
    // Add API call to save the card
  };

  // Save as draft handler
  const onSaveAsDraft = () => {
    const values = form.getValues();
    console.log("Saving as draft:", values);
    // Add API call to save draft
  };

  // File attachment handler
  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  // File upload handler
  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  // Handle file upload change
  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file);
      setIsContentEmpty(false);
    }
  };

  // Handle file attachment change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File attached:", file);
      // Add logic to handle the attached file
    }
  };

  // ReactQuill editor configuration
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{size: []}],
      [{font: []}],
      [{align: ["right", "center", "justify"]}],
      [{list: "ordered"}, {list: "bullet"}],
      ["link", "image"],
      [{color: []}],
      [{background: []}],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "image",
    "background",
    "align",
    "size",
    "font",
  ];

  // Handle editor content change
  const handleEditorContentChange = (content: string) => {
    setEditorContent(content);
    form.setValue("content", content);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        {/* Left sidebar */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full lg:w-[350px] xl:w-[431px]"
          >
            <div className="w-full bg-[#191919] rounded-[20px] p-6 space-y-6 mb-6 lg:mb-0">
              {/* Category Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-urbanist font-normal text-base leading-6 align-middle">
                    Select Category
                  </label>
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={({field}) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between">
                            {teams?.find((team) => team.id === field.value)
                              ?.name || "Select the Category"}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2D2E] border-none text-white">
                          {teams?.length > 0 ? (
                            teams.map((dept: any) => (
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
              </div>

              {/* Folder Field */}
              <div>
                <label
                  htmlFor="folder-select"
                  className="font-urbanist font-normal text-base leading-6 align-middle"
                >
                  Select Folder
                </label>
                <FormField
                  control={form.control}
                  name="folder"
                  render={({field}) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="folder-select"
                            className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] mt-2 justify-between"
                          >
                            <SelectValue placeholder="Select folder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2D2E] border-none text-white">
                          <SelectItem value="QI Report">QI Report</SelectItem>
                          <SelectItem value="Documentation">
                            Documentation
                          </SelectItem>
                          <SelectItem value="Guides">Guides</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Owner Field */}
              <div>
                <label
                  htmlFor="owner-select"
                  className="font-urbanist font-normal text-base leading-6 align-middle"
                >
                  Assign Card Owner
                </label>
                <FormField
                  control={form.control}
                  name="owner"
                  render={({field}) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="owner-select"
                            className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2"
                          >
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2D2E] border-none text-white">
                          <SelectItem value="John Doe">John Doe</SelectItem>
                          <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                          <SelectItem value="Alex Johnson">
                            Alex Johnson
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Verification Period */}
              <div>
                <label
                  htmlFor="period-select"
                  className="font-urbanist font-normal text-base leading-6 align-middle"
                >
                  Select Verification Period
                </label>
                <FormField
                  control={form.control}
                  name="verificationPeriod"
                  render={({field}) => (
                    <FormItem>
                      {!selectedPeriod ? (
                        <Select
                          onValueChange={(value: string) => {
                            if (value === "current") {
                              setSelectedPeriod("current");
                            } else if (value === "custom") {
                              setSelectedPeriod("custom");
                              field.onChange(new Date());
                            }
                          }}
                          value=""
                        >
                          <FormControl>
                            <SelectTrigger
                              id="period-select"
                              className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2"
                            >
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#2D2D2E] border-none text-white">
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="custom">Custom Date</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex w-full">
                          {selectedPeriod === "current" && (
                            <div className="flex flex-col w-full">
                              <button
                                type="button"
                                className="text-white text-left flex gap-2 items-center mt-2"
                                onClick={() => setSelectedPeriod(null)}
                              >
                                <ArrowLeft className="w-4 h-4" /> Current
                              </button>
                              <Select
                                onValueChange={(value: string) => {
                                  field.onChange(`${value}-week`);
                                }}
                                value={
                                  typeof field.value === "string" &&
                                  field.value.endsWith("-week")
                                    ? field.value.split("-")[0]
                                    : ""
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2">
                                    <SelectValue placeholder="Select time period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#2D2D2E] border-none text-white">
                                  <SelectItem value="1">2 Week</SelectItem>
                                  <SelectItem value="2">1 Month</SelectItem>
                                  <SelectItem value="3">6 Months</SelectItem>
                                  <SelectItem value="4">12 Months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {selectedPeriod === "custom" && (
                            <div className="w-full mt-2">
                              <button
                                type="button"
                                className="text-white text-left flex gap-2 items-center mb-1"
                                onClick={() => setSelectedPeriod(null)}
                              >
                                <ArrowLeft className="w-4 h-4" /> Custom Date
                              </button>
                              <DatePicker
                                selected={field.value as Date}
                                onChange={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                  }
                                }}
                                className="w-full"
                                wrapperClassName="w-full"
                                placeholderText="Select date"
                                customInput={
                                  <input
                                    className="w-full p-2 bg-[#2C2D2E] border-none text-[#FFFFFF52] rounded-md focus:ring-0"
                                    aria-label="Select custom date"
                                  />
                                }
                                popperClassName="bg-[#2C2D2E] border-none text-white"
                                calendarClassName="bg-[#2C2D2E] border-none text-white"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notifying Team */}
              <div>
                <label
                  htmlFor="team-select"
                  className="font-urbanist font-normal text-base leading-6 align-middle"
                >
                  Select Notifying Team
                </label>
                <FormField
                  control={form.control}
                  name="notifyingTeam"
                  render={({field}) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="team-select"
                            className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2"
                          >
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#2C2D2E] border-none text-white">
                          <SelectItem value="Design Team">
                            Design Team
                          </SelectItem>
                          <SelectItem value="Development Team">
                            Development Team
                          </SelectItem>
                          <SelectItem value="Marketing Team">
                            Marketing Team
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3 flex flex-col items-center">
                <Button
                  type="submit"
                  className="w-[232px] h-[48px] flex items-center justify-center gap-1 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-[8px] border border-black/10 px-4 py-3 cursor-pointer"
                >
                  Publish
                </Button>

                <Button
                  type="button"
                  onClick={onSaveAsDraft}
                  variant="outline"
                  className="w-[232px] h-[48px] flex items-center justify-center gap-1 bg-[#333435] text-white font-medium rounded-[8px] border border-white px-4 py-3 hover:bg-[#333435] hover:text-white opacity-100 cursor-pointer"
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </form>
        </Form>

        {/* Main content area */}
        <div className="flex-1 bg-[#191919] rounded-[20px] p-6 md:p-10 space-y-6">
          <Form {...form}>
            <div className="w-full bg-[#191919] rounded-[20px] space-y-6">
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
                                className="bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0
                                  font-medium text-xl sm:text-2xl md:text-[32px] leading-[24px] text-center align-middle text-white hover:bg-transparent w-auto"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Content Editor */}
              <FormField
                control={form.control}
                name="content"
                render={() => (
                  <FormItem>
                    <div className="h-[300px] md:h-[446px] w-full border border-dashed border-gray-600 rounded-[20px] flex items-center justify-center">
                      {isContentEmpty ? (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <p className="font-urbanist font-medium text-[20px] leading-[100%] text-center text-[#FFFFFF] mb-4">
                            Enter Information or Upload the document...
                          </p>
                          <div>
                            <input
                              type="file"
                              ref={uploadInputRef}
                              onChange={handleUploadChange}
                              className="hidden"
                              accept=".doc,.docx,.pdf,.txt"
                              aria-label="Upload document"
                            />
                            <Button
                              type="button"
                              onClick={handleUploadClick}
                              className="bg-[#F9DB6F] w-full sm:w-[282px] hover:bg-[#F9DB6F]/90 font-urbanist font-medium text-[14px] text-black leading-[100%] px-6 cursor-pointer"
                            >
                              <Image
                                alt="Upload icon"
                                src="/icons/file-upload.svg"
                                height={16}
                                width={16}
                                className={cn(
                                  "mr-2 transition-transform duration-200"
                                )}
                              />
                              Upload
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <FormControl>
                          <div className="w-full h-full p-2 md:p-4">
                            {isMounted && (
                              <ReactQuill
                                theme="snow"
                                value={editorContent}
                                onChange={handleEditorContentChange}
                                className="h-[calc(100%-60px)] text-white"
                                modules={modules}
                                formats={formats}
                              />
                            )}
                          </div>
                        </FormControl>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bottom buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".doc,.docx,.pdf,.txt,.jpg,.png"
                    aria-label="Attach files"
                  />
                  <Button
                    type="button"
                    onClick={handleAttachFile}
                    className="bg-[#F9DB6F] h-[48px] w-full sm:w-[232px] hover:bg-[#F9DB6F]/90 text-black font-urbanist font-medium text-[14px] leading-[100%] justify-center items-center cursor-pointer"
                  >
                    <Image
                      alt="Paperclip icon"
                      src="/icons/paper-file.svg"
                      height={20}
                      width={16}
                      className={cn("mr-2 transition-transform duration-200")}
                    />
                    Attach Files
                  </Button>
                </div>

                <Tag
                  initialTags={["Frontend", "Backend"]}
                  onTagsChange={(tags) => {
                    form.setValue("tags", tags.join(","));
                  }}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

// export default CardDetails;
