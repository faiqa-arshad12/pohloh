import ScoreProgress from "../shared/score-progress";

export default function TutorScoreCard({user}: {user?: any}) {
  const score = 88;

  return (
    <div className="w-full h-auto">
      <div className="bg-[#191919] rounded-[24px] p-6 py-8 flex items-center flex-col  justify-between text-white h-full">
        {/* Title */}
        <h2 className="text-white text-[24px] font-medium mb-6 text-center">
          Overall Tutor Score
        </h2>

        {/* Profile Image */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white-400">
            <img
              src={user?.profile_picture || "/placeholder-profile.svg"}
              alt="Tutor Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tutor Info */}
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-[24px] mb-1">
            {user?.first_name}
          </h3>
          <p className="text-[#CDCDCD] fotn-medium text-[15px]">
            {user?.email}
          </p>
        </div>

        {/* Subtitle */}

        {/* Progress Bar */}
        <div className="w-full mb-4">
          <ScoreProgress score={9} />
        </div>
      </div>
    </div>
  );
}
