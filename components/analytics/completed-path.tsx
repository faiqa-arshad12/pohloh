"use client";

import {Info, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useState, useEffect} from "react";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import {fetchTeams} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {cn} from "@/lib/utils";

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
  {
    id: "4",
    title: "Office Polibcy",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    category: "Marketing",
    icon: Info,
  },
];

export function CompletedLearningPaths() {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const {userData} = useUserHook();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (userData) {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response);
      };
      fetchteams();
    }
  }, [userData]);

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

    // Apply predefined date ranges
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

    // Simulate data loading
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

  const filteredLearningPaths = learningPaths.filter((path) => {
    if (selectedTeam === "all") return true;
    return path.category === selectedTeam;
  });

  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex + 3 >= filteredLearningPaths.length;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 3));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 3, filteredLearningPaths.length - 1)
    );
  };

  return (
    <div
      className="relative bg-[#1a1a1a] rounded-xl px-6 py-6 w-full max-w-auto text-white"
      style={{borderRadius: "30px", height: "500px"}}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-normal">Completed Learning Paths</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              className="text-[#F9DB6F] hover:text-[#F9DB6F] p-0 cursor-pointer"
              onClick={() => {
                // TODO: Add navigation logic here if needed
              }}
            >
              View All
            </Button>
            <div className="flex items-center space-x-2">
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isFirstCard
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToPrevious}
                aria-label="Previous card"
                disabled={isFirstCard}
              >
                <ChevronLeft size={16} className="ml-[1px]" />
              </button>
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isLastCard
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToNext}
                aria-label="Next card"
                disabled={isLastCard}
              >
                <ChevronRight size={16} className="mr-[-1px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-row justify-center">
          <DateRangeDropdown
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            width="180px"
            disabled={isLoadingData}
            options={getDropdownOptions()}
            bg="bg-[black]"
          />
          <DateRangeDropdown
            selectedRange={selectedTeam}
            onRangeChange={setSelectedTeam}
            width="180px"
            disabled={isLoadingData}
            options={[
              {label: "All Department", value: "all"},
              ...teams.map((team: any) => ({
                label: team.name,
                value: team.id,
              })),
            ]}
            bg="bg-[black]"
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

      {/* Learning Paths List */}
      <div
        className={`flex flex-col gap-3 transition-opacity duration-300 ${
          isLoadingData ? "opacity-50" : "opacity-100"
        }`}
        style={{
          height: "calc(100% - 120px)",
          maxHeight: "380px",
        }}
      >
        {filteredLearningPaths.length > 0 ? (
          filteredLearningPaths
            .slice(currentIndex, currentIndex + 3)
            .map((path) => (
              <div
                key={path.id}
                className="flex flex-col bg-[#2a2a2a] px-4 py-4 rounded-lg"
                style={{minHeight: "100px"}}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="bg-[#F9DB6F] p-2 rounded-full flex-shrink-0">
                      <Info size={16} className="text-black" />
                    </div>
                    <div className="flex flex-col flex-grow overflow-hidden">
                      <p className="text-[20px] font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
                        {path.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-center flex-shrink-0">
                    <span className="text-[11px] text-white">
                      {path.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[14px] text-[#6F767E] line-clamp-1 mt-2">
                  {path.description}
                </p>
              </div>
            ))
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No learning paths found.
          </p>
        )}
      </div>
    </div>
  );
}
