"use client";
import type React from "react";
import {useState, useEffect, useMemo} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Minus, Plus, X, PlusIcon} from "lucide-react";
import {useUser} from "@clerk/nextjs";
import VerificationPeriodPicker from "./verification-picker";
import {apiUrl, apiUrl_AI, frontend_url} from "@/utils/constant";
import ArrowBack from "../shared/ArrowBack";
import {ShowToast} from "../shared/show-toast";
import QuestionModal, {QuestionModalProps} from "./question-modal";
import QuestionPreview from "./questions-preview";
import Loader from "../shared/loader";
import {Skeleton} from "@/components/ui/skeleton";
import {createNotification} from "@/services/notification.service";
import {useUserHook} from "@/hooks/useUser";

// Types
type Question = {
  id: string;
  question: string;
  answer: string;
  type: "multiple" | "short";
  options?: string[];
  source?: string;
  source_id?: string;
  isManuallyAdded?: boolean; // Track if question was manually added
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

// Track the generation parameters to detect changes
type GenerationParams = {
  num_of_questions: number;
  question_type: "multiple" | "short";
  cardsSelected: number;
  selectedCardIds: string[];
};

// Add this helper at the top-level (after imports, before component):
function serializeFormDataToQuery(formData: PathFormData) {
  const params = new URLSearchParams();
  if (formData.title) params.set("title", formData.title);
  if (formData.path_owner) params.set("path_owner", formData.path_owner);
  if (formData.category) params.set("category", formData.category);
  if (formData.category_id) params.set("category_id", formData.category_id);
  if (formData.num_of_questions)
    params.set("num_of_questions", String(formData.num_of_questions));
  if (formData.question_type)
    params.set("question_type", formData.question_type);
  if (formData.verification_period)
    params.set("verification_period", formData.verification_period);
  if (formData.customDate)
    params.set("customDate", formData.customDate.toISOString());
  return params.toString();
}

// Helper to check if any form-related query param exists
function hasFormQueryParams(params: URLSearchParams) {
  return (
    params.get("title") ||
    params.get("path_owner") ||
    params.get("category") ||
    params.get("category_id") ||
    params.get("num_of_questions") ||
    params.get("question_type") ||
    params.get("verification_period") ||
    params.get("customDate")
  );
}

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
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string>("");
  const [apiData, setApiData] = useState<any>(null);
  const [isGenerating, setGenerating] = useState<boolean>(false);
  const [pathGenerated, setPathGenerated] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);

  // Track the last generation parameters
  const [lastGenerationParams, setLastGenerationParams] =
    useState<GenerationParams | null>(null);

  const [formData, setFormData] = useState<PathFormData>({
    title: "",
    path_owner: "",
    category: "",
    category_id: "",
    num_of_questions: 5,
    question_type: "multiple",
    cardsSelected: 0,
    totalQuestions: 5,
    verification_period: "",
    customDate: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const {userData} = useUserHook();
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    question: "",
    answer: "",
    type: "multiple",
    options: ["", "", "", ""],
  });

  // Memoized values
  const totalQuestionsNeeded = useMemo(() => {
    return formData.cardsSelected * formData.num_of_questions;
  }, [formData.cardsSelected, formData.num_of_questions]);

  // Current generation parameters
  const currentGenerationParams = useMemo(
    (): GenerationParams => ({
      num_of_questions: formData.num_of_questions,
      question_type: formData.question_type,
      cardsSelected: formData.cardsSelected,
      selectedCardIds: selectedCards?.map((card) => card.id) || [],
    }),
    [
      formData.num_of_questions,
      formData.question_type,
      formData.cardsSelected,
      selectedCards,
    ]
  );

  // Check if regeneration is needed
  const checkNeedsRegeneration = useMemo(() => {
    if (!pathGenerated || !lastGenerationParams || isGenerating) {
      return false;
    }

    const paramsChanged =
      lastGenerationParams.num_of_questions !==
        currentGenerationParams.num_of_questions ||
      lastGenerationParams.question_type !==
        currentGenerationParams.question_type ||
      lastGenerationParams.cardsSelected !==
        currentGenerationParams.cardsSelected ||
      JSON.stringify(lastGenerationParams.selectedCardIds.sort()) !==
        JSON.stringify(currentGenerationParams.selectedCardIds.sort());

    return paramsChanged;
  }, [
    pathGenerated,
    lastGenerationParams,
    currentGenerationParams,
    isGenerating,
  ]);

  // Update needsRegeneration state
  useEffect(() => {
    setNeedsRegeneration(checkNeedsRegeneration);
  }, [checkNeedsRegeneration]);

  const showToast = (message: string, type: "success" | "error") => {
    console.log(`[${type}] ${message}`);
    ShowToast(message, type);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasParams = hasFormQueryParams(params);

    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch user data to get organization ID
        const userResponse = await fetch(`${apiUrl}/users/${user.id}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
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
          }),
          fetch(`${apiUrl}/teams/organizations/${userOrgId}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
          }),
        ]);

        if (!usersResponse.ok || !teamsResponse.ok) {
          throw new Error("Failed to fetch users or teams data");
        }

        const usersData = await usersResponse.json();
        const teamsData = await teamsResponse.json();

        setUsers(usersData.data);
        setTeams(teamsData.teams);

        // Only fetch and set form data from API if NO query params
        if (pathId && !hasParams) {
          await fetchLearningPath(pathId);
        } else if (!pathId) {
          // For new paths, restore selected cards from localStorage
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

  const fetchLearningPath = async (id: string) => {
    try {
      const pathResponse = await fetch(`${apiUrl}/learning-paths/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
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

      // Set path as generated since we're editing
      setPathGenerated(true);

      // Set the last generation parameters based on loaded data
      setLastGenerationParams({
        num_of_questions: learningPath.num_of_questions || 5,
        question_type: learningPath.question_type || "multiple",
        cardsSelected: cardLearningPaths?.length || 0,
        selectedCardIds:
          cardLearningPaths?.map((clp: any) => clp.card?.id || clp.card_id) ||
          [],
      });
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
    } else if (formData.title.trim().length > 30) {
      errors.title = "Title must be no more than 30 characters long";
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

  const handleGeneratePath = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    try {
      setGenerating(true);
      setNeedsRegeneration(false); // Reset immediately when starting regeneration

      // Transform and prepare the data
      const transformedCards = selectedCards
        ? transformSelectedCards(selectedCards)
        : [];

      // Create the filtered data object
      const filteredData = {
        cards: transformedCards,
        num_of_questions: formData.num_of_questions,
        question_type: formData.question_type,
      };

      // Submit to API
      const response = await fetch(
        `${apiUrl_AI}/learningpath/questions-generation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate path");
      }

      const result = await response.json();

      // Transform the API response questions into the expected format
      const transformedQuestions = result.questions.map((q: any) => ({
        id: q.id,
        question: q.question_text,
        answer: q.correct_answer,
        type: q.question_type === "multiple_choice" ? "multiple" : "short",
        options: q.options || undefined,
        source: q.card_info?.card_title,
        source_id: q.card_info?.card_id,
        isManuallyAdded: false, // Mark as generated
      }));

      // Preserve manually added questions if regenerating
      let finalQuestions = transformedQuestions;
      if (pathGenerated && questions.length > 0) {
        const manualQuestions = questions.filter((q) => q.isManuallyAdded);
        finalQuestions = [...transformedQuestions, ...manualQuestions];
      }

      // Set the questions in state
      setQuestions(finalQuestions);

      // Update the last generation parameters
      setLastGenerationParams({
        num_of_questions: formData.num_of_questions,
        question_type: formData.question_type,
        cardsSelected: formData.cardsSelected,
        selectedCardIds: selectedCards?.map((card) => card.id) || [],
      });

      // Set path as generated and ensure regeneration flag is reset
      setPathGenerated(true);
      setNeedsRegeneration(false);

      showToast(
        pathGenerated
          ? "Path regenerated successfully"
          : "Path Generated Successfully",
        "success"
      );
    } catch (error) {
      console.error("Error generating path:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to generate path",
        "error"
      );
      // Reset regeneration flag on error
      setNeedsRegeneration(true);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const validateFormDataMatchesQuestions = () => {
    // If path is not generated yet, don't allow save/publish
    if (!pathGenerated) {
      showToast(
        "Please generate the path before saving or publishing",
        "error"
      );
      return false;
    }

    // If we're currently generating, don't validate
    if (isGenerating) {
      return true;
    }

    // Check if regeneration is needed
    if (needsRegeneration) {
      showToast(
        "Please regenerate the path after changing questions per card, question style, or selected cards",
        "error"
      );
      return false;
    }

    return true;
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
    } else if (value.trim().length > 30) {
      setFormErrors((prev) => ({
        ...prev,
        title: "Title must be no more than 30 characters long",
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

  // Transform selected cards into the desired format
  const transformSelectedCards = (cards: any[]) => {
    return cards.map((card) => ({
      id: card.id,
      title: card.title,
      content: card.content,
      tags: card.tags || [],
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

    // Transform selected cards into the desired format
    const transformedCards = selectedCards
      ? transformSelectedCards(selectedCards)
      : [];

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
    };
  };

  // Update handlePublish to include the new validation
  const handlePublish = async () => {
    setIsPublishing(true);

    if (!validateFormDataMatchesQuestions()) {
      setIsPublishing(false);
      return;
    }

    if (questions.length < formData.num_of_questions) {
      showToast(
        `Please add at least ${formData.num_of_questions} questions before publishing`,
        "error"
      );
      setIsPublishing(false);
      return;
    }

    try {
      // Prepare data for submission
      const learningPathData = prepareLearningPathData("published");

      // Submit to API
      const response = await fetch(
        `${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`,
        {
          method: pathId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish path");
      }

      // Notification logic for team
      if (formData.category_id) {
        await createNotification({
          user_id: userData?.id || "",
          org_id: orgId,
          message: `A new learning path '${formData.title}' was ${
            pathId ? "updated" : "created"
          } for your team`,
          // subtext: null,
          link: `${frontend_url}/tutor/explore-learning-paths`,
          notifying_team_ids: [formData.category_id],
        });
      }

      showToast(
        pathId
          ? "Learning path updated successfully!"
          : "Learning path published successfully!",
        "success"
      );

      // Redirect to the learning paths page
      router.push("/tutor/explore-learning-paths");
      localStorage.removeItem("selectedLearningPathCards");
    } catch (error) {
      console.error("Error publishing path:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to publish path",
        "error"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // Update handleSaveAsDraft to include the new validation
  const handleSaveAsDraft = async () => {
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    if (!validateFormDataMatchesQuestions()) {
      return;
    }

    try {
      setIsDrafting(true);

      // Prepare data for submission
      const learningPathData = prepareLearningPathData("draft");

      // Submit to API
      const response = await fetch(
        `${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`,
        {
          method: pathId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(learningPathData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save draft");
      }

      showToast("Learning path saved as draft", "success");
      localStorage.removeItem("selectedLearningPathCards"); // Clear after loading

      router.push("/tutor/drafts");
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save draft",
        "error"
      );
    } finally {
      setIsDrafting(false);
    }
  };

  // Question management
  const openQuestionModal = (questionToEdit?: any) => {
    console.log("Opening modal with form type:", formData.question_type);

    if (questionToEdit) {
      // If editing existing question, keep its current type
      console.log("Editing existing question with type:", questionToEdit.type);
      setCurrentQuestion({
        ...questionToEdit,
        options:
          questionToEdit.type === "multiple"
            ? [...(questionToEdit.options || ["", "", "", ""])]
            : undefined,
      });
    } else {
      const newQuestion = {
        id: crypto.randomUUID(),
        question: "",
        answer: "",
        type: formData.question_type,
        options:
          formData.question_type === "multiple" ? ["", "", "", ""] : undefined,
        source_id: selectedCards?.[0]?.id, // Set the first selected card's ID as default
        isManuallyAdded: true, // Mark as manually added
      };
      setCurrentQuestion(newQuestion);
    }
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    // Reset current question with the form's type
    setCurrentQuestion({
      id: "",
      question: "",
      answer: "",
      type: formData.question_type,
      options:
        formData.question_type === "multiple" ? ["", "", "", ""] : undefined,
    });
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
    // Update the current question's type
    setCurrentQuestion((prev) => ({
      ...prev,
      type: type,
      // Reset options if switching to short answer
      options: type === "multiple" ? ["", "", "", ""] : undefined,
    }));
  };

  // Add a debug effect to monitor question type changes
  useEffect(() => {
    console.log("Form question type:", formData.question_type);
    console.log("Current question type:", currentQuestion.type);
  }, [formData.question_type, currentQuestion.type]);

  // Add effect to monitor form data changes
  useEffect(() => {}, [formData.question_type, currentQuestion.type]);

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

    // Check if we're editing an existing question
    const existingQuestionIndex = questions.findIndex(
      (q) => q.id === currentQuestion.id
    );

    if (existingQuestionIndex !== -1) {
      // Update existing question
      setQuestions((prev) => {
        const newQuestions = [...prev];
        newQuestions[existingQuestionIndex] = {
          ...currentQuestion,
          isManuallyAdded: prev[existingQuestionIndex].isManuallyAdded || true,
        };
        return newQuestions;
      });
      showToast("Question updated successfully", "success");
    } else {
      // Add new question
      const sourceCard = selectedCards?.find(
        (card) => card.id === currentQuestion.source_id
      );

      const newQuestion: Question = {
        id: crypto.randomUUID(),
        question: currentQuestion.question,
        answer: currentQuestion.answer,
        type: currentQuestion.type,
        options: currentQuestion.options,
        source_id: currentQuestion.source_id,
        source: sourceCard?.title,
        isManuallyAdded: true, // Mark as manually added
      };

      setQuestions((prev) => [...prev, newQuestion]);
      showToast("Question added successfully", "success");
    }

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData((prev) => {
      const questionTypeParam = params.get("question_type");
      let question_type: "multiple" | "short" = prev.question_type;
      if (questionTypeParam === "multiple" || questionTypeParam === "short") {
        question_type = questionTypeParam;
      }
      return {
        ...prev,
        title: params.get("title") || prev.title,
        path_owner: params.get("path_owner") || prev.path_owner,
        category: params.get("category") || prev.category,
        category_id: params.get("category_id") || prev.category_id,
        num_of_questions: params.get("num_of_questions")
          ? Number(params.get("num_of_questions"))
          : prev.num_of_questions,
        question_type,
        verification_period:
          params.get("verification_period") || prev.verification_period,
        customDate: params.get("customDate")
          ? new Date(params.get("customDate") as string)
          : prev.customDate,
        cardsSelected: prev.cardsSelected,
        totalQuestions: prev.totalQuestions,
      };
    });
  }, [pathId]);

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="mx-auto py-4">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-4 sm:gap-7">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-8 w-[200px] rounded-lg" />
            </div>
            <Skeleton className="h-[41px] w-[242px] rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 w-full">
            {/* Form Section Skeleton */}
            <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 rounded-[20px]">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <Skeleton className="h-[44px] w-full rounded-md" />
                </div>
              ))}
              <div className="flex flex-col pt-4 space-y-5 justify-center items-center">
                <Skeleton className="h-12 w-[232px] rounded-md" />
                <Skeleton className="h-12 w-[232px] rounded-md" />
              </div>
            </div>

            {/* Preview Section Skeleton */}
            <div className="h-full w-full">
              <div className="w-full bg-[#1a1a1a] rounded-lg p-6 relative h-full min-h-[400px] rounded-[20px]">
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between p-4">
                    <Skeleton className="h-10 w-[150px] rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              className="h-[41px] w-[232px] border border-[#F9DB6F] text-black bg-[#F9DB6F] hover:bg-[#F9DB6F] hover:text-black rounded-md font-medium transition-colors duration-200 cursor-pointer"
              onClick={handlePublish}
              disabled={
                loading || isGenerating || isDrafting || needsRegeneration
              }
            >
              {isPublishing ? <Loader /> : "Publish"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 w-full">
          {/* Form Section */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 font-urbanist  rounded-[20px]">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-[16px] font-urbanist text-normal"
              >
                Learning Path Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Insert Title"
                value={formData.title}
                onChange={handleInputChange}
                className="h-[44px] bg-[#2a2a2a] text-[#FFFFFF52] rounded-md border border-transparent focus:border-[#F9DB6F]  focus:outline-none focus:!border-[#F9DB6F]"
              />

              {formErrors.title && (
                <p className="text-red-500 text-xs">{formErrors.title}</p>
              )}
            </div>

            {/* Path Owner */}
            <div className="space-y-2">
              <label
                htmlFor="path_owner"
                className="block text-[16px] font-urbanist text-normal"
              >
                Enter Path Owner
              </label>
              <Select
                value={formData.path_owner}
                onValueChange={(value) => handleSelectChange("owner", value)}
              >
                <SelectTrigger
                  className="w-full text-white bg-[#2C2D2E] text-[#FFFFFF52]"
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
              <label
                htmlFor="category"
                className="block text-[16px] font-urbanist text-normal"
              >
                Select Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger
                  className="w-full text-white bg-[#2C2D2E] text-[#FFFFFF52] focus:border-[#F9DB6F] focus:outline-none border border-transparent"
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
              <label className="block text-[16px] font-urbanist text-normal">
                Choose Training Content
              </label>
              <Button
                variant="outline"
                className="border bg-[#FFFFFF14] h-[44px] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
                onClick={() => {
                  const query = serializeFormDataToQuery(formData);
                  const url = pathId
                    ? `/knowledge-base?selectForLearningPath=true&id=${pathId}&${query}`
                    : `/knowledge-base?selectForLearningPath=true&${query}`;
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
              <label className="block text-[16px] font-urbanist text-normal">
                Number of Questions per card
              </label>
              <div className="flex items-center  p-2 bg-[#FFFFFF14] rounded-[6px] w-[144px] h-[61.8px] border border-[#F9DB6F]">
                <Button
                  variant="outline"
                  size="icon"
                  className="roundeed-[4px] w-[41.41pxpx] h-[34.61px]  border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={decrementQuestions}
                  disabled={formData.num_of_questions <= 1}
                >
                  <Minus
                    size={16}
                    className="roundeed-[4px] w-[41.41pxpx] h-[34.61px]"
                  />
                </Button>
                <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568]">
                  {formData.num_of_questions}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="roundeed-[4px] w-[41.41pxpx]  h-[34.61px] border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={incrementQuestions}
                  disabled={formData.num_of_questions >= 10}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Question style */}
            <div className="space-y-2 w-full">
              <label className="block text-[16px]] font-urbanist text-normal">
                Choose Questions style
              </label>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className={`w-full h-[44px] rounded-md  text-white font-urbanist font-normal bg-[#333435]  transition cursor-pointer ${
                    formData.question_type === "multiple"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435] "
                  }`}
                  onClick={() => handleQuestionStyleChange("multiple")}
                >
                  Multiple Choice
                </button>
                <button
                  type="submit"
                  className={`w-full h-[44px] rounded-md  text-whitebg-[#333435]  font-urbanist font-normal  transition cursor-pointer ${
                    formData.question_type === "short"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435] "
                  }`}
                  onClick={() => handleQuestionStyleChange("short")}
                >
                  Short Answer
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col pt-4 space-y-5 justify-center items-center">
              <Button
                className="w-full max-w-[232px] bg-[#f0d568] hover:bg-[#e0c558] text-[14px] text-black font-medium h-12 rounded-md cursor-pointer"
                onClick={handleGeneratePath}
                disabled={loading || isDrafting}
              >
                {isGenerating ? (
                  <Loader />
                ) : needsRegeneration && pathGenerated ? (
                  "Regenerate Path"
                ) : (
                  "Generate Path"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full max-w-[232px] border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer text-[14px] font-mediuum"
                onClick={handleSaveAsDraft}
                disabled={loading || isGenerating || needsRegeneration}
              >
                {isDrafting ? <Loader /> : "Save as Draft"}
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="h-full w-full">
            <div className="w-full bg-[#1a1a1a] rounded-lg p-6 relative h-full min-h-[400px] rounded-[20px]">
              {pathGenerated ? (
                <div className="flex flex-col">
                  <div className="flex flex-row justify-between p-4">
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
                            {selectedCards?.length || "N/A"}
                          </p>
                          <p>
                            &gt; Questions per card: {formData.num_of_questions}
                          </p>
                          <p>&gt; Total Path Questions: {questions.length}</p>
                          <p>
                            &gt; Questions Style:{" "}
                            {displayQuestionType(formData.question_type)}
                          </p>
                          {needsRegeneration && (
                            <p className="text-orange-400">
                              &gt; Status: Regeneration Required
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 rounded-md flex items-center gap-2 cursor-pointer min-w-[214px]"
                        onClick={openQuestionModal}
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

                    {/* {needsRegeneration && (
                      <div className="bg-orange-500/20 border border-orange-500 rounded-md p-3 mb-4 text-orange-200">
                        <p>
                          <strong>Regeneration Required:</strong> You've changed the generation parameters.
                          Please regenerate the path before saving or publishing.
                        </p>
                      </div>
                    )} */}

                    {/* Questions Display */}
                    <QuestionPreview
                      questions={questions}
                      displayQuestionType={displayQuestionType}
                      removeQuestion={removeQuestion}
                      onEditQuestion={openQuestionModal}
                      isLoading={isGenerating}
                    />
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
        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={closeQuestionModal}
          onAddQuestion={addQuestion}
          currentQuestion={currentQuestion}
          onQuestionChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onQuestionTypeChange={handleQuestionTypeChange}
          questionType={formData.question_type}
          isEditing={
            !!currentQuestion.id &&
            questions.some((q) => q.id === currentQuestion.id)
          }
          selectedCards={selectedCards || []}
          showToast={showToast}
        />
      </div>
    </div>
  );
}
