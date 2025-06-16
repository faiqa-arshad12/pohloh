import React from "react";
import {useEffect, useState} from "react";

import {Button} from "../ui/button";
import Image from "next/image";

import {Icon} from "@iconify/react/dist/iconify.js";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import {useRole} from "../ui/Context/UserContext";

const AdminTutorAnalyticGraph = () => {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const {roleAccess} = useRole();

  // Initialize default date range (Last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  }, []);

  const handleRangeChange = async (range: string) => {
    setSelectedRange(range);

    if (range === "Custom") {
      setShowCustomFilterModal(true);
      return;
    }

    setIsLoadingData(true);

    const today = new Date();
    let start: Date;
    const end: Date = today;

    switch (range) {
      case "weekly":
        start = new Date();
        start.setDate(today.getDate() - 7);
        break;
      case "monthly":
        start = new Date();
        start.setDate(today.getDate() - 30);
        break;
      case "yearly":
        start = new Date();
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start = new Date();
        start.setDate(today.getDate() - 30);
        break;
    }

    setStartDate(start);
    setEndDate(end);

    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  const handleApplyCustomFilter = (newStartDate: Date, newEndDate: Date) => {
    setIsLoadingData(true);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setSelectedRange(
      `${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`
    );

    setTimeout(() => {
      setIsLoadingData(false);
    }, 500);
  };

  return (
    <div className="bg-[#191919] rounded-[30px] p-4 col-span-3">
      <div className="flex justify-between mb-4">
        <h3 className="text-[24px] font-medium py-4">Tutor Analytics</h3>
        <div className="flex items-center gap-2 mb-2">
          {roleAccess !== "user" && (
            <Button className="w-[52px] h-[50px] bg-[#F9DB6F] hover:bg-[#F9DB6F] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer">
              <Icon
                icon="bi:filetype-pdf"
                width="24"
                height="24"
                color="black"
                className="cursor-pointer"
              />
            </Button>
          )}
          <DateRangeDropdown
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            width="250px"
            disabled={isLoadingData}
            bg="bg-[black]"
            options={getDropdownOptions()}
          />
          <CustomDateFilterModal
            open={showCustomFilterModal}
            onOpenChange={setShowCustomFilterModal}
            onApplyFilter={handleApplyCustomFilter}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        </div>
      </div>
      <div
        className={`relative w-full h-64 transition-opacity duration-300 ${
          isLoadingData ? "opacity-50" : "opacity-100"
        }`}
      >
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
  );
};

export default AdminTutorAnalyticGraph;
