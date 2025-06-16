import {opportunities, strengths} from "@/utils/analytic-data";
import React, {useState} from "react";

const StrengthWeekness = () => {
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const toggleExpanded = (itemId: number) => {
    setTimePeriod("Monthly");
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  return (
    <div className="space-y-4">
      <div className="bg-[#191919] rounded-xl p-4">
        <h3 className="text-[20px] font-semibold mb-4">Strengths</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {strengths.map((strength) => (
            <div
              key={strength.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 bg-[#93C47D] border-[#F9DB6F]`}
              onClick={() => toggleExpanded(strength.id)}
            >
              {strength.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#191919] rounded-xl p-4">
        <h3 className="text-[20px] font-semibold mb-4">Opportunities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="p-3 rounded-lg cursor-pointer transition-colors border-l-4 bg-[#EE8484E5] border-[#F9DB6F] hover:bg-[#C80909E5]"
              onClick={() => toggleExpanded(opportunity.id)}
            >
              {opportunity.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrengthWeekness;
