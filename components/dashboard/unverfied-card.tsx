"use client";

import { JSX, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UnverifiedCard = {
  title: string;
  department: string;
  icon?: JSX.Element;
};

const cards: UnverifiedCard[] = [
  {
    title: "Warranty Policy",
    department: "Customer Support",
  },
  {
    title: "Vacation Policy",
    department: "HR",
  },
  {
    title: "Courses",
    department: "Marketing",
  },
];

const filters = ["Monthly", "Weekly", "Yearly"];

export default function UnverifiedCards() {
  const [selectedFilter, setSelectedFilter] = useState("Monthly");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative bg-[#1a1a1a] rounded-xl px-6 py-6 w-full max-w-auto text-white h-full  " style={{borderRadius:'30px'}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative !cursor-pointer">
        <h2 className="text-[24px] font-normal">Unverified Cards</h2>

        {/* Dropdown Button */}
        <div className="relative">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="cursor-pointer bg-[#0E0F11] text-white w-[114px] rounded-full border-0 px-3 py-2 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent className="bg-[#0E0F11] text-white rounded-xl shadow-xl text-sm">
              {filters.map((filter) => (
                <SelectItem
                  key={filter}
                  value={filter}
                  className="cursor-pointer px-4 py-2 hover:bg-neutral-800 rounded-md focus:bg-white focus:outline-none"
                >
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[#2a2a2a] px-4 py-4 rounded-lg"
          >
            <div className="flex flex-col gap-2 w-full">
              {/* Title and Department in same row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-[#F9DB6F] p-2 rounded-full">
                    <Info size={16} className="text-black" />
                  </div>
                  <h3 className="text-[20px] font-semibold">{card.title}</h3>
                </div>
                <span className="text-[11px] text-white">
                  {card.department}
                </span>
              </div>

              {/* Description */}
              <p className="text-[14px] text-[#6F767E]">
                Lorem ipsum dolor sit amet.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-10 flex items-center justify-center text-center ">
        <Button
          variant="outline"
          className="w-full border-white text-white hover:bg-[#333435] hover:text-white bg-[#333435] !h-[42px]  !cursor-pointer"
        >
          View All
        </Button>
      </div>
    </div>
  );
}
