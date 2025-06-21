import React from "react";

export const NoData = ({message}: {message?: string}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <p className="mt-2 text-lg">{message || "No data found"}</p>
    </div>
  );
};
