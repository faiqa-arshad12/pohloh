import {EvaluationResponse, Question_ as Question} from "./types";

export interface SessionStartedProps {
  questions: Question[];
  learningPathId: string;
  pathId?: string;
  learningPathTitle: string;
  onSessionComplete?: (data: {
    questions: Array<{
      id: string;
      question: string;
      answer: string;
      type: string;
      options?: string[];
      correct_answer: string;
    }>;
  }) => void;
  completedQuestions?: number;
  questionsAnswered?: Array<{
    question_id: string;
    user_answer: string;
    evaluation?: EvaluationResponse;
  }>;
}

export interface QuestionState {
  question: Question;
  userAnswer: string;
  evaluation: EvaluationResponse | null;
  isAnswered: boolean;
  questionIndex: number;
  correct_answer?: string;
  question_type?: string;
}

export interface SessionSummaryPayload {
  questions: {
    id: string;
    question: string;
    answer: string;
    type: string;
    options?: string[];
    correct_answer: string;
  }[];
}

export interface WelcomeScreenProps {
  userName?: string;
  id: string;
  selectedLearningPath?: {
    id: string;
    title: string;
    questions: Question[];
    question_completed?: number;
    questions_answered?: Array<{
      question_id: string;
      user_answer: string;
      evaluation?: any;
    }>;
  } | null;
  onStartSession?: () => void;
  onClearSelectedPath?: () => void;
}

export interface SessionData {
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    type: string;
    options?: string[];
    correct_answer: string;
  }>;
}

export interface SessionSummaryData {
  session_summary: {
    total_questions: number;
    score: string;
    percentage_score: number;
    performance_level: string;
    session_feedback: string;
  };
  question_breakdown: {
    correct_answers: number;
    incorrect_answers: number;
    partially_correct_answers: number;
  };
  wrong_answers: Array<{
    question_id: string;
    question: string;
    user_answer: string;
    correct_answer: string;
    feedback: string;
    status: string;
  }>;
  detailed_results: Array<{
    question_id: string;
    question: string;
    user_answer: string;
    correct_answer: string;
    status: string;
    score: number;
    feedback: string;
  }>;
  success: boolean;
  metadata: {
    evaluation_timestamp: string;
    relevance_threshold: number;
  };
}

export interface SessionSummaryProps {
  sessionData?: {
    questions: Array<{
      id: string;
      question: string;
      answer: string;
      type: string;
      options?: string[];
      correct_answer: string;
    }>;
  };
  onClose?: () => void;
  id: string;
}
