import {Icon} from "@iconify/react/dist/iconify.js";
import React from "react";
export const NoData = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon icon="mdi:account-group-outline" width="48" height="48" />
      <p className="mt-2 text-lg">No data found</p>
    </div>
  );
};
