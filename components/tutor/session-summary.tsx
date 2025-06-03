import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import Leavefeedback from "./session-summary/leave-feedback";
import {Loader2} from "lucide-react";
import {apiUrl_AI_Tutor} from "@/utils/constant";
import {SessionSummaryData, SessionSummaryProps} from "@/types/tutor-types";

export default function SessionSummary({
  sessionData,
  onClose,
  id,
}: SessionSummaryProps) {
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsopen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionSummary = async () => {
      if (!sessionData) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${apiUrl_AI_Tutor}/tutor-evaluation/evaluate-answers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sessionData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session summary");
        }

        const data = await response.json();
        console.log(data, "sdjhsh");
        setSummaryData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session summary"
        );
        console.error("Error fetching session summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionSummary();
  }, [sessionData]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#F9DB6F]" />
          <span className="text-white">Generating session summary...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error loading session summary</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return null;
  }

  return (
    <div className="w-full h-[446px] border border-dashed border-white rounded-[20px] flex flex-col  gap-5 px-10">
      <div className="h-[446px] w-full  flex flex-col items-center justify-center text-center">
        <div className="flex flex-col text-white px-8 py-6 w-full mx-auto">
          <h2 className="font-urbanist font-medium text-[36px] leading-[100%] tracking-[0] mb-4 text-center">
            Session Summary
          </h2>

          <p className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center mb-6 text-white/80">
            {summaryData.session_summary.session_feedback}
          </p>

          <div className="text-sm text-white/90 space-y-2 font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center mb-6">
            <p>
              <span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">
                Total Questions:
              </span>{" "}
              {summaryData.session_summary.total_questions}
            </p>
            <p>
              <span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">
                Score:
              </span>{" "}
              {summaryData.session_summary.score}
            </p>
            <p>
              <span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">
                Performance Level:
              </span>{" "}
              {summaryData.session_summary.performance_level}
            </p>
            <p>
              <span className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-center">
                Percentage Score:
              </span>{" "}
              {summaryData.session_summary.percentage_score}%
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              className="bg-[#F9DB6F] h-[48px] w-[194px] text-black opacity-100 hover:opacity-80 font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] px-6 py-2 rounded-[8px] cursor-pointer"
              onClick={() => setIsopen(true)}
            >
              Continue
            </Button>
            <Button
              variant="outline"
              className="border h-[48px] w-[194px] border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] px-6 py-2 rounded-[8px]  cursor-pointer"
              onClick={onClose}
            >
              End Session
            </Button>
          </div>
          <Leavefeedback
            isOpen={isOpen}
            onClose={() => setIsopen(false)}
            learningPathId={id}
          />
        </div>
      </div>
    </div>
  );
}
