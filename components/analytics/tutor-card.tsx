import {useUserHook} from "@/hooks/useUser";

export default function TutorScoreCard() {
  const score = 88;
  const {userData} = useUserHook();

  return (
    <div className="w-full">
      <div className="bg-[#191919] rounded-[30px] p-4 py-8 flex items-center flex-col">
        {/* Title */}
        <h2 className="text-[24px] font-medium mb-8">Average Tutor Score</h2>

        {/* Headset Icon */}
        <div className="flex justify-center mb-8">
          <img
            src={
              userData?.organizations.org_picture || "/placeholder-profile.svg"
            }
            className="w-[120px] h-[120px] rounded-full"
            alt="profile"
          />

          {/* <Headphones className="w-16 h-16 text-white" strokeWidth={1.5} /> */}
        </div>

        {/* Subtitle */}
        <p className="text-[24px] text-[#FFFFFF] mb-3 font-bold">
          {userData?.organizations.name}
        </p>
        <p className="text-[15px] text-[#FFFFFF] mb-6 font-medium">
          pohloh@gmail.com
        </p>

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
              borderRadius:'8px'
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
