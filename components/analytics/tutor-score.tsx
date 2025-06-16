import {useUserHook} from "@/hooks/useUser";
import {useRole} from "../ui/Context/UserContext";

export default function TutorScoreCard() {
  const score = 88;
  const tutorName = "Trent Boult";
  const tutorEmail = "Trentboult@gmail.com";
  const {roleAccess} = useRole();
  const {userData} = useUserHook();

  return (
    <div className="w-full">
      <div className="bg-[#191919] rounded-[24px] p-6 py-8 flex items-center flex-col text-white">
        {/* Title */}
        <h2 className="text-white text-[24px] font-medium mb-6 text-center">
          Overall Tutor Score
        </h2>

        {/* Profile Image */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white-400">
            <img
              src= {roleAccess === "user" ? userData?.profile_picture :"/placeholder-profile.svg"}
              alt="Tutor Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tutor Info */}
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-[24px] mb-1">
            {roleAccess === "user" ? userData?.first_name : tutorName}
          </h3>
          <p className="text-[#CDCDCD] fotn-medium text-[15px]">
            {roleAccess === "user" ? userData?.email : tutorEmail}
          </p>
        </div>

        {/* Subtitle */}


        {/* Progress Bar */}
        <div className="w-full mb-4">
          <div className="flex w-full h-10 rounded-[8px] overflow-hidden">
            {/* Filled portion */}
            <div
              className="bg-[#F9DB6F] text-black flex items-center justify-center font-bold text-base"
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
    </div>
  );
}
