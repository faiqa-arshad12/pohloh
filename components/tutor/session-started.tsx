"use client";

import type React from "react";
import {useState, useEffect, useRef} from "react";
import {Send, Loader2} from "lucide-react";
import Image from "next/image";
import {useSession} from "@/hooks/use-session";
import type {EvaluationResponse, ReportGenerationResponse} from "@/types/types";
import {useUserHook} from "@/hooks/useUser";
import {apiUrl, apiUrl_AI_Tutor} from "@/utils/constant";
import {QuestionState, SessionStartedProps} from "@/types/tutor-types";
import Loader from "../shared/loader";

export default function SessionStarted({
  questions,
  learningPathId,
  learningPathTitle,
  onSessionComplete,
  completedQuestions = 0,
  questionsAnswered = [],
  onQuestionUpdate,
}: SessionStartedProps) {
  const {sessionState, loadQuestions, evaluateAnswer, updateEvaluation} =
    useSession();
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReport, setSessionReport] =
    useState<ReportGenerationResponse | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const {userData} = useUserHook();
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Array<{
      question_id: string;
      user_answer: string;
      evaluation?: EvaluationResponse;
    }>
  >(questionsAnswered);

  useEffect(() => {
    if (questions && questions.length > 0) {
      // Log the questions answered data for debugging

      loadQuestions(questions, {
        completedQuestions,
        questionsAnswered,
      });

      const initialStates: QuestionState[] = questions.map(
        (question, index) => {
          // Find if this question has been answered before
          const previousAnswer = questionsAnswered?.find(
            (qa) => qa?.question_id === question?.id
          );

          const state = {
            question,
            userAnswer: previousAnswer?.user_answer || "",
            evaluation: previousAnswer?.evaluation || null,
            isAnswered: !!previousAnswer, // Mark as answered if we have a previous answer
            questionIndex: index,
            correct_answer:
              previousAnswer?.evaluation?.correct_answer ||
              question.correct_answer ||
              question.answer,
            question_type: question.type,
          };

          return state;
        }
      );

      setQuestionStates(initialStates);

      const firstUnansweredIndex = initialStates.findIndex(
        (state) => !state.isAnswered
      );
      const calculatedIndex =
        firstUnansweredIndex >= 0 ? firstUnansweredIndex : completedQuestions;

      setCurrentQuestionIndex(calculatedIndex);
    }
  }, [questions, loadQuestions, completedQuestions, questionsAnswered]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      setTimeout(() => {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }, 100);
    }
  }, [questionStates, currentQuestionIndex]);

  const updateQuestionProgress = async (
    questionId: string,
    userAnswer: string,
    evaluation: EvaluationResponse
  ) => {
    try {
      const newAnswerData = {
        question_id: questionId,
        user_answer: userAnswer,
        evaluation: evaluation,
      };

      setAnsweredQuestions((prev) => {
        const existingIndex = prev.findIndex(
          (qa) => qa.question_id === questionId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newAnswerData;
          return updated;
        }
        return [...prev, newAnswerData];
      });

      // Update backend
      const response = await fetch(
        `${apiUrl}/learning-paths/users/${learningPathId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // user_id: userData?.id,
            question_completed: currentQuestionIndex + 1,
            questions_answered: [...answeredQuestions, newAnswerData],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      // Verify the update was successful
      const updatedData = await response.json();
      if (updatedData.success) {
        console.log("Question progress updated successfully:", updatedData);
      } else {
        throw new Error("Server returned unsuccessful response");
      }
    } catch (error) {
      console.error("Error updating question progress:", error);
      // Revert local state on error
      setAnsweredQuestions((prev) =>
        prev.filter((qa) => qa.question_id !== questionId)
      );
    }
  };

  useEffect(() => {
    const handleSessionComplete = async () => {
      if (
        currentQuestionIndex >= questions.length &&
        !sessionReport &&
        !isGeneratingReport
      ) {
        setIsGeneratingReport(true);

        try {
          const evaluationPayload = {
            questions: questionStates.map((qState) => ({
              id: qState.question.id,
              question: qState.question.question,
              answer: qState.question.answer,
              type: qState.question.type,
              options: qState.question.options || [],
              correct_answer:
                qState.question.correct_answer || qState.question.answer,
              user_answer: qState.userAnswer,
              status: qState.evaluation?.status || "incorrect",
              score: qState.evaluation?.score || 0,
              feedback: qState.evaluation?.feedback || "",
              evaluation_timestamp:
                qState.evaluation?.evaluation_timestamp ||
                new Date().toISOString(),
            })),
          };

          const evaluationResponse = await fetch(
            `${apiUrl_AI_Tutor}/tutor-evaluation/evaluate-answers`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(evaluationPayload),
            }
          );

          if (!evaluationResponse.ok) {
            throw new Error("Failed to get evaluation report");
          }

          const evaluationData = await evaluationResponse.json();

          // const report = await generateSessionReport(
          //   learningPathId,
          //   learningPathTitle,
          //   userData?.id || ""
          // );

          // if (report) {
          //   setSessionReport(report);
          // }
        } catch (error) {
          console.error("Failed to generate session report:", error);
        } finally {
          setIsGeneratingReport(false);
        }
      }
    };

    handleSessionComplete();
  }, [
    currentQuestionIndex,
    questions.length,
    sessionReport,
    isGeneratingReport,
    learningPathId,
    learningPathTitle,
    userData?.id,
    questionStates,
  ]);

  const currentQuestion = questions[currentQuestionIndex];
  const isSessionComplete = currentQuestionIndex >= questions.length;

  const handleSubmitAnswer = async (answer?: string) => {
    const answerToSubmit =
      answer ||
      (currentQuestion?.type === "multiple" ? selectedOption : userInput);

    if (!answerToSubmit.trim() || !currentQuestion || isSubmitting) return;

    setIsSubmitting(true);

    setQuestionStates((prev) => {
      const newStates = [...prev];
      newStates[currentQuestionIndex] = {
        ...newStates[currentQuestionIndex],
        userAnswer: answerToSubmit,
        isAnswered: true,
      };
      return newStates;
    });

    setUserInput("");
    setSelectedOption("");
    const evaluation = await evaluateAnswer(answerToSubmit, currentQuestion);
    if (evaluation) {
      updateEvaluation(
        currentQuestionIndex,
        answerToSubmit,
        evaluation,
        currentQuestion
      );

      setQuestionStates((prev) => {
        const newStates = [...prev];
        newStates[currentQuestionIndex] = {
          ...newStates[currentQuestionIndex],
          evaluation: evaluation,
          correct_answer: evaluation.correct_answer,
        };
        return newStates;
      });

      await updateQuestionProgress(
        currentQuestion.id,
        answerToSubmit,
        evaluation
      );

      onQuestionUpdate?.();

      setTimeout(async () => {
        if (currentQuestionIndex + 1 >= questions.length) {
          try {
            // Format session data for the summary
            const sessionData = {
              questions: questionStates.map((qState) => ({
                id: qState.question.id,
                question: qState.question.question,
                answer: qState.userAnswer,
                type: qState.question.type,
                options: qState.question.options,
                correct_answer:
                  qState.evaluation?.correct_answer ||
                  qState.question.correct_answer ||
                  qState.question.answer,
                user_answer: qState.userAnswer,
                status: qState.evaluation?.status || "incorrect",
                score: qState.evaluation?.score || 0,
                feedback: qState.evaluation?.feedback || "",
                // evaluation_timestamp:
                //   qState.evaluation?.evaluation_timestamp ||
                //   new Date().toISOString(),
              })),
            };

            const updateResponse = await fetch(
              `${apiUrl}/learning-paths/users/${learningPathId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  // user_id: userData?.id,
                  completed: true,
                  question_completed: questions.length,
                  questions_answered: answeredQuestions,
                }),
              }
            );

            if (!updateResponse.ok) {
              throw new Error(
                "Failed to update learning path completion status"
              );
            }

            // Call onSessionComplete to show summary
            onSessionComplete?.(sessionData);
          } catch (error) {
            console.error("Error updating completion status:", error);
          }
        } else {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
        setIsSubmitting(false);
      }, 1000);
    } else {
      setIsSubmitting(false);
    }
  };

  // FIXED: handleOptionClick function to properly handle multiple choice questions
  const handleOptionClick = (option: string) => {
    // Debug the click event

    // Only allow clicking if not submitting and question is not already answered
    if (isSubmitting || questionStates[currentQuestionIndex]?.isAnswered) {
      return;
    }

    setSelectedOption(option);

    // Submit the answer after a short delay
    setTimeout(() => {
      handleSubmitAnswer(option);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !isSubmitting &&
      userInput.trim() &&
      currentQuestion?.type === "short"
    ) {
      handleSubmitAnswer();
    }
  };

  // Helper function to get option styling for multiple choice questions
  const getOptionStyling = (
    option: string,
    qState: QuestionState,
    index: number
  ) => {
    if (index === currentQuestionIndex && !qState.isAnswered) {
      return selectedOption === option
        ? "bg-[#F9DB6F1A] border-[#F9DB6F] cursor-pointer"
        : "hover:bg-[#F9DB6F1A] cursor-pointer";
    }

    if (qState.isAnswered && qState.userAnswer === option) {
      return "bg-[#F9DB6F1A]";
    }

    return "opacity-60";
  };

  if (sessionState.isLoading && sessionState.questions.length === 0) {
    return (
      <div className="h-[725px] w-full bg-[#191919] flex items-center justify-center text-white">
        <div className="flex items-center gap-2">
          <Loader />
          <span className="font-urbanist font-medium text-[16px]">
            Loading questions...
          </span>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    const correctAnswers = questionStates.filter(
      (q) => q.evaluation?.status === "correct"
    ).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const totalScore = questionStates.reduce(
      (sum, q) => sum + (q.evaluation?.score || 0),
      0
    );
    const averageScore = totalScore / totalQuestions;

    return (
      <div className="h-[725px] w-full bg-[#191919] flex flex-col text-white overflow-hidden">
        <div
          className="flex-1 overflow-y-auto [scrollbar-width:thin] p-4"
          ref={scrollRef}
        >
          {questionStates.map((qState, index) => (
            <div key={qState.question.id} className="mb-8">
              <div className="bg-[#222222] rounded-[20px] p-6 mb-6">
                <h2 className="font-urbanist font-extrabold text-[24px] leading-[100%] mb-4">
                  Question {index + 1}:
                </h2>
                <p className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0.1px] mb-6">
                  {qState.question.question}
                </p>

                {qState.question.type === "multiple" &&
                qState.question.options ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
                    {qState.question.options.map(
                      (option: string, idx: number) => (
                        <div
                          key={idx}
                          className={`py-3 px-4 bg-[#0E0F11] border-l border-[#F9DB6F] rounded-md text-center font-roboto flex font-medium text-[16px] leading-[20px] tracking-[0.1px] justify-center items-center transition-colors ${getOptionStyling(
                            option,
                            qState,
                            index
                          )}`}
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>

              {/* Show user answer for ALL answered questions (both multiple choice and short answer) */}
              {qState.isAnswered && qState.userAnswer && (
                <div className="flex justify-end gap-4 mb-6">
                  <div className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-center p-3 max-w-xl bg-[#333435] rounded-lg">
                    {qState.userAnswer}
                  </div>
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img
                      src={
                        userData?.profile_picture ||
                        "/placeholder.svg?height=56&width=56"
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* {qState.evaluation && (
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F9DB6F] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/chatPic.png"
                      alt="Tutor Avatar"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#222222] rounded-[20px] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-gray-300">
                          {qState.evaluation.status === "correct" ? (
                            <span className="text-green-400">
                              <span className="text-2xl">✅</span> Correct!
                            </span>
                          ) : (
                            <span className="text-red-400">
                              <span className="text-2xl">❌</span> Incorrect
                            </span>
                          )}
                        </p>
                        <span className="px-2 py-1 bg-[#F9DB6F] text-black rounded text-sm font-medium">
                          Score: {qState.evaluation.score}
                        </span>
                      </div>

                      {qState.evaluation.feedback && (
                        <p className="font-urbanist font-medium text-[18px] leading-[100%] tracking-[0.1px] text-gray-300 mb-2">
                          {qState.evaluation.feedback}
                        </p>
                      )}

                      {qState.evaluation.status === "incorrect" && (
                        <div className="mt-2">
                          <p className="font-urbanist font-medium text-[16px] leading-[100%] tracking-[0.1px] text-gray-400">
                            Your answer:{" "}
                            <span className="text-red-400">
                              {qState.userAnswer}
                            </span>
                          </p>
                          <p className="font-urbanist font-medium text-[16px] leading-[100%] tracking-[0.1px] text-gray-400 mt-1">
                            Correct answer:{" "}
                            <span className="text-green-400">
                              {qState.evaluation.correct_answer}
                            </span>
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Source: {qState.question.source} | Evaluated at:{" "}
                        {new Date(
                          qState.evaluation.evaluation_timestamp
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="h-[725px] w-full bg-[#191919] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="font-urbanist font-extrabold text-[24px] mb-4">
            No Questions Available
          </h2>
          <p className="font-urbanist font-medium text-[20px] text-gray-300">
            Please select a learning path to start.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[725px] w-full bg-[#191919] flex flex-col text-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {questionStates
          .slice(0, currentQuestionIndex + 1)
          .map((qState, index) => (
            <div key={qState.question.id} className="mb-8">
              <div className="bg-[#222222] rounded-[20px] p-6 mb-6">
                <h2 className="font-urbanist font-extrabold text-[24px] leading-[100%] mb-4">
                  Question {index + 1}:
                </h2>
                <p className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0.1px] mb-6">
                  {qState.question.question}
                </p>

                {qState.question.type === "multiple" &&
                qState.question.options ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
                    {qState.question.options.map(
                      (option: string, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => {
                            // FIXED: Debug the click event

                            // Only allow clicking if this is the current question and not already answered
                            if (
                              index === currentQuestionIndex &&
                              !qState.isAnswered
                            ) {
                              handleOptionClick(option);
                            }
                          }}
                          className={`py-3 px-4 bg-[#0E0F11] border-l border-[#F9DB6F] rounded-md text-center font-roboto flex font-medium text-[16px] leading-[20px] tracking-[0.1px] justify-center items-center transition-colors ${
                            index === currentQuestionIndex && !qState.isAnswered
                              ? "cursor-pointer"
                              : ""
                          } ${getOptionStyling(option, qState, index)}`}
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>

              {/* FIXED: Show user answer for ALL answered questions (including short answer during resume) */}
              {qState.isAnswered && qState.userAnswer && (
                <div className="flex justify-end gap-4 mb-6">
                  <div className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] flex justify-end p-3 ">
                    {qState.userAnswer}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-[#7963E4] overflow-hidden">
                    <img
                      src={
                        userData?.profile_picture ||
                        "/placeholder.svg?height=56&width=56"
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* FIXED: Show feedback for ALL answered questions during session - INCLUDING RESUMED ONES */}
              {qState.isAnswered && qState.evaluation && (
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F9DB6F] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/chatPic.png"
                      alt="Tutor Avatar"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-gray-300">
                          {qState.evaluation.status === "correct" ? (
                            <span className="text-[20px] font-bold font-urbanist">
                              {/* <span className="text-2xl"></span> Correct! */}
                            </span>
                          ) : (
                            <span className="text-[20px] font-bold font-urbanist">
                              Not quite!{" "}
                              <span className="text-[#F9DB6F]">
                                The correct answer is{" "}
                                {qState.evaluation.correct_answer}.
                              </span>
                            </span>
                          )}
                        </p>
                      </div>

                      {/* FIXED: Always show feedback from API - this should now work for resumed sessions */}
                      {qState.evaluation.feedback && (
                        <p className="font-urbanist font-medium text-[18px] leading-[100%] tracking-[0.1px] text-gray-300 mb-2">
                          {qState.evaluation.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {index === currentQuestionIndex && isSubmitting && (
                <div className="flex justify-center items-center py-4">
                  <Loader />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* FIXED: Show input for current unanswered question */}
      {!isSessionComplete &&
        currentQuestionIndex < questions.length &&
        !questionStates[currentQuestionIndex]?.isAnswered &&
        currentQuestion?.type === "short" && (
          <div className="w-full pt-4 pb-6 px-4 bg-[#191919]">
            <div className="relative flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter your text here"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-[58px] bg-[#0E0F11] border border-gray-700 rounded-[20px] py-3 px-4 pr-14 focus:outline-none border-0 h-[95px] disabled:opacity-50 font-urbanist text-white"
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button
                onClick={() => handleSubmitAnswer()}
                disabled={isSubmitting || !userInput.trim()}
                className="w-[52px] h-[52px] rounded-full bg-[#F9DB6F] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 text-black animate-spin" />
                ) : (
                  <Send className="h-5 w-5 text-black" />
                )}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
