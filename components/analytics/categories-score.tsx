import React, {useState} from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";
import {renderIcon} from "@/lib/renderIcon";
import {NoData} from "../shared/NoData";

const CategoriesScore = ({
  insights,
  selectedCategory,
  setSelectedCategory,
}: {
  insights: {
    [key: string]: {
      strengths: string[];
      opportunities: string[];
      averageScore: number;
      icon: string;
    };
  } | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string) => void;
}) => {
  const [interval, setInterval] = useState("monthly");

  const categories = insights
    ? Object.keys(insights).map((key) => ({
        id: key,
        name: key,
        apiName: key,
        score: insights[key].averageScore,
        icon: insights[key].icon,
      }))
    : [];

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
          {/* <Select value={interval} onValueChange={setInterval}>
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
          </Select> */}
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
      <div className="w-full flex flex-row gap-4 mb-6 overflow-y-hidden">
        {categories.length > 0 ? (
          categories
            .slice(currentIndex, currentIndex + categoriesPerPage)
            .map((category) => (
              <button
                key={category.id}
                className={`w-full flex items-center justify-between p-4 border border-[#828282] rounded-xl bg-[#0E0F11] hover:bg-[#0E0F11] transition-colors gap-5 cursor-pointer ${
                  selectedCategory === category.apiName
                    ? "ring-2 ring-[#F9DB6F]"
                    : ""
                }`}
                onClick={() => setSelectedCategory(category.apiName)}
              >
                <div className="flex items-center gap-5">
                  {renderIcon(category.icon as any)}
                  <span className="text-[22px] font-medium">
                    {category.name}
                  </span>
                </div>
                <span className="bg-[#F9DB6F] text-black text-[16px] font-bold px-2 py-1 rounded-full">
                  {(category.score / 100).toFixed(2)}%
                </span>
              </button>
            ))
        ) : (
          <div className="w-full">
            <NoData message="No data found" />
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesScore;
