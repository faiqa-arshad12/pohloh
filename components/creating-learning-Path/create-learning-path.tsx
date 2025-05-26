"use client";

import type React from "react";

import {useState, useEffect, useMemo} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Minus, Plus, X, ArrowLeft, PlusIcon} from "lucide-react";
import {useUser} from "@clerk/nextjs";
import VerificationPeriodPicker from "./verification-picker";
import {apiUrl} from "@/utils/constant";
import ArrowBack from "../shared/ArrowBack";
import {ShowToast} from "../shared/show-toast";

// Types
type Question = {
  id: string;
  question: string;
  answer: string;
  type: "multiple" | "short";
  options?: string[];
};

type PathFormData = {
  title: string;
  path_owner: string;
  category: string;
  category_id: string;
  num_of_questions: number;
  question_type: "multiple" | "short";
  cardsSelected: number;
  totalQuestions: number;
  verification_period: string;
  customDate: Date | null;
};

export default function LearningPathPage() {
  const router = useRouter();

  const [pathId, setPathId] = useState<any>();
  const isEditing = !!pathId;
  const {user} = useUser();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPathId(params.get("id"));
  }, []);
  // State management
  const [selectedCards, setSelectedCards] = useState<any[] | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string>("");
  const [apiData, setApiData] = useState<any>(null);
  const [formData, setFormData] = useState<PathFormData>({
    title: "",
    path_owner: "",
    category: "",
    category_id: "",
    num_of_questions: 5,
    question_type: "multiple",
    cardsSelected: 10,
    totalQuestions: 50,
    verification_period: "",
    customDate: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    question: "",
    answer: "",
    type: "multiple",
    options: ["", "", "", ""],
  });
  const [pathGenerated, setPathGenerated] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Memoized values
  const totalQuestionsNeeded = useMemo(() => {
    return formData.cardsSelected * formData.num_of_questions;
  }, [formData.cardsSelected, formData.num_of_questions]);

  const questionsRemaining = useMemo(() => {
    return totalQuestionsNeeded - questions.length;
  }, [totalQuestionsNeeded, questions.length]);

  const isAllQuestionsAdded = useMemo(() => {
    return questions.length >= formData.num_of_questions;
  }, [questions.length, formData.num_of_questions]);

  // Toast function
  const showToast = (message: string, type: "success" | "error") => {
    // You can replace this with your actual toast implementation
    console.log(`[${type}] ${message}`);
    ShowToast(message, type);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user data to get organization ID
        const userResponse = await fetch(`${apiUrl}/users/${user.id}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          // credentials: "include",
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const userOrgId = userData.user.organizations?.id;

        if (!userOrgId) {
          console.error("No organization ID found");
          return;
        }

        setOrgId(userOrgId);

        // Fetch teams and users data in parallel
        const [usersResponse, teamsResponse] = await Promise.all([
          fetch(`${apiUrl}/users/organizations/${userOrgId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            // credentials: "include",
          }),
          fetch(`${apiUrl}/teams/organizations/${userOrgId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            // credentials: "include",
          }),
        ]);

        if (!usersResponse.ok || !teamsResponse.ok) {
          throw new Error("Failed to fetch users or teams data");
        }

        const usersData = await usersResponse.json();
        const teamsData = await teamsResponse.json();

        setUsers(usersData.data);
        setTeams(teamsData.teams);

        // If editing, fetch the learning path data
        if (pathId) {
          await fetchLearningPath(pathId);
        } else {
          // Check for selected cards in localStorage for new paths
          const savedCards = localStorage.getItem("selectedLearningPathCards");
          if (savedCards) {
            setSelectedCards(JSON.parse(savedCards));
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Failed to load initial data",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, pathId]);

  // Fetch learning path data
  const fetchLearningPath = async (id: string) => {
    try {
      const pathResponse = await fetch(`${apiUrl}/learning-paths/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        // credentials: "include",
      });

      if (!pathResponse.ok) {
        throw new Error("Failed to fetch learning path data");
      }

      const pathData = await pathResponse.json();
      const {learningPath, cardLearningPaths} = pathData.path;

      // Set API data for reference
      setApiData(learningPath);

      // Set form data from API response
      setFormData({
        title: learningPath.title || "",
        path_owner: learningPath.path_owner?.id || "",
        category: learningPath.category?.name || "",
        category_id: learningPath.category?.id || "",
        num_of_questions: learningPath.num_of_questions || 5,
        question_type: learningPath.question_type || "multiple",
        cardsSelected: cardLearningPaths?.length || 0,
        totalQuestions:
          (learningPath.num_of_questions || 5) *
          (cardLearningPaths?.length || 0),
        verification_period: learningPath.verification_period ? "custom" : "",
        customDate: learningPath.verification_period
          ? new Date(learningPath.verification_period)
          : null,
      });

      // Set questions from API data
      if (learningPath.questions) {
        setQuestions(learningPath.questions);
      }

      // Set selected cards from API data
      if (cardLearningPaths) {
        setSelectedCards(cardLearningPaths);
      }

      // Set path as generated since we're editing
      setPathGenerated(true);
    } catch (error) {
      console.error("Error fetching learning path:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to fetch learning path",
        "error"
      );
    }
  };

  // Update total questions when relevant values change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalQuestions: prev.cardsSelected * prev.num_of_questions,
    }));
  }, [formData.cardsSelected, formData.num_of_questions]);

  // Update cardsSelected when cards are selected
  useEffect(() => {
    if (selectedCards) {
      setFormData((prev) => ({
        ...prev,
        cardsSelected: selectedCards.length,
      }));
    }
  }, [selectedCards]);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Learning Path Title is required";
    } else if (formData.title.trim().length < 4) {
      errors.title = "Title must be at least 4 characters long";
    } else if (formData.title.trim().length > 50) {
      errors.title = "Title must be no more than 50 characters long";
    }

    if (!formData.path_owner) {
      errors.path_owner = "Path Owner is required";
    }

    if (!formData.category_id) {
      errors.category_id = "Category is required";
    }

    if (!formData.verification_period) {
      errors.verification_period = "Verification Period is required";
    }

    if (!selectedCards || selectedCards.length === 0) {
      errors.trainingContent = "Please select at least one training card";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate title field
    if (name === "title") {
      validateTitleField(value);
    }
  };

  const validateTitleField = (value: string) => {
    if (!value.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        title: "Learning Path Title is required",
      }));
    } else if (value.trim().length < 4) {
      setFormErrors((prev) => ({
        ...prev,
        title: "Title must be at least 4 characters long",
      }));
    } else if (value.trim().length > 50) {
      setFormErrors((prev) => ({
        ...prev,
        title: "Title must be no more than 50 characters long",
      }));
    } else {
      setFormErrors((prev) => ({...prev, title: ""}));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "category") {
      const selectedTeam = teams.find((team) => team.name === value);
      if (selectedTeam) {
        setFormData((prev) => ({
          ...prev,
          category: value,
          category_id: selectedTeam.id,
        }));
        setFormErrors((prev) => ({...prev, category_id: ""}));
      }
    } else if (name === "owner") {
      setFormData((prev) => ({
        ...prev,
        path_owner: value,
      }));
      setFormErrors((prev) => ({...prev, path_owner: ""}));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const incrementQuestions = () => {
    if (formData.num_of_questions < 20) {
      setFormData((prev) => ({
        ...prev,
        num_of_questions: prev.num_of_questions + 1,
      }));
    }
  };

  const decrementQuestions = () => {
    if (formData.num_of_questions > 1) {
      setFormData((prev) => ({
        ...prev,
        num_of_questions: Math.max(1, prev.num_of_questions - 1),
      }));
    }
  };

  const handleQuestionStyleChange = (style: "multiple" | "short") => {
    setFormData((prev) => ({
      ...prev,
      question_type: style,
    }));
  };

  // Prepare data for API
  const prepareLearningPathData = (
    status: "draft" | "generated" | "published"
  ) => {
    // Format the verification period date
    let verificationPeriod = null;
    if (formData.verification_period === "custom" && formData.customDate) {
      verificationPeriod = formData.customDate.toISOString();
    } else if (formData.verification_period) {
      const today = new Date();
      switch (formData.verification_period) {
        case "1week":
          verificationPeriod = new Date(
            today.setDate(today.getDate() + 7)
          ).toISOString();
          break;
        case "2week":
          verificationPeriod = new Date(
            today.setDate(today.getDate() + 14)
          ).toISOString();
          break;
        case "1month":
          verificationPeriod = new Date(
            today.setMonth(today.getMonth() + 1)
          ).toISOString();
          break;
        case "6months":
          verificationPeriod = new Date(
            today.setMonth(today.getMonth() + 6)
          ).toISOString();
          break;
        case "12months":
          verificationPeriod = new Date(
            today.setFullYear(today.getFullYear() + 1)
          ).toISOString();
          break;
      }
    }

    // Prepare the learning path data
    return {
      title: formData.title,
      path_owner: formData.path_owner,
      category: formData.category_id,
      num_of_questions: formData.num_of_questions,
      question_type: formData.question_type,
      verification_period: verificationPeriod,
      status: status,
      org_id: orgId,
      questions: questions,
      cards: selectedCards?.map((card) => card.id || card.card?.id) || [],
    };
  };

  // API actions
  const handleGeneratePath = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setLoading(true);

      // For editing, we don't need to generate a new path
      if (isEditing) {
        setPathGenerated(true);
        showToast("Path ready for editing", "success");
        return;
      }

      // Prepare data for submission
      const learningPathData = prepareLearningPathData("generated");

      // Submit to API
      const response = await fetch(`${apiUrl}/learning-paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(learningPathData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate path");
      }

      const result = await response.json();

      // If we get a path ID back, update the URL
      if (result && result.id) {
        router.push(`/learning-path?id=${result.id}`);
      }

      setPathGenerated(true);
      showToast("Path Generated Successfully", "success");
    } catch (error) {
      console.error("Error generating path:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to generate path",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    if (questions.length < formData.num_of_questions) {
      showToast(
        `Please add at least ${formData.num_of_questions} questions before publishing`,
        "error"
      );
      setIsPublishing(false);
      return;
    }

    try {
      setLoading(true);

      // Prepare data for submission
      const learningPathData = prepareLearningPathData("published");

      // If we're updating an existing path, include the ID
      // if (pathId) {
      //   learningPathData.id = pathId
      // }

      // Submit to API
      const response = await fetch(
        `${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`,
        {
          method: pathId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish path");
      }

      showToast(
        pathId
          ? "Learning path updated successfully!"
          : "Learning path published successfully!",
        "success"
      );

      // Redirect to the learning paths page
      router.push("/tutor/explore-learning-paths");
    } catch (error) {
      console.error("Error publishing path:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to publish path",
        "error"
      );
    } finally {
      setLoading(false);
      setIsPublishing(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setLoading(true);

      // Prepare data for submission
      const learningPathData = prepareLearningPathData("draft");

      // If we're updating an existing path, include the ID
      // if (pathId) {
      //   learningPathData.id = pathId
      // }

      // Submit to API
      const response = await fetch(
        `${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`,
        {
          method: pathId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save draft");
      }

      showToast("Learning path saved as draft", "success");
      router.push("/tutor/drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save draft",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Question management
  const openQuestionModal = () => {
    if (questions.length >= totalQuestionsNeeded) {
      showToast(
        `You've reached the maximum number of questions (${totalQuestionsNeeded})`,
        "error"
      );
      return;
    }

    setCurrentQuestion({
      id: crypto.randomUUID(),
      question: "",
      answer: "",
      type: formData.question_type,
      options:
        formData.question_type === "multiple" ? ["", "", "", ""] : undefined,
    });

    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
  };

  const handleQuestionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setCurrentQuestion((prev) => {
      const newOptions = [...(prev.options || [])];
      newOptions[index] = value;
      return {
        ...prev,
        options: newOptions,
      };
    });
  };

  const handleQuestionTypeChange = (type: "multiple" | "short") => {
    setCurrentQuestion((prev) => ({
      ...prev,
      type,
      options: type === "multiple" ? ["", "", "", ""] : undefined,
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showToast("Question text is required", "error");
      return;
    }

    if (!currentQuestion.answer.trim()) {
      showToast("Answer is required", "error");
      return;
    }

    if (
      currentQuestion.type === "multiple" &&
      (!currentQuestion.options ||
        currentQuestion.options.filter((o) => o.trim()).length < 2)
    ) {
      showToast(
        "At least two options are required for multiple choice questions",
        "error"
      );
      return;
    }

    if (questions.length >= totalQuestionsNeeded) {
      showToast(
        `You've reached the maximum number of questions (${totalQuestionsNeeded})`,
        "error"
      );
      return;
    }

    setQuestions((prev) => [...prev, currentQuestion]);
    closeQuestionModal();
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setIsPublishing(false); // Reset publishing state when questions change
  };

  // Helper functions
  const getOwnerDisplayName = (ownerId: string) => {
    const owner = users.find((user) => user.id === ownerId);
    return owner ? `${owner.first_name} ${owner.last_name}` : "";
  };

  const displayQuestionType = (type: "multiple" | "short") => {
    return type === "multiple" ? "Multiple Choice" : "Short Answer";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
            <ArrowBack link="/tutor" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight mb-3">
              {"Create Learning Path"}
            </h1>
          </div>

          {pathGenerated && (
            <Button
              variant="outline"
              className="h-[41px] w-[242px] border border-[#F9DB6F] text-black bg-[#F9DB6F] hover:bg-[#F9DB6F] hover:text-black rounded-md font-medium transition-colors duration-200 cursor-pointer"
              onClick={handlePublish}
            >
              {/* {isEditing ? "Update & Publish" : "Publish"} */}
              Publish
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[450px_1fr] gap-6 w-full">
          {/* Form Section */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 font-urbanist  rounded-[20px]">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm">
                Learning Path Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Insert Title"
                value={formData.title}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
              />
              {formErrors.title && (
                <p className="text-red-500 text-xs">{formErrors.title}</p>
              )}
            </div>

            {/* Path Owner */}
            <div className="space-y-2">
              <label htmlFor="path_owner" className="block text-sm">
                Enter Path Owner
              </label>
              <Select
                value={formData.path_owner}
                onValueChange={(value) => handleSelectChange("owner", value)}
              >
                <SelectTrigger
                  className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
                  style={{height: "44px"}}
                >
                  <SelectValue placeholder="Select path owner" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2D2E] border-none text-white">
                  {users.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
                    >
                      {`${user.first_name} ${user.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.path_owner && (
                <p className="text-red-500 text-xs">{formErrors.path_owner}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm">
                Select Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger
                  className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
                  style={{height: "44px"}}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2D2E] border-none text-white">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category_id && (
                <p className="text-red-500 text-xs">{formErrors.category_id}</p>
              )}
            </div>

            {/* Verification Period */}
            <div className="space-y-2">
              <VerificationPeriodPicker
                value={formData.verification_period}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    verification_period: value,
                  }));
                  setFormErrors((prev) => ({...prev, verification_period: ""}));
                }}
                dateValue={formData.customDate}
                onDateChange={(date) =>
                  setFormData((prev) => ({...prev, customDate: date}))
                }
                error={formErrors.verification_period}
              />
            </div>

            {/* Training Content */}
            <div className="space-y-2">
              <label className="block text-sm">Choose Training Content</label>
              <Button
                variant="outline"
                className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
                onClick={() => {
                  // Pass the current path ID if editing
                  const url = pathId
                    ? `/knowledge-base?selectForLearningPath=true&pathId=${pathId}`
                    : "/knowledge-base?selectForLearningPath=true";
                  router.push(url);
                }}
              >
                Select Cards
              </Button>
              {selectedCards && selectedCards.length > 0 && (
                <p className="text-green-500 text-xs">
                  Cards selected: {selectedCards.length}
                </p>
              )}
              {formErrors.trainingContent && (
                <p className="text-red-500 text-xs">
                  {formErrors.trainingContent}
                </p>
              )}
            </div>

            {/* Questions per card */}
            <div className="space-y-2">
              <label className="block text-sm">
                Number of Questions per card
              </label>
              <div className="flex items-center bg-[#FFFFFF14] rounded-[6px] w-[130px] border border-[#F9DB6F]">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={decrementQuestions}
                  disabled={formData.num_of_questions <= 1}
                >
                  <Minus size={16} />
                </Button>
                <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568]">
                  {formData.num_of_questions}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={incrementQuestions}
                  disabled={formData.num_of_questions >= 20}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Question style */}
            <div className="space-y-2 w-full">
              <label className="block text-sm">Choose Questions style</label>
              {/* <div className="flex gap-4">
                <Button
                  variant={
                    formData.question_type === "multiple"
                      ? "default"
                      : "outline"
                  }
                  className={
                    formData.question_type === "multiple"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md w-auto cursor-pointer h-[44px] px-6 cursor-pointer"
                      : "border-0 bg-[#222222] text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent h-[44px] px-6 cursor-pointer w-auto"
                  }
                  onClick={() => handleQuestionStyleChange("multiple")}
                >
                  Multiple Choice
                </Button>
                <Button
                  variant={
                    formData.question_type === "short" ? "default" : "outline"
                  }
                  className={
                    formData.question_type === "short"
                      ? "border border-[#F9DB6F] bg-[#191919]  text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer h-[44px]  px-6 cursor-pointer w-auto"
                      : " border-0 bg-[#FFFFFF0F] text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent h-[44px] px-6 cursor-pointer w-auto"
                  }
                  onClick={() => handleQuestionStyleChange("short")}
                >
                  Short Answer
                </Button>
              </div> */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  // onClick={handleClose}
                  className={`w-full h-[48px] rounded-md  text-white font-urbanist font-semibold bg-[#333435]  transition cursor-pointer ${
                    formData.question_type === "multiple"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435] "
                  }`}
                  onClick={() => handleQuestionStyleChange("multiple")}

                  // disabled={isLoading}
                >
                  Multiple Choice
                </button>
                <button
                  type="submit"
                  className={`w-full h-[48px] rounded-md  text-whitebg-[#333435]  font-urbanist font-semibold  transition cursor-pointer ${
                    formData.question_type === "short"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435] "
                  }`}
                  onClick={() => handleQuestionStyleChange("short")}
                >
                  {/* {isLoading ? (
                                <div className="flex flex-row justify-center items-center">
                                  <Loader />
                                </div>
                              ) : (
                                "Create Announcement"
                              )} */}
                  Short Answer
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col pt-4 space-y-3 justify-center items-center">
              <Button
                className="w-full bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium h-12 rounded-md cursor-pointer"
                onClick={handleGeneratePath}
                disabled={loading}
              >
                {/* {isEditing ? "Update Path" : "Generate Path"} */}
                {"Generate Path"}
              </Button>
              {/* {!isEditing && ( */}
              <Button
                variant="outline"
                className="w-full border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer"
                onClick={handleSaveAsDraft}
                disabled={loading}
              >
                Save as Draft
              </Button>
              {/* )} */}
            </div>
          </div>

          {/* Preview Section */}
          <div className="h-full w-full">
            <div className="w-full bg-[#1a1a1a] rounded-lg p-6 relative h-full min-h-[400px]  rounded-[20px]">
              {pathGenerated ? (
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between p-4">
                    {/* Question Counter */}

                    {/* Path Preview */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h2 className="text-[40px] font-medium">
                          {"Preview"} -{" "}
                          <span className="text-white">
                            [ {formData.title || "Learning Path"} ]
                          </span>
                        </h2>
                      </div>

                      <div className="font-medium text-[36px] text-[#7C7C7C] mb-4">
                        [ {formData.category || "Select a category"} ]
                      </div>

                      <div className="mb-6">
                        <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
                          Requirements:
                        </h3>
                        <div className="space-y-1 text-[#FFFFFF] text-[20px]">
                          <p>
                            &gt; Number of Cards selected:{" "}
                            {formData.cardsSelected}
                          </p>
                          <p>
                            &gt; Questions per card: {formData.num_of_questions}
                          </p>
                          <p>
                            &gt; Total Path Questions: {formData.totalQuestions}
                          </p>
                          <p>
                            &gt; Questions Style:{" "}
                            {displayQuestionType(formData.question_type)}
                          </p>
                          {/* {formData.path_owner && (
                            <p>
                              &gt; Path Owner:{" "}
                              {getOwnerDisplayName(formData.path_owner)}
                            </p>
                          )}
                          {apiData?.id && <p>&gt; Path ID: {apiData.id}</p>} */}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      {/* <div className="text-sm">
                      <span className="text-gray-400">Questions: </span>
                      <span className="text-white">{questions.length}</span>
                      <span className="text-gray-400"> / Required: </span>
                      <span className=F"text-white">{formData.num_of_questions}</span>
                      <span className="text-gray-400"> / Total: </span>
                      <span className="text-white">{formData.totalQuestions}</span>
                    </div> */}
                      <Button
                        variant="outline"
                        className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-10 rounded-md flex items-center gap-2 cursor-pointer !px-8"
                        onClick={openQuestionModal}
                        disabled={questions.length >= formData.totalQuestions}
                      >
                        <PlusIcon size={16} /> Add Questions
                      </Button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
                        Training Content:
                      </h3>
                      {/* <div className="text-sm">
                        {questions.length >= formData.totalQuestions ? (
                          <span className="text-green-500">
                            All required questions added ({questions.length}/
                            {formData.totalQuestions})
                          </span>
                        ) : (
                          <span
                            className={
                              isPublishing &&
                              questions.length < formData.num_of_questions
                                ? "text-red-500"
                                : "text-yellow-500"
                            }
                          >
                            {formData.totalQuestions - questions.length} more
                            question
                            {formData.totalQuestions - questions.length !== 1
                              ? "s"
                              : ""}{" "}
                            needed
                          </span>
                        )}
                      </div> */}
                    </div>

                    {isPublishing &&
                      questions.length < formData.num_of_questions && (
                        <div className="bg-red-500/20 border border-red-500 rounded-md p-3 mb-4 text-red-200">
                          <p>
                            You need to add at least {formData.num_of_questions}{" "}
                            questions before publishing.
                          </p>
                        </div>
                      )}

                    {/* Questions Display */}
                    <div className="space-y-4">
                      {questions.length === 0 ? (
                        <div className="bg-[#222222] rounded-lg p-5 text-center">
                          <p className="text-gray-400">
                            No questions added yet. Click "Add Questions" to get
                            started.
                          </p>
                        </div>
                      ) : (
                        questions.map((q, index) => (
                          <div
                            key={q.id}
                            className="bg-[#222222] rounded-lg p-5 space-y-4 relative"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
                              onClick={() => removeQuestion(q.id)}
                            >
                              <X size={16} />
                            </Button>
                            <div>
                              <h4 className="font-medium mb-2">
                                Question {index + 1}:
                              </h4>
                              <p className="mb-1">{q.question}</p>
                              {q.type === "multiple" && q.options && (
                                <div className="mt-2 space-y-2">
                                  {q.options.map((option, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-medium">
                                Answer:{" "}
                                <span className="font-normal">{q.answer}</span>
                              </p>
                            </div>

                            <div>
                              <p className="font-medium">
                                Type:{" "}
                                <span className="font-normal">
                                  {displayQuestionType(q.type)}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white text-lg p-6">
                  A preview will appear once path is generated.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Question Modal */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-xl">
              <h2 className="text-xl font-medium mb-4">Add Question</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm mb-1">
                    Question
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={currentQuestion.question}
                    onChange={handleQuestionChange}
                    className="w-full bg-[#2a2a2a] border-0 text-white rounded-md p-2 min-h-[100px]"
                    placeholder="Enter your question here"
                  />
                </div>

                {currentQuestion.type === "multiple" && (
                  <div>
                    <label className="block text-sm mb-1">Options</label>
                    <div className="space-y-2">
                      {currentQuestion.options?.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="answer" className="block text-sm mb-1">
                    Answer
                  </label>
                  <Input
                    id="answer"
                    name="answer"
                    value={currentQuestion.answer}
                    onChange={handleQuestionChange}
                    className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
                    placeholder="Enter the correct answer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                    onClick={closeQuestionModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md cursor-pointer"
                    onClick={addQuestion}
                  >
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
