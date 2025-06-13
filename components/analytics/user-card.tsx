import React, {useState} from "react";
import {ChevronLeft, ChevronRight, CircleAlert} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {useRole} from "../ui/Context/UserContext";
import {policies} from "@/utils/analytic-data";

export const UserCard = () => {
  const strengths = [
    {id: 1, name: "Warranty"},
    {id: 2, name: "Escalation"},
    {id: 3, name: "Brand Language"},
    {id: 4, name: "Warranty"},
    {id: 5, name: "Escalation"},
    {id: 6, name: "Brand Language"},
    {id: 7, name: "Warranty"},
    {id: 8, name: "Escalation"},
    {id: 9, name: "Brand Language"},
  ];

  const opportunities = [
    {id: 1, name: "Return Policy"},
    {id: 2, name: "Troubleshooting"},
    {id: 3, name: "Sale"},
    {id: 4, name: "Warranty"},
    {id: 5, name: "Escalation"},
    {id: 6, name: "Brand Language"},
  ];
  const [interval, setInterval] = useState("monthly");
  const {roleAccess} = useRole();

  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageStrength, setCurrentPageStrength] = useState(0);
  const [currentPageOppurtinity, setCurrentPageOppurtinity] = useState(0);
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [expandedItems, setExpandedItems] = useState(new Set());

  const CARDS_PER_PAGE = 3;
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(policies.length / CARDS_PER_PAGE);
  const totalStrengthPages = Math.ceil(strengths.length / ITEMS_PER_PAGE);
  const totalOppurtinityPages = Math.ceil(
    opportunities.length / ITEMS_PER_PAGE
  );
  const visiblePolicies = policies.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );
  const visibleStrength = strengths.slice(
    currentPageStrength * ITEMS_PER_PAGE,
    (currentPageStrength + 1) * ITEMS_PER_PAGE
  );
  const visibleOppurtinity = opportunities.slice(
    currentPageOppurtinity * ITEMS_PER_PAGE,
    (currentPageOppurtinity + 1) * ITEMS_PER_PAGE
  );
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goToPreviousStrength = () =>
    setCurrentPageStrength((prev) => Math.max(prev - 1, 0));
  const goToNextStrength = () =>
    setCurrentPageStrength((prev) =>
      Math.min(prev + 1, totalStrengthPages - 1)
    );
  const goToPreviousOppurtinity = () =>
    setCurrentPageOppurtinity((prev) => Math.max(prev - 1, 0));
  const goToNextOppurtinity = () =>
    setCurrentPageOppurtinity((prev) =>
      Math.min(prev + 1, totalOppurtinityPages - 1)
    );
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
    <div className="flex flex-col lg:flex-row gap-6 mt-6 ">
      {/* Completed Learning Paths */}
      <div className="w-full lg:w-1/3">
        <div className="bg-[#191919] rounded-[30px] h-full p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h2 className="text-[24px] font-medium">Trent's Recent Cards</h2>
              <p className="text-[16px] font-medium">Last 30 days</p>
            </div>
            <div className="flex gap-2">
              <button
                className={`w-[20px] h-[20px] flex items-center justify-center rounded-full cursor-pointer ${
                  currentPage > 0
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                }`}
                onClick={goToPrevious}
                disabled={currentPage === 0}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className={`w-[20px] h-[20px] cursor-pointer flex items-center justify-center rounded-full ${
                  currentPage < totalPages - 1
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                }`}
                onClick={goToNext}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {visiblePolicies.map((policy, index) => (
              <PolicyCard
                key={index}
                title={policy.title}
                description={policy.description}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}

      <div className="w-full lg:w-2/3">
        <div className="bg-[#191919] rounded-[30px] h-full p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
              Insights
            </h2>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="bg-black text-white w-[114px] rounded-[80px] border-0 h-[38px] px-2 text-xs">
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Strengths & Opportunities */}
          <div className="space-y-4 flex flex-col lg:flex-row gap-4 w-full">
            {/* Strengths Section */}
            <div className="bg-[#232323] rounded-[30px] p-4 w-full flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] font-semibold">
                  Most Searched by Trent
                </h3>
                <div className="flex gap-2">
                  <button
                    className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                      currentPageStrength > 0
                        ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                        : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={goToPreviousStrength}
                    disabled={currentPageStrength === 0}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                      currentPageStrength < totalStrengthPages - 1
                        ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                        : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={goToNextStrength}
                    disabled={currentPageStrength === totalStrengthPages - 1}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                {visibleStrength.map((strength) => (
                  <div
                    key={strength.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 mb-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                    onClick={() => toggleExpanded(strength.id)}
                  >
                    {strength.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities Section */}
            <div className=" bg-[#232323] rounded-xl p-4 w-full flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[20px] font-semibold">Trending Searches</h3>
                <div className="flex gap-2  rounded-[30px]">
                  <button
                    className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                      currentPageOppurtinity > 0
                        ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                        : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={goToPreviousOppurtinity}
                    disabled={currentPageOppurtinity === 0}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                      currentPageOppurtinity < totalOppurtinityPages - 1
                        ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                        : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={goToNextOppurtinity}
                    disabled={
                      currentPageOppurtinity === totalOppurtinityPages - 1
                    }
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                {visibleOppurtinity.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-4 border-l-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                    onClick={() => toggleExpanded(opportunity.id)}
                  >
                    {opportunity.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
//@ts-expect-error: some error

const PolicyCard = ({title, description}) => {
  return (
    <div className="group relative bg-[#232323] rounded-xl p-4 transition-all hover:bg-[#191919]/90 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="bg-[#F9DB6F] w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
          <CircleAlert className="text-black" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-gray-300 text-sm mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};
