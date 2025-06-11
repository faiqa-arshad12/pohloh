"use client";

import {Info, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";

const learningPaths = [
  {
    id: "1",
    title: "Warranty Policy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    category: "Customer Support",
    icon: Info,
  },
  {
    id: "2",
    title: "Vacation Policy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    category: "HR",
    icon: Info,
  },
  {
    id: "3",
    title: "Office Policy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    category: "Marketing",
    icon: Info,
  },
];

export function CompletedLearningPaths() {
  return (
    <div
      className="relative bg-[#1a1a1a] rounded-xl px-6 py-6 w-full max-w-auto text-white"
      style={{borderRadius: "30px", height: "500px"}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-normal">Completed Learning Paths</h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={true} // Disabled when there are no items to navigate left
            className="w-8 h-8 rounded-full border border-[#F9DB6F] text-[#F9DB6F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-transparent cursor-pointer"
          >
            <ChevronLeft size={16} className="cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={true} // Disabled when there are no items to navigate right
            className="w-8 h-8 rounded-full border border-[#F9DB6F] text-[#F9DB6F] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-transparent"
          >
            <ChevronRight size={16} className="cursor-pointer" />
          </Button>
        </div>
      </div>

      {/* Learning Paths List */}
      <div className="space-y-4">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className="flex items-center justify-between bg-[#2a2a2a] px-4 py-4 rounded-lg"
            style={{minHeight: "100px"}}
          >
            <div className="flex items-center gap-4 w-full">
              {/* Icon */}
              <div className="!mt-[-10px]">
                <img src="/complete-path.png" alt='completed-path'/>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-semibold text-white">
                    {path.title}
                  </h3>
                  <span className="text-[14px] text-white font-medium">
                    {path.category}
                  </span>
                </div>
                <p className="text-[14px] text-[#6F767E]">{path.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
