import React from "react";
import {Skeleton} from "../ui/skeleton";

export const SubscriptionSkeleton = () => (
  <div className="w-full lg:w-1/3 flex flex-col justify-between p-4 rounded-lg animate-pulse">
    <div className="gap-5 mt-20">
      <Skeleton className="h-8 w-3/4  mb-4" />
      <Skeleton className="h-6 w-1/2  mb-2" />
      <Skeleton className="h-8 w-2/3  mb-4" />
      <div className="flex flex-row items-center mt-5">
        <Skeleton className="h-8 w-32  mr-2" />
        <Skeleton className="h-8 w-8 " />
      </div>
    </div>
    <div className="my-15">
      <Skeleton className="h-10 w-full  mt-8" />
    </div>
  </div>
);
