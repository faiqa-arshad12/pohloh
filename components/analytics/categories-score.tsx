import React, {useEffect, useState} from "react";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HeadsetIcon,
  Users,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {cn} from "@/lib/utils";
const CategoriesScore = () => {
  const [interval, setInterval] = useState("monthly");

  const categories = [
    {id: 1, name: "Marketing", score: 91, icon: "📢"},
    {id: 2, name: "CX", score: 55, icon: <HeadsetIcon />},
    {id: 3, name: "HR", score: 87, icon: <Users />},
    {id: 4, name: "Sales", score: 68, icon: <ChartNoAxesCombined />},
    {id: 5, name: "Finance", score: 80, icon: "💰"},
    {id: 6, name: "Operations", score: 75, icon: "⚙️"},
  ];
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const categoriesPerPage = 4;

  const isFirstSet = currentIndex === 0;
  const isLastSet = currentIndex + categoriesPerPage >= categories.length;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - categoriesPerPage));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(
        prevIndex + categoriesPerPage,
        categories.length - categoriesPerPage
      )
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
          Insights
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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
         {categories.length > categoriesPerPage && (
        <div className="flex justify-end items-center">
          <button
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-full",
              !isFirstSet
                ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
            )}
            onClick={goToPrevious}
            aria-label="Previous categories"
            disabled={isFirstSet}
          >
            <ChevronLeft size={16} className="ml-[1px]" />
          </button>
          <button
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded-full",
              !isLastSet
                ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
            )}
            onClick={goToNext}
            aria-label="Next categories"
            disabled={isLastSet}
          >
            <ChevronRight size={16} className="mr-[-1px]" />
          </button>
        </div>
      )}
      </div>
      </div>
      <div className="w-full flex flex-row  gap-4 mb-6 overflow-y-hidden">
        {categories
          .slice(currentIndex, currentIndex + categoriesPerPage)
          .map((category) => (
            <button
              key={category.id}
              className={`w-full flex items-center justify-between p-4 border border-[#828282] rounded-xl bg-[#0E0F11] hover:bg-[#0E0F11] transition-colors gap-5 cursor-pointer ${
                selectedCategory === category.id ? "ring-2 ring-[#F9DB6F]" : ""
              }`}
              //@ts-expect-error : category._id
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center gap-5">
                <span>{category.icon}</span>
                <span className="text-[22px] font-medium">{category.name}</span>
              </div>
              <span className="bg-[#F9DB6F] text-black text-[16px] font-bold px-2 py-1 rounded-full">
                {category.score}%
              </span>
            </button>
          ))}
      </div>

    </>
  );
};

export default CategoriesScore;
