"use client";

import {PlayIcon} from "lucide-react";
import {useState, useEffect} from "react";
import SessionStarted from "./session-started";
import SessionSummary from "./session-summary";
import {SessionData, WelcomeScreenProps} from "@/types/tutor-types";

export default function Welcome({
  userName,
  selectedLearningPath,
  onStartSession,
  onClearSelectedPath,
  id,
}: WelcomeScreenProps) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | undefined>(
    undefined
  );
  const [currentPathId, setCurrentPathId] = useState<string | null>(null);

  // Reset session state when learning path changes
  useEffect(() => {
    if (selectedLearningPath?.id !== currentPathId) {
      setSessionStarted(false);
      setSessionComplete(false);
      setSessionData(undefined);
      setCurrentPathId(selectedLearningPath?.id || null);
    }
  }, [selectedLearningPath?.id, currentPathId]);

  const startSession = () => {
    if (!selectedLearningPath || !selectedLearningPath.questions?.length) {
      alert("Please select a learning path with questions first!");
      return;
    }
    setSessionStarted(true);
    onStartSession?.();
  };

  const handleSessionComplete = (data: SessionData) => {
    setSessionStarted(false);
    setSessionComplete(true);
    setSessionData(data);
  };

  const handleCloseSummary = () => {
    setSessionComplete(false);
    setSessionData(undefined);
    onClearSelectedPath?.();
  };

  const hasQuestions = selectedLearningPath
    ? selectedLearningPath?.questions?.length > 0
    : 0;
  const questionCount = selectedLearningPath?.questions?.length || 0;
  const completedQuestions = selectedLearningPath?.question_completed || 0;
  const isPathCompleted =
    completedQuestions === questionCount && questionCount > 0;

  if (sessionComplete && sessionData) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#191919] rounded-[20px] p-12">
        <SessionSummary
          sessionData={sessionData}
          onClose={handleCloseSummary}
          id={id}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-[#191919] rounded-[20px] p-12 overflow-auto">
      {!sessionStarted ? (
        <div className="w-full h-[446px] border border-dashed border-white rounded-[20px] flex flex-col items-center justify-center gap-5">
          <h2 className="font-urbanist font-medium text-[36px] leading-[100%] text-center mb-2">
            Hi {userName || "User"}, Welcome back to Tutor
          </h2>

          {selectedLearningPath && (
            <div className="text-center mb-4">
              <p className="font-urbanist font-[500] text-[20px] leading-[100%] text-center text-[#CDCDCD]">
                Click start to begin the today’s session.
              </p>
            </div>
          )}
          {!selectedLearningPath && (
            <p className="font-urbanist font-[500] text-[20px] leading-[100%] text-center text-[#CDCDCD]">
              Please select a learning path to begin.
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={startSession}
              disabled={
                !selectedLearningPath || !hasQuestions || isPathCompleted
              }
              className="py-2 px-12 bg-[#F9DB6F] opacity-100 hover:opacity-80 text-black rounded-md font-urbanist font-medium text-[14px] leading-[100%] flex items-center gap-2 h-[48px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <PlayIcon className="h-4 w-4" />
              {!selectedLearningPath
                ? "Start Session"
                : completedQuestions > 0 && !isPathCompleted
                ? "Resume Session"
                : isPathCompleted
                ? "Session Ended"
                : "Start Session"}
            </button>
            {selectedLearningPath && !isPathCompleted && (
              <button className="py-2 px-12 bg-[#333435] opacity-100 hover:opacity-80 border border-white hover:bg-[#333435] rounded-md font-urbanist font-medium text-[14px] leading-[100%] h-[48px] cursor-pointer transition-opacity">
                Remind me Later
              </button>
            )}
          </div>
        </div>
      ) : (
        <SessionStarted
          questions={selectedLearningPath!.questions}
          learningPathId={selectedLearningPath!.id}
          learningPathTitle={selectedLearningPath!.title}
          onSessionComplete={handleSessionComplete}
          completedQuestions={completedQuestions}
          questionsAnswered={selectedLearningPath!.questions_answered}
        />
      )}
    </div>
  );
}
