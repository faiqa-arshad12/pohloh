import {Headphones} from "lucide-react";

export default function TutorScoreCard() {
  const score = 88;

  return (
    <div className="w-full">
      <div className="bg-[#191919] rounded-[30px] p-4 py-8 flex items-center flex-col">
        {/* Title */}
        <h2 className="text-[24px] font-medium mb-8">Average Tutor Score</h2>

        {/* Headset Icon */}
        <div className="flex justify-center mb-8">
          <img src="/headphone.png" alt="head" />

          {/* <Headphones className="w-16 h-16 text-white" strokeWidth={1.5} /> */}
        </div>

        {/* Subtitle */}
        <p className="text-[16px] text-[#FFFFFF] mb-6">Overall Tutor Score</p>

        {/* Progress Bar */}
        <div className="flex flex-row gap-0 w-full h-12 rounded overflow-hidden ">
          {/* Filled portion */}
          <div
            className="bg-[#F9DB6F] text-black flex items-center justify-center font-bold text-lg transition-all duration-300"
            style={{width: `${score}%`}}
          >
            {score}%
          </div>

          {/* Unfilled portion with diagonal stripes */}
          <div
            className="bg-gray-700 flex-1 relative overflow-hidden"
            style={{
              backgroundImage: "url('/Frame.png')",
              backgroundColor: "#f0f0f0",
              width: "20%",
            }}
            role="img"
            aria-label="Preview thumbnail"
          
          >
            <div className="sr-only">Remaining {100 - score}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
