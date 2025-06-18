"use client";

import {useEffect, useState, Suspense} from "react";
import {Button} from "../ui/button";
import TutorAnalytics from "./tutor";
import Card from "./card";
import {useRole} from "../ui/Context/UserContext";
import AdminAanalytic from "./admin-tutor";
import {useSearchParams} from "next/navigation";
import {useUserHook} from "@/hooks/useUser";
import ArrowBack from "../shared/ArrowBack";
import {CustomDateFilterModal} from "../shared/date-filter";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {getDropdownOptions} from "@/utils/constant";
import Loader from "../shared/loader";
import {fetchTeams, fetchTutorStats} from "./analytic.service";

function AnalyticsContent() {
  const {roleAccess} = useRole();
  const [activeTab, setActiveTab] = useState("tutor");
  const [tutorId, setTutorId] = useState<string | null | undefined>(null);
  const searchParams = useSearchParams();
  const {userData} = useUserHook();
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [stats, setStats] = useState<any>(null);
  const id = searchParams?.get("id");

  useEffect(() => {
    if (roleAccess === "user") {
      setTutorId(userData?.id);
    } else {
      setTutorId(id);
      if (id) {
        setActiveTab("tutor");
      }
    }
    if (userData) {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response);
      };
      fetchteams();
    }
  }, [searchParams, userData, roleAccess]);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  }, []);

  // useEffect(() => {
  //   if (tutorId) {
  //     const fetchStats = async () => {
  //       const stats = await fetchTutorStats(
  //         tutorId,
  //         startDate ? startDate.toISOString() : undefined,
  //         endDate ? endDate.toISOString() : undefined,
  //         selectedTeam !== "all" ? selectedTeam : undefined
  //       );
  //       setStats(stats.stats);
  //     };
  //     if (tutorId) fetchStats();
  //   }
  // }, [tutorId, selectedTeam, startDate, endDate, userData, id, searchParams]);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="text-white min-h-screen">
      <div className="py-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            {roleAccess !== "user" && tutorId ? (
              <div className="flex flex-row justify-between w-full">
                <div className="flex flex-row gap-2 items-center">
                  <ArrowBack link="/analytics" />
                  <h1 className="text-white text-[32px] font-semibold font-urbanist">
                    User Insights
                  </h1>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <h1 className="text-white text-[36px] font-semibold">
                  Analytics
                </h1>
              </div>
            )}

            <div className="flex gap-4 mt-2">
              {activeTab === "tutor" && roleAccess !== "user" && (
                <>
                  <DateRangeDropdown
                    selectedRange={selectedRange}
                    onRangeChange={handleRangeChange}
                    width="250px"
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
                </>
              )}
              {activeTab === "tutor" && roleAccess === "owner" && !tutorId && (
                <DateRangeDropdown
                  selectedRange={selectedTeam}
                  onRangeChange={setSelectedTeam}
                  width="250px"
                  disabled={isLoadingData}
                  options={[
                    {label: "All Department", value: "all"},
                    ...teams.map((team: any) => ({
                      label: team.name,
                      value: team.id,
                    })),
                  ]}
                />
              )}

              {!(roleAccess !== "user" && tutorId) && (
                <div className="flex items-center gap-2">
                  <div className="border border-[#FFFFFF] rounded-full overflow-hidden h-[56px] w-[full] px-3 flex items-center justify-center text-center gap-2">
                    <Button
                      onClick={() => handleTabChange("tutor")}
                      className={`w-[64px] h-[40px] px-3 cursor-pointer transition-colors ${
                        activeTab === "tutor"
                          ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                          : "bg-transparent hover:bg-transparent text-white hover:text-[#F9DB6F]"
                      }`}
                    >
                      Tutor
                    </Button>
                    <Button
                      onClick={() => handleTabChange("Card")}
                      className={`w-[64px] h-[40px] px-3 cursor-pointer transition-colors ${
                        activeTab === "Card"
                          ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                          : "bg-transparent hover:bg-transparent text-white hover:text-[#F9DB6F]"
                      }`}
                    >
                      Card
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`transition-opacity duration-300 ${
            isLoadingData ? "opacity-50" : "opacity-100"
          }`}
        >
          {activeTab === "tutor" &&
          (roleAccess === "user" || tutorId !== null) ? (
            <TutorAnalytics
              id={tutorId}
              team={selectedTeam !== "all" ? selectedTeam : undefined}
              startDate={startDate}
              endDate={endDate}
            />
          ) : activeTab === "tutor" && roleAccess !== "user" && !tutorId ? (
            <AdminAanalytic
              selectedTeam={selectedTeam}
              team={selectedTeam !== "all" ? selectedTeam : undefined}
              startDate={startDate}
              endDate={endDate}
            />
          ) : null}

          {activeTab === "Card" && <Card />}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white">
          <div className="flex items-center gap-3">
            <Loader />
          </div>
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
