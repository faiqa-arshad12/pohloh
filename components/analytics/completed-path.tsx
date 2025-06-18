"use client";

import {Info, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useState, useEffect} from "react";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import {fetchTeams, getUserCompletedCards} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";
import {useRole} from "../ui/Context/UserContext";

export function CompletedLearningPaths({id}: {id?: string | null}) {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const {userData} = useUserHook();
  const router = useRouter();
  const {roleAccess} = useRole();

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

  useEffect(() => {
    const fetchCompletedPaths = async () => {
      if ((!userData?.id && !id) || !userData?.org_id) return;

      try {
        setIsLoadingData(true);

        // Format dates for API
        const startDateStr = startDate?.toISOString();
        const endDateStr = endDate?.toISOString();

        // Fetch completed cards
        const response = await getUserCompletedCards(
          roleAccess === "user" ? userData.id : id,
          userData.org_id,
          selectedTeam !== "all" ? selectedTeam : undefined,
          // undefined, // query parameter - can be added later for search
          startDateStr,
          endDateStr
        );

        // Check if response is successful and has path data
        if (response && response.success && response.path) {
          // Transform data to match component structure
          const transformedPaths = response.path.map((card: any) => ({
            id: card.id,
            title: card.learning_path_id?.title || "Untitled",
            description:
              card.learning_path_id?.description || "No description available",
            category: card.learning_path_id?.category?.name || "General",
            categoryId: card.learning_path_id?.category?.id, // Keep the ID for filtering
            icon: Info,
            completed_at: card.updated_at,
            questions_answered: Array.isArray(card.questions_answered)
              ? card.questions_answered.length
              : card.questions_answered || 0,
            total_questions: card.learning_path_id?.num_of_questions || 0,
            score: card.score,
            stared: card.stared,
          }));

          setLearningPaths(transformedPaths);
        } else {
          console.log("No completed paths found or invalid response");
          setLearningPaths([]);
        }

        // Also fetch stats
        // const stats = await getUserCardStats(
        //   userData.id,
        //   userData.org_id,
        //   selectedTeam !== "all" ? selectedTeam : undefined,
        // )
        // setCardStats(stats)
      } catch (error) {
        console.error("Error fetching completed learning paths:", error);
        setLearningPaths([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCompletedPaths();
  }, [userData, selectedTeam, startDate, endDate]);

  const filteredLearningPaths = learningPaths.filter((path) => {
    if (selectedTeam === "all") return true;
    // Filter by category ID since that's what the API returns
    return path.categoryId === selectedTeam;
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
            {filteredLearningPaths.length > 0 && (
              <Button
                variant="link"
                className="text-[#F9DB6F] hover:text-[#F9DB6F] p-0 cursor-pointer"
                onClick={() => {
                  router.push(
                    `/analytics/completed-learning-paths?userId=${
                      roleAccess === "user" ? userData.id : id
                    }`
                  );
                  // TODO: Add navigation logic here if needed
                }}
              >
                View All
              </Button>
            )}
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
                {/* <p className="text-[14px] text-[#6F767E] line-clamp-1 mt-2">
                  {path.description}
                </p> */}

                {/* Additional Info */}
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
