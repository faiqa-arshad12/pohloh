import React from "react";
import {Skeleton} from "../ui/skeleton";

export const PlansSkeleton = ({isCanceled = false}) => (
  <div className="w-full lg:w-2/3 flex flex-col p-6 rounded-2xl animate-pulse">
    <div className="flex justify-center w-full">
      <Skeleton className="h-16 w-full max-w-md  mb-6 rounded-2xl" />
    </div>
    <div className="w-full flex gap-6 mt-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className={`w-full h-full p-4 rounded-[23px] flex flex-col justify-between bg-[#FFFFFF0A] ${
            isCanceled ? "opacity-80" : ""
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="w-[78.81px] h-[78.81px] rounded-full " />
              <div className="text-right">
                <Skeleton className="h-12 w-24 " />
              </div>
            </div>
            <Skeleton className="h-6 w-1/2  mb-2" />
            <Skeleton className="h-4 w-3/4  mb-4" />
            <Skeleton className="h-px w-full bg-gray-600 mb-5" />
            <div className="space-y-5">
              {[1, 2, 3, 4].map((j) => (
                <div className="flex items-center" key={j}>
                  <Skeleton className="w-4 h-4 rounded-full  mr-2" />
                  <Skeleton className="h-4 w-3/4 " />
                </div>
              ))}
            </div>
          </div>
          <Skeleton
            className={`h-[56.51px] w-full  mt-5 rounded-[9.42px] ${
              isCanceled ? "/30" : ""
            }`}
          />
        </div>
      ))}
    </div>
  </div>
);
