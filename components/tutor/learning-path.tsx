"use client";

import {useEffect, useState} from "react";
import {MoreVertical, Eye, Star, Trash2, FileBadge, Pen} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import Welcome from "./welcome-screen";
import type {
  Question_ as Question,
  EnrolledPath,
  EnrolledPathsApiResponse,
} from "@/types/types";
import {apiUrl} from "@/utils/constant";
import {useUserHook} from "@/hooks/useUser";

export default function LearningPaths() {
  const router = useRouter();
  const [showLeaveFeedback, setShowLeaveFeedback] = useState(false);
  const [enrolledPaths, setEnrolledPaths] = useState<EnrolledPath[]>([]);
  const [id, setId] = useState("");
  const [selectedLearningPath, setSelectedLearningPath] = useState<{
    id: string;
    title: string;
    questions: Question[];
    question_completed: number;
    questions_answered?: Array<{
      question_id: string;
      user_answer: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {userData} = useUserHook();

  useEffect(() => {
    if (userData?.id) {
      fetchEnrolledPaths();
    }
  }, [userData]);

  const fetchEnrolledPaths = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${apiUrl}/learning-paths/enrolled-paths/${userData?.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data: EnrolledPathsApiResponse = await response.json();

      if (data.success) {
        setEnrolledPaths(data.paths);
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching enrolled paths:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathSelect = (path: EnrolledPath) => {
    const questions: Question[] = path.learning_path_id.questions || [];
    setId(path.learning_path_id.id);
    setSelectedLearningPath({
      id: path.id,
      title: path.learning_path_id.title,
      questions: questions,
      question_completed: path.question_completed,
      questions_answered: path.questions_answered,
    });
  };

  const handleClearSelectedPath = () => {
    setSelectedLearningPath(null);
    fetchEnrolledPaths();
  };

  const handleQuestionUpdate = async () => {
    try {
      // Fetch fresh data without showing loading state
      const response = await fetch(
        `${apiUrl}/learning-paths/enrolled-paths/${userData?.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data: EnrolledPathsApiResponse = await response.json();

      if (data.success) {
        setEnrolledPaths(data.paths);
      }
    } catch (err) {
      console.error("Error updating enrolled paths:", err);
    }
  };

  return (
    <div className="flex text-white">
      <div className="flex flex-col w-full overflow-auto">
        <h1 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0] py-4">
          Learning Paths
        </h1>

        <div className="flex flex-1 flex-col md:flex-row gap-4 just sm:flex-row pt-4 min-h-[90vh]">
          {/* Left sidebar */}
          <div className="relative w-fit pb-8 h-[90vh]">
            {/* SVG background */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 334 773"
              fill="none"
              className="absolute inset-0 z-0 w-full h-full scale-x-100"
              preserveAspectRatio="none"
            >
              <path
                d="M0 40C0 17.9086 17.9086 0 40 0H244.15C260.023 0 272.89 12.8672 272.89 28.7397C272.89 44.6123 285.757 57.4795 301.63 57.4795H302.445C318.768 57.4795 332 70.7117 332 87.0344V733C332 755.091 314.091 773 292 773H40C17.9086 773 0 755.091 0 733V40Z"
                fill="#191919"
              />
            </svg>

            {/* Main card content */}
            <div className="relative z-10 w-80 mb-5 rounded-lg flex flex-col h-full">
              <div className="space-y-4 px-4 py-4 flex-grow overflow-y-auto no-scrollbar text-white">
                <div className="p-4 font-urbanist font-[600] text-[20px] leading-[100%] tracking-[0] text-white pt-8">
                  Enrolled Learning Paths
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9DB6F]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-4 text-center">{error}</div>
                ) : enrolledPaths.length === 0 ? (
                  <div className="text-center p-4">
                    No enrolled learning paths found.
                  </div>
                ) : (
                  <div className="font-urbanist font-[600] text-[20px] leading-[100%] tracking-[0] text-white py-4 h-[68vh] overflow-auto gap-4 space-y-2">
                    {enrolledPaths.map((path) => {
                      const sessionCompleted =
                        path.question_completed ===
                        path.learning_path_id.num_of_questions;
                      const isSelected = selectedLearningPath?.id === path.id;

                      return (
                        <div
                          key={path.id}
                          className={`flex h-[101px] p-2 items-start mx-2 gap-[17px] rounded-2xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-[#0E0F11] opacity-80 border-0 border-[#F9DB6F] shadow-lg"
                              : "bg-[#0E0F11] opacity-100 hover:opacity-80 hover:bg-[#1A1B1D]"
                          }`}
                          onClick={() => handlePathSelect(path)}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${"bg-[#F9DB6F] text-black"}`}
                          >
                            <FileBadge className="h-4 w-4" />
                          </div>

                          <div className="flex-1">
                            <div
                              className={`font-urbanist font-medium text-[16px] leading-[100%] ${"text-white"}`}
                            >
                              {path.learning_path_id.title}
                            </div>
                            <div className="font-urbanist font-medium text-[12px] leading-[100%] text-[#828282] mt-1">
                              {path.learning_path_id.category.name}
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <div
                                className={`w-[118px] h-[29px] flex items-center gap-[10px] rounded-[8px] px-[10px] py-[6px] font-urbanist font-semibold text-[12px] leading-[100%] ${
                                  sessionCompleted
                                    ? "bg-[#707070] text-white"
                                    : isSelected
                                    ? "bg-transparent border border-[#F9DB6F] text-[#F9DB6F]"
                                    : "bg-transparent border border-white text-white"
                                }`}
                              >
                                Complete: {path.question_completed}/
                                {path.learning_path_id.questions.length}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`p-1 ${
                                  isSelected ? "text-[#F9DB6F]" : "text-white"
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4 cursor-pointer" />
                              </button>
                            </DropdownMenuTrigger>
                            {sessionCompleted ? (
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#222222] text-white border border-[#222222] rounded-md p-1"
                              >
                                <DropdownMenuItem className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]">
                                  <Eye className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                  <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">
                                    View
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]">
                                  <Star className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                  <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">
                                    Star
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]">
                                  <Trash2 className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                  <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">
                                    Delete
                                  </span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            ) : (
                              <DropdownMenuContent
                                align="end"
                                className="bg-[#222222] text-white border border-[#222222] rounded-md p-1"
                              >
                                <DropdownMenuItem
                                  className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowLeaveFeedback(!showLeaveFeedback);
                                  }}
                                >
                                  <Pen className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                  <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">
                                    Leave Feedback
                                  </span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            )}
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Button section - fixed at bottom */}
              <div className="sticky bottom-0 w-full mt-auto justify-center items-center flex flex-row bg-[#191919] py-4">
                <Button
                  className="w-full max-w-[232px] h-[48px] bg-[#F9DB6F] rounded-md text-sm text-black font-urbanist font-medium text-[14px] leading-[100%] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push("/tutor/explore-learning-paths")}
                >
                  Explore more learning paths
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <Welcome
            userName={userData?.first_name || ""}
            selectedLearningPath={selectedLearningPath}
            id={id}
            onClearSelectedPath={handleClearSelectedPath}
            onQuestionUpdate={handleQuestionUpdate}
          />
        </div>

        {showLeaveFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#222222] p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Leave Feedback</h3>
              <p className="text-gray-300 mb-4">
                Feedback form would go here...
              </p>
              <button
                onClick={() => setShowLeaveFeedback(false)}
                className="bg-[#F9DB6F] text-black px-4 py-2 rounded hover:opacity-80"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
