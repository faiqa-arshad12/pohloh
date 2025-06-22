import React, {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight, CircleAlert} from "lucide-react";

import {useRole} from "../ui/Context/UserContext";
import {policies} from "@/utils/analytic-data";
import {
  fetchALLTrendingSearchesByUser,
  fetchUserData,
} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {useSearchParams} from "next/navigation";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import Loader from "../shared/loader";

interface SearchItem {
  id: string;
  item: string;
  org_id: string;
  user_id: string;
  created_at: string;
}

interface TrendingSearchItem {
  item: string;
  search_count: number;
  latest_search: string;
}

export const UserCard = () => {
  const {userData} = useUserHook();
  const searchParams = useSearchParams();
  const userId = searchParams?.get("id") || userData?.id;
  const [trendingData, setTrendingData] = useState<TrendingSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetail] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageStrength, setCurrentPageStrength] = useState(0);
  const [currentPageTrending, setCurrentPageTrending] = useState(0);
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [expandedItems, setExpandedItems] = useState(new Set());

  const CARDS_PER_PAGE = 3;
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(policies.length / CARDS_PER_PAGE);
  const totalTrendingPages = Math.ceil(trendingData.length / ITEMS_PER_PAGE);

  const visiblePolicies = policies.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );

  const visibleTrending = trendingData.slice(
    currentPageTrending * ITEMS_PER_PAGE,
    (currentPageTrending + 1) * ITEMS_PER_PAGE
  );

  // Process trending data for the left section
  const processedTrendingSearches = trendingData.map(
    (item: TrendingSearchItem) => ({
      item: item.item,
      count: item.search_count,
    })
  );

  const visibleTrendingSearches = processedTrendingSearches.slice(
    currentPageStrength * ITEMS_PER_PAGE,
    (currentPageStrength + 1) * ITEMS_PER_PAGE
  );

  const totalTrendingSearchesPages = Math.ceil(
    processedTrendingSearches.length / ITEMS_PER_PAGE
  );

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  }, []);

  useEffect(() => {
    const fetchTrendingData = async () => {
      if (!userId || !userData?.org_id) return;

      try {
        setLoading(true);
        setError(null);

        const startDateStr = startDate?.toISOString();
        const endDateStr = endDate?.toISOString();

        const response = await fetchALLTrendingSearchesByUser(
          userData.org_id,
          userId,
          startDateStr,
          endDateStr
        );

        if (response.success && response.data) {
          setTrendingData(response.data);
        } else {
          setError("Failed to fetch trending data");
        }
      } catch (err) {
        console.error("Error fetching trending data:", err);
        setError("Failed to load trending data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [userId, userData?.org_id, startDate, endDate]);
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId || !userData?.org_id) return;

      try {
        const response = await fetchUserData(userId);

        if (response) {
          setUserDetail(response);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load trending data");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUserInfo();
  }, [userId]);

  const handleRangeChange = async (range: string) => {
    const selectedOption = getDropdownOptions().find(
      (option) => option.value === range
    );

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goToPreviousStrength = () =>
    setCurrentPageStrength((prev) => Math.max(prev - 1, 0));
  const goToNextStrength = () =>
    setCurrentPageStrength((prev) =>
      Math.min(prev + 1, totalTrendingSearchesPages - 1)
    );
  const goToPreviousTrending = () =>
    setCurrentPageTrending((prev) => Math.max(prev - 1, 0));
  const goToNextTrending = () =>
    setCurrentPageTrending((prev) =>
      Math.min(prev + 1, totalTrendingPages - 1)
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
    <div className="flex flex-col lg:flex-row gap-6 mt-6">
      {/* Completed Learning Paths */}
      <div className="w-full lg:w-1/3">
        <div className="bg-[#191919] rounded-[30px] h-full p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h2 className="text-[24px] font-medium">
                {userDetails?.first_name}'s Recent Cards
              </h2>
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
            <div className="flex gap-4">
              <DateRangeDropdown
                selectedRange={selectedRange}
                onRangeChange={handleRangeChange}
                width="200px"
                disabled={isLoadingData}
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
          {loading ? (
            <div className="flex flex-row justify-center items-center">

            <Loader />
            </div>
          ) : (
            <div className="space-y-4 flex flex-col lg:flex-row gap-4 w-full">
              <div className="bg-[#232323] rounded-[30px] p-4 w-full flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[20px] font-semibold">
                    Most Searched By {userDetails?.first_name}
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
                        currentPageStrength < totalTrendingSearchesPages - 1
                          ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                          : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={goToNextStrength}
                      disabled={
                        currentPageStrength === totalTrendingSearchesPages - 1
                      }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {error ? (
                    <div className="text-center py-8 text-red-400">{error}</div>
                  ) : visibleTrendingSearches.length > 0 ? (
                    visibleTrendingSearches.map((search, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 mb-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                        onClick={() => toggleExpanded(index)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{search.item}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No searches found for this period
                    </div>
                  )}
                </div>
              </div>

              {/* API Trending Searches Section */}
              <div className="bg-[#232323] rounded-xl p-4 w-full flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[20px] font-semibold">
                    Trending Searches
                  </h3>
                  <div className="flex gap-2 rounded-[30px]">
                    <button
                      className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                        currentPageTrending > 0
                          ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                          : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={goToPreviousTrending}
                      disabled={currentPageTrending === 0}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className={`w-[20px] h-[20px] flex items-center justify-center rounded-full ${
                        currentPageTrending < totalTrendingPages - 1
                          ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                          : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={goToNextTrending}
                      disabled={currentPageTrending === totalTrendingPages - 1}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {error ? (
                    <div className="text-center py-8 text-red-400">{error}</div>
                  ) : visibleTrending.length > 0 ? (
                    visibleTrending.map((search, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-4 border-l-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                        onClick={() => toggleExpanded(index)}
                      >
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-1">
                            <span className="truncate font-medium">
                              {search.item}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No trending searches found for this period
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PolicyCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-[#232323] rounded-lg p-4 cursor-pointer transition-colors hover:bg-[#2a2a2a]">
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};
