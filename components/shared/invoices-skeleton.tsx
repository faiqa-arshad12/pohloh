import React from "react";
import {Skeleton} from "../ui/skeleton";

export const InvoicesSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between mb-4 flex-wrap">
      <Skeleton className="h-8 w-32 " />
    </div>
    <div className="mt-4">
      <Skeleton className="h-12 w-full  mb-2 rounded" />
      <div className="space-y-4">
        {Array.from({length: 5}).map((_, i) => {
          const widthPercent = 100 - i * 10; // 100%, 90%, 80%, ...
          return (
            <Skeleton
              key={i}
              className={`h-[28px]`}
              style={{width: `${widthPercent}%`}}
            />
          );
        })}
      </div>
    </div>
  </div>
);

export default InvoicesSkeleton;
