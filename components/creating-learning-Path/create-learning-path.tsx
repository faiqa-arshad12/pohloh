"use client";

import type React from "react";

import {forwardRef, useState, useEffect} from "react";
import {Minus, Plus, ArrowLeft, PlusIcon, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useRouter} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {ShowToast} from "../shared/show-toast";
import {useUser} from "@clerk/nextjs";
import ArrowBack from "../shared/ArrowBack";
import VerificationPeriodPickerForm from "../shared/dateField";
import VerificationPeriodPicker from "./date-field";
// import {toast} from "@/components/ui/use-toast";

// Define types for the API responses
interface Team {
  id: string;
  name: string;
  org_id: string;
  lead_id: string | null;
  user_id: string | null;
  created_at: string;
  icon: string | null;
}

interface User {
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
  num_of_days: any[];
  num_of_questions: number;
  num_of_card: number;
  week_days: string[] | null;
  team_id: string | null;
  users_team: any | null;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  source: string;
  type: "Multiple Choice" | "Short Answer";
  options?: string[];
}

export default function CreateLearningPath() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<{
    card: any;
    // title?: string;
  } | null>(null);

  // State for teams and users data
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form data state
  const [formData, setFormData] = useState({
    pathTitle: "",
    owner: "",
    ownerId: "",
    category: "",
    categoryId: "",
    questionsPerCard: 5,
    questionStyle: "Multiple Choice",
    cardsSelected: 10,
    totalQuestions: 50,
  });

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    answer: "",
    source: "",
    type: "Multiple Choice",
    options: ["", "", "", ""],
  });

  // UI-specific states
  const [questionCount, setQuestionCount] = useState(2);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "current" | "custom" | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pathGenerated, setPathGenerated] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const {user} = useUser();
  const [verificationPeriod, setVerificationPeriod] = useState("");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  // Fetch teams and users data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const fetchWithAuth = async (url: string) => {
        const res = await fetch(url, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
        return res.json();
      };

      try {
        const userData = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`
        );

        const orgId = userData.user.organizations?.id;
        if (!orgId) {
          console.error("No organization ID found");
          return;
        }

        const [usersData, teamsData] = await Promise.all([
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users/organizations/${orgId}`
          ),
          fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/teams/organizations/${orgId}`
          ),
        ]);

        setUsers(usersData.data);
        setTeams(teamsData.teams);

        if (teamsData.teams.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: teamsData.teams[0].name,
            categoryId: teamsData.teams[0].id,
          }));
        }

        const savedCard = localStorage.getItem("selectedLearningPathCard");
        if (savedCard) {
          setSelectedCard(JSON.parse(savedCard));
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [user]);

  // Update total questions when relevant values change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      totalQuestions: prev.cardsSelected * prev.questionsPerCard,
    }));
  }, [formData.cardsSelected, formData.questionsPerCard]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.pathTitle.trim()) {
      errors.pathTitle = "Learning Path Title is required";
    }

    if (!formData.ownerId) {
      errors.owner = "Path Owner is required";
    }

    if (!formData.categoryId) {
      errors.category = "Category is required";
    }

    if (!selectedPeriod) {
      errors.period = "Verification Period is required";
    }

    if (!selectedCard) {
      errors.trainingContent = "Please select at least one training card";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "category") {
      const selectedTeam = teams.find((team) => team.name === value);
      if (selectedTeam) {
        setFormData((prev) => ({
          ...prev,
          category: value,
          categoryId: selectedTeam.id,
        }));
        setFormErrors((prev) => ({...prev, category: ""}));
      }
    } else if (name === "owner") {
      const selectedUser = users.find(
        (user) => `${user.first_name} ${user.last_name}` === value
      );
      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          owner: value,
          ownerId: selectedUser.id,
        }));
        setFormErrors((prev) => ({...prev, owner: ""}));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "pathTitle") {
      setFormErrors((prev) => ({...prev, pathTitle: ""}));
    }
  };

  const incrementQuestions = () => {
    setQuestionCount((prev) => prev + 1);
    setFormData((prev) => ({
      ...prev,
      questionsPerCard: prev.questionsPerCard + 1,
    }));
  };

  const decrementQuestions = () => {
    if (questionCount > 1) {
      setQuestionCount((prev) => prev - 1);
      setFormData((prev) => ({
        ...prev,
        questionsPerCard: Math.max(1, prev.questionsPerCard - 1),
      }));
    }
  };

  const handlePeriodChange = (value: "current" | "custom") => {
    setSelectedPeriod(value);
    setFormErrors((prev) => ({...prev, period: ""}));
    if (value === "current") {
      // Default to 1 week when selecting current period
    } else if (value === "custom") {
      // Initialize with current date
      setSelectedDate(new Date());
    }
  };

  const handleQuestionStyleChange = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      questionStyle: style,
    }));

    // Update the new question type if the modal is open
    if (isQuestionModalOpen) {
      setNewQuestion((prev) => ({
        ...prev,
        type: style as "Multiple Choice" | "Short Answer",
        options: style === "Multiple Choice" ? ["", "", "", ""] : undefined,
      }));
    }
  };

  const handleGeneratePath = () => {
    if (!validateForm()) {
      ShowToast("Please fill in all required fields", "error");

      return;
    }

    const savedCard = localStorage.getItem("selectedLearningPathCard");
    if (savedCard) {
      setSelectedCard(JSON.parse(savedCard));
      localStorage.removeItem("selectedLearningPathCard"); // Clear after loading
    }
    setPathGenerated(true);

    ShowToast("Path Generated Successfully", "success");
  };

  // Question modal handlers
  const openQuestionModal = () => {
    setIsQuestionModalOpen(true);
    setNewQuestion({
      question: "",
      answer: "",
      source: selectedCard?.card.name,
      type: formData.questionStyle as "Multiple Choice" | "Short Answer",
      options:
        formData.questionStyle === "Multiple Choice"
          ? ["", "", "", ""]
          : undefined,
    });
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setNewQuestion({
      question: "",
      answer: "",
      source: selectedCard?.card.name,
      type: formData.questionStyle as "Multiple Choice" | "Short Answer",
      options:
        formData.questionStyle === "Multiple Choice"
          ? ["", "", "", ""]
          : undefined,
    });
  };

  const handleQuestionInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => {
      const updatedOptions = [...(prev.options || ["", "", "", ""])];
      updatedOptions[index] = value;
      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const handleQuestionTypeChange = (
    type: "Multiple Choice" | "Short Answer"
  ) => {
    setNewQuestion((prev) => ({
      ...prev,
      type,
      options: type === "Multiple Choice" ? ["", "", "", ""] : undefined,
    }));
  };

  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) return;

    const questionToAdd: Question = {
      id: `question_${Date.now()}`,
      question: newQuestion.question || "",
      answer: newQuestion.answer || "",
      source: newQuestion.source || "",
      type: newQuestion.type as "Multiple Choice" | "Short Answer",
      options:
        newQuestion.type === "Multiple Choice"
          ? newQuestion.options
          : undefined,
    };

    setQuestions((prev) => [...prev, questionToAdd]);
    closeQuestionModal();
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const CustomInput = forwardRef<
    HTMLInputElement,
    {value?: string; onClick?: () => void}
  >(({value, onClick}, ref) => (
    <input
      className="w-full p-2 bg-[#2C2D2E] border-none text-white rounded-md focus:ring-0"
      onClick={onClick}
      ref={ref}
      value={value}
      readOnly
      placeholder="Select date"
    />
  ));

  CustomInput.displayName = "CustomInput";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white">
      <div className="mx-auto py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
            <ArrowBack link="/tutor" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              {"Creat Learning Path"}
            </h1>
          </div>

          {pathGenerated && (
            <Button
              variant="outline"
              className="h-[41px] w-[242px] border border-[#F9DB6F] text-black bg-[#F9DB6F] hover:bg-[#F9DB6F] hover:text-black rounded-md font-medium transition-colors duration-200 cursor-pointer"
              onClick={() => {}}
            >
              Publish
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 w-full">
          {/* Form Section */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="pathTitle" className="block text-sm">
                Learning Path Title
              </label>
              <Input
                id="pathTitle"
                name="pathTitle"
                placeholder="Insert Title"
                value={formData.pathTitle}
                onChange={handleInputChange}
                className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
              />
              {formErrors.pathTitle && (
                <p className="text-red-500 text-xs">{formErrors.pathTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="owner" className="block text-sm">
                Enter Path Owner
              </label>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => {
                  const selectedUser = users.find((user) => user.id === value);
                  if (selectedUser) {
                    setFormData((prev) => ({
                      ...prev,
                      owner: `${selectedUser.first_name} ${selectedUser.last_name}`,
                      ownerId: selectedUser.id,
                    }));
                    setFormErrors((prev) => ({...prev, owner: ""}));
                  }
                }}
              >
                <SelectTrigger
                  className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
                  style={{height: "44px"}}
                >
                  <SelectValue placeholder="Select path owner" />
                </SelectTrigger>
                <SelectContent className=" bg-[#2C2D2E] border-none text-white">
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
              {formErrors.owner && (
                <p className="text-red-500 text-xs">{formErrors.owner}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm">
                Select Category
              </label>
              <div className="relative">
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    handleSelectChange("category", value);
                    setFormErrors((prev) => ({...prev, category: ""}));
                  }}
                >
                  <SelectTrigger
                    className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
                    style={{height: "44px"}}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className=" bg-[#2C2D2E] border-none text-white">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name} className="">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.category && (
                <p className="text-red-500 text-xs">{formErrors.category}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <label className="block text-sm font-medium">
                Select Verification Period
              </label>
              <div className="space-y-2">
                {!selectedPeriod ? (
                  <Select
                    onValueChange={(value) => {
                      handlePeriodChange(value as "current" | "custom");
                      setFormErrors((prev) => ({...prev, period: ""}));
                    }}
                  >
                    <SelectTrigger
                      className="bg-[#2a2a2a] w-full border-none text-white"
                      style={{height: "44px"}}
                    >
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] w-full border-none text-white">
                      <SelectItem
                        className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
                        value="current"
                      >
                        Current Period
                      </SelectItem>
                      <SelectItem
                        className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
                        value="custom"
                      >
                        Custom Date
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPeriod(null)}
                        className="text-gray-400 hover:text-white hover:bg-transparent"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-300">
                        {selectedPeriod === "current"
                          ? "Current Period"
                          : "Custom Date"}
                      </span>
                    </div>

                    {selectedPeriod === "current" && (
                      <Select defaultValue="1">
                        <SelectTrigger className="bg-[#2a2a2a] w-full border-none text-white h-12">
                          <SelectValue placeholder="Select weeks" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] w-full border-none text-white">
                          {[1, 2, 3, 4].map((week) => (
                            <SelectItem
                              className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
                              key={week}
                              value={week.toString()}
                            >
                              {week} Week{week !== 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {selectedPeriod === "custom" && (
                      <div className="w-full">
                        <DatePicker
                          selected={selectedDate as Date}
                          onChange={(date) => date && setSelectedDate(date)}
                          className="w-full"
                          wrapperClassName="w-full"
                          customInput={<CustomInput />}
                          popperClassName="bg-[#2C2D2E] border-none text-white"
                          calendarClassName="bg-[#2C2D2E] border-none text-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formErrors.period && (
                <p className="text-red-500 text-xs">{formErrors.period}</p>
              )}
            </div> */}
            {/* <div className="space-y-2">
            <VerificationPeriodPickerForm/>

            </div> */}
            <div className="space-y-2">
              <VerificationPeriodPicker
                value={verificationPeriod}
                onChange={(value) => {
                  setVerificationPeriod(value);
                  setFormErrors((prev) => ({...prev, period: ""}));
                }}
                dateValue={customDate}
                onDateChange={setCustomDate}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Choose Training Content</label>
              <Button
                variant="outline"
                className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
                onClick={() => {
                  // Store current selection to return to
                  router.push("/knowledge-base?selectForLearningPath=true");
                }}
              >
                Select Cards
              </Button>
              {/* {selectedCard && (
                <p className="text-green-500 text-xs">
                  Card selected: {selectedCard.title}
                </p>
              )} */}
              {formErrors.trainingContent && (
                <p className="text-red-500 text-xs">
                  {formErrors.trainingContent}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm">
                Number of Questions per card
              </label>
              <div className="flex items-center bg-[#FFFFFF14] rounded-[6px] w-[130px] border border-[#F9DB6F]">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={incrementQuestions}
                >
                  <Plus size={16} />
                </Button>
                <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568] hover:text-[#f0d568] cursor-pointer">
                  {formData.questionsPerCard}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={formData.questionsPerCard <= 5}
                  className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                  onClick={decrementQuestions}
                >
                  <Minus size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">
                Choose Questions per style
              </label>
              <div className="flex gap-2">
                <Button
                  variant={
                    formData.questionStyle === "Multiple Choice"
                      ? "default"
                      : "outline"
                  }
                  className={
                    formData.questionStyle === "Multiple Choice"
                      ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
                      : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                  }
                  onClick={() => handleQuestionStyleChange("Multiple Choice")}
                >
                  Multiple Choice
                </Button>
                <Button
                  variant={
                    formData.questionStyle === "Short Answer"
                      ? "default"
                      : "outline"
                  }
                  className={
                    formData.questionStyle === "Short Answer"
                      ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
                      : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                  }
                  onClick={() => handleQuestionStyleChange("Short Answer")}
                >
                  Short Answer
                </Button>
              </div>
            </div>

            <div className="flex flex-col pt-4 space-y-3 justify-center items-center">
              <Button
                className="w-full bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium h-12 rounded-md cursor-pointer"
                onClick={handleGeneratePath}
              >
                Generate Path
              </Button>
              <Button
                variant="outline"
                className="w-full border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer"
                onClick={() => router.push("/tutor/drafts")}
              >
                Save as Draft
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="h-full w-full py-8">
            <div className="w-full bg-[#1a1a1a] rounded-lg  md:p-10 relative h-full min-h-[400px]">
              {pathGenerated ? (
                <div className="w-full bg-[#1a1a1a] rounded-lg p-6 text-white min-h-[500px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-medium">
                      Preview -{" "}
                      <span className="text-gray-400">
                        [ {formData.pathTitle || "Learning Path"} ]
                      </span>
                    </h2>
                    <Button
                      variant="outline"
                      className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-12 rounded-md flex items-center gap-2 cursor-pointer"
                      onClick={openQuestionModal}
                    >
                      <PlusIcon size={16} /> Add Questions
                    </Button>
                  </div>

                  <div className="font-medium text-[36px] text-[#7C7C7C] mb-4">
                    [ {formData.category || "Select a category"} ]
                  </div>

                  <div className="mb-6">
                    <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
                      Requirements:
                    </h3>
                    <div className="space-y-1 text-gray-200">
                      <p>
                        &gt; Number of Cards selected : {formData.cardsSelected}
                      </p>
                      <p>
                        &gt; Questions per card : {formData.questionsPerCard}
                      </p>
                      <p>
                        &gt; Total Path Questions: {formData.totalQuestions}
                      </p>
                      <p>&gt; Questions Styles: {formData.questionStyle}</p>
                      {formData.owner && (
                        <p>&gt; Path Owner: {formData.owner}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
                      Training Content:
                    </h3>
                    <div className="space-y-4">
                      {questions.map((q, index) => (
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
                            {/* {q.type === "Short Answer" && (
                              <p className="text-gray-400 italic">
                                Type your answer below
                              </p>
                            )} */}
                            {q.type === "Multiple Choice" && q.options && (
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

                          {/* <div>
                            <p className="font-medium">
                              Source:{" "}
                              <span className="text-[#f0d568]">{q.source}</span>
                            </p>
                          </div> */}

                          <div>
                            <p className="font-medium">
                              Type:{" "}
                              <span className="font-normal">{q.type}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white text-lg">
                  A preview will appear once path is generated.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add Question Modal */}
        <Dialog
          open={isQuestionModalOpen}
          onOpenChange={setIsQuestionModalOpen}
        >
          <DialogContent className="bg-[#1a1a1a] text-white border-[#333] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium">
                Add New Question
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="question" className="block text-sm font-medium">
                  Question
                </label>
                <Textarea
                  id="question"
                  name="question"
                  placeholder="Enter your question"
                  value={newQuestion.question}
                  onChange={handleQuestionInputChange}
                  className="bg-[#2a2a2a] border-[#333] text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Question Type
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      newQuestion.type === "Multiple Choice"
                        ? "default"
                        : "outline"
                    }
                    className={
                      newQuestion.type === "Multiple Choice"
                        ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
                        : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                    }
                    onClick={() => handleQuestionTypeChange("Multiple Choice")}
                  >
                    Multiple Choice
                  </Button>
                  <Button
                    variant={
                      newQuestion.type === "Short Answer"
                        ? "default"
                        : "outline"
                    }
                    className={
                      newQuestion.type === "Short Answer"
                        ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
                        : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                    }
                    onClick={() => handleQuestionTypeChange("Short Answer")}
                  >
                    Short Answer
                  </Button>
                </div>
              </div>

              {newQuestion.type === "Multiple Choice" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Options</label>
                  {newQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-gray-400"></div>
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="bg-[#2a2a2a] border-[#333] text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="answer" className="block text-sm font-medium">
                  Correct Answer
                </label>
                <Input
                  id="answer"
                  name="answer"
                  placeholder="Enter the correct answer"
                  value={newQuestion.answer}
                  onChange={handleQuestionInputChange}
                  className="bg-[#2a2a2a] border-[#333] text-white"
                />
              </div>

              {/* <div className="space-y-2">
                <label htmlFor="source" className="block text-sm font-medium">
                  Source
                </label>
                <Input
                  id="source"
                  name="source"
                  placeholder="Enter the source"
                  value={newQuestion.source}
                  onChange={handleQuestionInputChange}
                  className="bg-[#2a2a2a] border-[#333] text-white"
                />
              </div> */}
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeQuestionModal}
                className="border-gray-600 text-white hover:bg-[#333] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={addQuestion}
                className="bg-[#f0d568] text-black hover:bg-[#e0c558]"
                disabled={!newQuestion.question || !newQuestion.answer}
              >
                Add Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
