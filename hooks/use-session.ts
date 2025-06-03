"use client";

import {useState, useCallback} from "react";
import type {
  EvaluationPayload,
  EvaluationResponse,
  SessionState,
  Question_ as Question,
  SessionReportData,
} from "@/types/types";
import {apiUrl_AI_Tutor} from "@/utils/constant";

export const useSession = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    evaluations: [],
    isLoading: false,
    isComplete: false,
    sessionReportData: [],
  });

  const loadQuestions = useCallback(
    (
      questions: Question[],
      resumeData?: {
        completedQuestions: number;
        questionsAnswered?: Array<{
          question_id: string;
          user_answer: string;
          evaluation?: EvaluationResponse;
        }>;
      }
    ) => {
      const answers = new Array(questions.length).fill("");
      const evaluations = new Array(questions.length).fill(null);
      const sessionReportData: SessionReportData[] = [];

      // FIXED: If resuming, populate previous answers and evaluations properly
      if (
        resumeData?.questionsAnswered &&
        resumeData.questionsAnswered.length > 0
      ) {
        console.log(
          "Loading resume data in useSession:",
          resumeData.questionsAnswered.length,
          "answered questions"
        );

        resumeData.questionsAnswered.forEach((answeredQuestion) => {
          const questionIndex = questions.findIndex(
            (q) => q.id === answeredQuestion.question_id
          );

          if (questionIndex !== -1) {
            // Store the user's answer
            answers[questionIndex] = answeredQuestion.user_answer;

            // FIXED: Ensure evaluation exists and is properly structured
            if (answeredQuestion.evaluation) {
              // Store the evaluation
              evaluations[questionIndex] = answeredQuestion.evaluation;

              // Add to session report data
              const question = questions[questionIndex];
              sessionReportData[questionIndex] = {
                question_id: question.id,
                question: question.question,
                user_answer: answeredQuestion.user_answer,
                correct_answer:
                  answeredQuestion.evaluation.correct_answer ||
                  question.correct_answer ||
                  question.answer,
                status: answeredQuestion.evaluation.status,
                score: answeredQuestion.evaluation.score,
                feedback: answeredQuestion.evaluation.feedback,
                evaluation_timestamp:
                  answeredQuestion.evaluation.evaluation_timestamp,
                source: question.source,
                question_type: question.type,
              };
            }
          }
        });
      }

      setSessionState({
        currentQuestionIndex: resumeData?.completedQuestions || 0,
        questions: questions,
        answers: answers,
        evaluations: evaluations,
        isLoading: false,
        isComplete: false,
        sessionReportData: sessionReportData,
      });
    },
    []
  );

  const updateEvaluation = useCallback(
    (
      index: number,
      answer: string,
      evaluation: EvaluationResponse,
      question: Question
    ) => {
      setSessionState((prev) => {
        const newAnswers = [...prev.answers];
        const newEvaluations = [...prev.evaluations];
        const newReportData = [...prev.sessionReportData];

        newAnswers[index] = answer;
        newEvaluations[index] = evaluation;

        const reportEntry: SessionReportData = {
          question_id: question.id,
          question: question.question,
          user_answer: answer,
          correct_answer: question.correct_answer || question.answer,
          status: evaluation.status,
          score: evaluation.score,
          feedback: evaluation.feedback,
          evaluation_timestamp: evaluation.evaluation_timestamp,
          source: question.source,
          question_type: question.type,
        };

        newReportData[index] = reportEntry;

        return {
          ...prev,
          answers: newAnswers,
          evaluations: newEvaluations,
          sessionReportData: newReportData,
          isLoading: false,
        };
      });
    },
    []
  );

  const evaluateAnswer = useCallback(
    async (answer: string, currentQuestion: Question) => {
      if (!currentQuestion) return null;

      setSessionState((prev) => ({...prev, isLoading: true}));

      const payload: EvaluationPayload = {
        question_id: currentQuestion.id,
        question: currentQuestion.question,
        user_answer: answer,
        question_type: currentQuestion.type,
        correct_answer:
          currentQuestion.correct_answer || currentQuestion.answer,
        options: currentQuestion.options || [],
        relevance_threshold: 0.5,
        source: currentQuestion.source,
        source_id: currentQuestion.source_id,
      };

      try {
        const response = await fetch(
          `${apiUrl_AI_Tutor}/tutor-evaluation/evaluate-single-question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const evaluation: EvaluationResponse = await response.json();

        return evaluation;
      } catch (error) {
        console.error("Error evaluating answer:", error);
        setSessionState((prev) => ({...prev, isLoading: false}));

        const fallbackEvaluation: EvaluationResponse = {
          question_id: currentQuestion.id,
          question: currentQuestion.question,
          user_answer: answer,
          correct_answer:
            currentQuestion.correct_answer || currentQuestion.answer,
          status:
            answer.toLowerCase().trim() ===
            (currentQuestion.correct_answer || currentQuestion.answer)
              .toLowerCase()
              .trim()
              ? "correct"
              : "incorrect",
          score:
            answer.toLowerCase().trim() ===
            (currentQuestion.correct_answer || currentQuestion.answer)
              .toLowerCase()
              .trim()
              ? 1.0
              : 0.0,
          feedback:
            answer.toLowerCase().trim() ===
            (currentQuestion.correct_answer || currentQuestion.answer)
              .toLowerCase()
              .trim()
              ? "Great job!"
              : `The correct answer is: ${
                  currentQuestion.correct_answer || currentQuestion.answer
                }`,
          evaluation_timestamp: new Date().toISOString(),
        };

        console.log("Using fallback evaluation:", fallbackEvaluation);
        return fallbackEvaluation;
      }
    },
    []
  );

  const nextQuestion = useCallback(() => {
    setSessionState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isComplete = nextIndex >= prev.questions.length;

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete,
      };
    });
  }, []);

  const resetSession = useCallback(() => {
    setSessionState({
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      evaluations: [],
      isLoading: false,
      isComplete: false,
      sessionReportData: [],
    });
  }, []);

  const logSessionData = useCallback(() => {
    console.log("Current session data:", sessionState.sessionReportData);
    return sessionState.sessionReportData;
  }, [sessionState.sessionReportData]);

  return {
    sessionState,
    loadQuestions,
    evaluateAnswer,
    updateEvaluation,
    // generateSessionReport,
    nextQuestion,
    resetSession,
    logSessionData,
  };
};
