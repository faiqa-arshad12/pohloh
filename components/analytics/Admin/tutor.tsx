import React, {useState} from "react";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TutorScoreCard from "../tutor-score";
import {CompletedLearningPaths} from "../completed-path";
import CategoriesScore from "../categories-score";
import {policies} from "@/utils/analytic-data";
import StrengthWeekness from "../strength-weekness";

export default function TutorAnalytics() {
  const [interval, setInterval] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(0);

  const CARDS_PER_PAGE = 3;

  const visiblePolicies = policies.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );

  return (
    <div className="">
      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Tutor Score Card */}
        <TutorScoreCard />

        {/* Tutor Analytics Card */}
        <div className="bg-[#191919] rounded-[30px] p-4 col-span-3">
          <div className="flex justify-between mb-4">
            <h3 className="text-[24px] font-medium py-4">Tutor Analytics</h3>
            <div className="flex items-center gap-2 mb-2">
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger
                  className="bg-black hover:bg-black rounded-[80px] w-[114px] text-white p-2 flex items-center gap-1 border-0"
                  style={{height: "40px"}}
                >
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white dark:bg-gray-800 rounded-lg">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative w-full h-64">
            <Image
              src="/Frame 5.png"
              alt="Chart Background"
              fill
              style={{objectFit: "cover"}}
              className="rounded-lg"
              quality={100}
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Completed Learning Paths */}
        <div className="w-full max-w-2xl">
          <CompletedLearningPaths />
        </div>

        {/* Insights Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
                Insights
              </h2>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger
                  className="bg-black text-white w-[114px] border-0 rounded-[80px]"
                  style={{height: "40px"}}
                >
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Scores */}
            <CategoriesScore />

            {/* Strengths & Opportunities */}
            <StrengthWeekness />
          </div>
        </div>
      </div>
    </div>
  );
}
