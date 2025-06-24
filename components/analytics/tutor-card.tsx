"use client";

import {useUserHook} from "@/hooks/useUser";
import {useEffect, useState} from "react";
import {fetchTutorScore} from "./analytic.service";
import ScoreProgress from "../shared/score-progress";
import {Skeleton} from "../ui/skeleton";

export default function TutorScoreCard() {
  const {userData} = useUserHook();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      if (userData?.organizations?.id) {
        setIsLoadingData(true);
        try {
          const response = await fetchTutorScore(userData.id);
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
  }, [userData]);

  return (
    <div className="w-full h-auto">
      <div className="bg-[#191919] rounded-[30px] p-4 py-8 flex items-center flex-col h-full">
        {isLoadingData ? (
          <>
            <Skeleton className="w-1/2 h-8 mb-8" />
            <div className="flex justify-center mb-8">
              <Skeleton className="w-[120px] h-[120px] rounded-full" />
            </div>
            <Skeleton className="w-1/3 h-6 mb-3" />
            <Skeleton className="w-1/2 h-4 mb-8" />
            <Skeleton className="w-full h-6" />
          </>
        ) : (
          <>
            <h2 className="text-[24px] font-medium mb-8">
              Average Tutor Score
            </h2>
            <div className="flex justify-center mb-8">
              <img
                src={
                  userData?.organizations.org_picture ||
                  "/placeholder-profile.svg"
                }
                className="w-[120px] h-[120px] rounded-full"
                alt="profile"
              />
            </div>
            <p className="text-[24px] text-[#FFFFFF] mb-3 font-bold">
              {userData?.organizations.name}
            </p>
            <p className="text-[15px] text-[#FFFFFF] mb-8 font-medium">
              {data?.owner?.email}
            </p>
            <ScoreProgress score={data?.overall} />
          </>
        )}
      </div>
    </div>
  );
}
