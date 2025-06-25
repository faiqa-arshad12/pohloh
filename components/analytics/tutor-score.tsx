import {useEffect, useState} from "react";
import ScoreProgress from "../shared/score-progress";
import {fetchTutorScore} from "./analytic.service";
import {Skeleton} from "../ui/skeleton";

export default function TutorScoreCard({user}: {user?: any}) {
  const [data, setData] = useState<any>();
  const [isLoadingData, setIsLoadingData] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setIsLoadingData(true);
        try {
          const response = await fetchTutorScore(user.id);
          setData(response.score);
        } catch (error) {
          console.error("Error fetching tutor score:", error);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        console.log("No organization ID available");
      }
    };

    fetchData();
  }, [user]);
  return (
    <div className="w-full h-auto">
      <div className="bg-[#191919] rounded-[24px] p-6 py-8 flex items-center flex-col  justify-between text-white h-full">
        {isLoadingData ? (
          <>
            {/* Title Skeleton */}
            <Skeleton className="w-1/2 h-8 mb-6 mx-auto" />
            {/* Profile Image Skeleton */}
            <div className="mb-6 flex justify-center">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            {/* Tutor Info Skeletons */}
            <div className="text-center mb-6">
              <Skeleton className="w-1/3 h-6 mb-1 mx-auto" />
              <Skeleton className="w-1/2 h-4 mx-auto" />
            </div>
            {/* Progress Bar Skeleton */}
            <Skeleton className="w-full h-6 mb-4" />
          </>
        ) : (
          <>
            <h2 className="text-white text-[24px] font-medium mb-6 text-center">
              Overall Tutor Score
            </h2>
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
            <div className="w-full mb-4">
              <ScoreProgress score={data?.overall} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
