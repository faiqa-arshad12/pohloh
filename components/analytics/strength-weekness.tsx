import React, {useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";
import {NoData} from "../shared/NoData";

const StrengthWeekness = ({
  strengths,
  opportunities,
}: {
  strengths: string[];
  opportunities: string[];
}) => {
  const [strengthsIndex, setStrengthsIndex] = useState(0);
  const [opportunitiesIndex, setOpportunitiesIndex] = useState(0);
  const itemsPerPage = 3;

  const isFirstStrength = strengthsIndex === 0;
  const isLastStrength = strengthsIndex + itemsPerPage >= strengths.length;
  const goToPreviousStrengths = () => {
    setStrengthsIndex((prev) => Math.max(0, prev - itemsPerPage));
  };
  const goToNextStrengths = () => {
    setStrengthsIndex((prev) =>
      Math.min(prev + itemsPerPage, strengths.length - itemsPerPage)
    );
  };

  // Opportunities Pagination
  const isFirstOpportunity = opportunitiesIndex === 0;
  const isLastOpportunity =
    opportunitiesIndex + itemsPerPage >= opportunities.length;
  const goToPreviousOpportunities = () => {
    setOpportunitiesIndex((prev) => Math.max(0, prev - itemsPerPage));
  };
  const goToNextOpportunities = () => {
    setOpportunitiesIndex((prev) =>
      Math.min(prev + itemsPerPage, opportunities.length - itemsPerPage)
    );
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="bg-[#191919] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[20px] font-semibold">Strengths</h3>
          {strengths.length > itemsPerPage && (
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isFirstStrength
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToPreviousStrengths}
                disabled={isFirstStrength}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isLastStrength
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToNextStrengths}
                disabled={isLastStrength}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {strengths.length > 0 ? (
            strengths
              .slice(strengthsIndex, strengthsIndex + itemsPerPage)
              .map((strength, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-colors border-l-4 bg-[#93C47D] border-[#F9DB6F]`}
                >
                  {strength}
                </div>
              ))
          ) : (
            <div className="col-span-3">
              <NoData message="No strengths found" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#191919] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[20px] font-semibold">Opportunities</h3>
          {opportunities.length > itemsPerPage && (
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isFirstOpportunity
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToPreviousOpportunities}
                disabled={isFirstOpportunity}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isLastOpportunity
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToNextOpportunities}
                disabled={isLastOpportunity}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {opportunities.length > 0 ? (
            opportunities
              .slice(opportunitiesIndex, opportunitiesIndex + itemsPerPage)
              .map((opportunity, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg transition-colors border-l-4 bg-[#EE8484E5] border-[#F9DB6F]"
                >
                  {opportunity}
                </div>
              ))
          ) : (
            <div className="col-span-3">
              <NoData message="No opportunities found" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrengthWeekness;
