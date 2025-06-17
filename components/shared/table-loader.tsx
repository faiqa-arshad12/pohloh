import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

const TableLoader = () => {
  return (
    <div className="space-y-4">
      {Array.from({length: 5}).map((_, i) => {
        const widthPercent = Math.floor(70 + Math.random() * 30); // between 70% and 100%
        return (
          <Skeleton
            key={i}
            className="h-[28px]"
            style={{width: `${widthPercent}%`}}
          />
        );
      })}
    </div>
  );
};

export default TableLoader;
