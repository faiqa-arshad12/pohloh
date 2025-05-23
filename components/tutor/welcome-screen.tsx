"use client";

import {PlayIcon} from "lucide-react";
import {useEffect, useState} from "react";
import SessionStarted from "./session-started";

interface WelcomeScreenProps {
  userName?: string;
  onStartSession?: () => void;
}

export default function Welcome({userName}: WelcomeScreenProps) {
  const [sessionstarted, setSessionStarted] = useState(false);

  const startSession = () => {
    setSessionStarted(true);
  };

  return (
    <div className="w-full  flex-1 flex flex-col items-center bg-[#191919] rounded-[20px] p-12 overflow-auto ]">
      {!sessionstarted ? (
        <div className="w-full  h-[446px] border border-dashed border-white rounded-[20px] flex flex-col items-center justify-center gap-5">
          <h2 className="font-urbanist font-medium text-[36px] leading-[100%] text-center mb-2">
            Hi {userName}, Welcome back to Tutor
          </h2>
          <p className="font-urbanist font-[500] text-[20px] leading-[100%] text-center text-[#CDCDCD] mb-6">
            Click start to begin the today’s session.
          </p>

          <div className="flex gap-4">
            <button
              onClick={startSession}
              className="py-2 px-12 bg-[#F9DB6F] opacity-100 hover:opacity-80 text-black rounded-md font-urbanist font-medium text-[14px] leading-[100%] flex items-center gap-2 h-[48px] cursor-pointer"
            >
              <PlayIcon /> Start Session
            </button>
            <button className="py-2 px-12 bg-[#333435] opacity-100 hover:opacity-80 border border-white hover:bg-[#333435] rounded-md font-urbanist font-medium text-[14px] leading-[100%] h-[48px] cursor-pointer">
              Remind me Later
            </button>
          </div>
        </div>
      ) : (
        <SessionStarted />
      )}
    </div>
  );
}
