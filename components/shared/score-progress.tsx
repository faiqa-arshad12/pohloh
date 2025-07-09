import React from "react";
import { useRole } from "../ui/Context/UserContext";

type ScoreProgressProps = {
  score?: number;
};

const ScoreProgress = ({score = 0}: ScoreProgressProps) => {
  return (
    <div className="w-full h-[40px] rounded-[8px] overflow-hidden flex">
      {/* Filled portion */}
      <div
        className="bg-[#F9DB6F] text-black flex items-center justify-center font-bold text-[16px] transition-all duration-300"
        style={{
          width: `${score}%`,
          minWidth: score > 0 ? "60px" : "0px",
        }}
      >
        {score || 0}%
      </div>

      {/* Unfilled portion with diagonal stripes */}
      <div
        className="flex-1 relative"
        style={{
          background: `repeating-linear-gradient(
      -45deg,
      #3A3A3A 0px,
      #3A3A3A 6px,
      #4A4A4A 6px,
      #4A4A4A 12px
    )`,
          display: (score || 88) === 100 ? "none" : "block",
        }}
      />
    </div>
  );
};

export default ScoreProgress;
