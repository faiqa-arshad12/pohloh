"use client";

import {Trophy} from "lucide-react";
import {useState, useEffect} from "react";
import {Button} from "../ui/button";
import Graph from "./graph";
import {Icon} from "@iconify/react/dist/iconify.js";
import TopPerformance from "./top-performance";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {useUserHook} from "@/hooks/useUser";
import {
  fetchTeams,
  fetchCards,
  fetchLeaningPathPerformance,
} from "./analytic.service";
import {useRole} from "../ui/Context/UserContext";
import {
  exportToPDF,
  createCardsAnalyticsPDFConfig,
} from "../../utils/graphPdfExport";

const AdminCardCreated = () => {
  const {userData} = useUserHook();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [cardData, setCardData] = useState([]);
  const {roleAccess} = useRole();
  const [learningPathPerformance, setLearningPathPerformance] =
    useState<any>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  useEffect(() => {
    if (userData && roleAccess === "owner") {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response);
      };
      fetchteams();
    }
  }, [userData]);

  useEffect(() => {
    const getCards = async () => {
      try {
        setIsLoadingData(true);
        if (userData?.organizations.id && userData?.id && userData?.role) {
          const cards = await fetchCards(
            userData.organizations.id,
            userData.role,
            userData.id
          );
          console.log(cards, "cards");
          if (cards) {
            setCardData(cards);
          }
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    getCards();
  }, [userData]);

  useEffect(() => {
    const getPerformance = async () => {
      if (userData?.id) {
        setIsLoadingPerformance(true);
        try {
          const result = await fetchLeaningPathPerformance(userData.id);
          setLearningPathPerformance(result?.path || null);
        } catch (error) {
          setLearningPathPerformance(null);
        } finally {
          setIsLoadingPerformance(false);
        }
      }
    };
    getPerformance();
  }, [userData]);

  // Process card data for graph
  const processCardData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last6Weeks = Array.from({length: 6}, (_, i) => {
      const start = new Date(today);
      start.setDate(start.getDate() - (5 - i) * 7);
      return start;
    });

    // Filter by selected department/team
    let filteredCards = cardData;
    if (roleAccess === "owner" && selectedTeam !== "all") {
      filteredCards = cardData.filter(
        (card: any) => card?.category_id?.id === selectedTeam
      );
    }

    const weeklyData = last6Weeks.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const cardsInWeek = filteredCards.filter((card: any) => {
        const cardDate = new Date(card.created_at);
        return cardDate >= weekStart && cardDate <= weekEnd;
      });

      return {
        name: `Week ${index + 1}`,
        value: cardsInWeek.length,
        dateRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      };
    });

    return weeklyData;
  };

  const handleExportToPDF = async () => {
    setIsExportingPDF(true);

    try {
      const chartData = processCardData();
      const config = createCardsAnalyticsPDFConfig(
        chartData,
        selectedTeam,
        teams,
        roleAccess || ""
      );

      await exportToPDF(config);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-ful mb-8">
      {/* Left Section: Daily Completion */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#191919] rounded-[30px] p-4 space-y-3">
        <div className="flex justify-between mb-4 flex-wrap">
          <h3 className="text-[24px] p-4 font-semibold">Cards Created</h3>
          <div className="flex gap-2 items-center">
            <Button
              className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-[8px] border flex items-center justify-center gap-[10px] cursor-pointer disabled:opacity-50"
              onClick={handleExportToPDF}
              disabled={isExportingPDF || isLoadingData}
            >
              {isExportingPDF ? (
                <Icon
                  icon="eos-icons:loading"
                  width="24"
                  height="24"
                  className="animate-spin"
                />
              ) : (
                <Icon
                  icon="bi:filetype-pdf"
                  width="24"
                  height="24"
                  className="cursor-pointer"
                />
              )}
            </Button>
            {/* Only show department filter for owners */}
            {roleAccess === "owner" && (
              <DateRangeDropdown
                selectedRange={selectedTeam}
                onRangeChange={setSelectedTeam}
                width="300px"
                disabled={isLoadingData}
                bg="bg-[black]"
                options={[
                  {label: "All Department", value: "all"},
                  ...teams.map((team: any) => ({
                    label: team.name,
                    value: team.id,
                  })),
                ]}
              />
            )}
          </div>
        </div>

        <Graph data={processCardData()} />
      </div>

      {/* Right Section: Top Performing Learning Paths */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
        <TopPerformance
          title="Top Performing Learning Path"
          subtitle={
            isLoadingPerformance
              ? "Loading..."
              : learningPathPerformance?.top?.title
              ? learningPathPerformance.top.title
              : learningPathPerformance && !learningPathPerformance.top
              ? "No data available"
              : "-"
          }
          percentage={
            isLoadingPerformance
              ? "--"
              : learningPathPerformance?.top?.averageScore !== undefined &&
                learningPathPerformance?.top?.averageScore !== null
              ? `${learningPathPerformance.top.averageScore}%`
              : learningPathPerformance && !learningPathPerformance.top
              ? "--"
              : "-"
          }
          icon={Trophy}
        />
        <TopPerformance
          title="Worst Performing Learning Path"
          subtitle={
            isLoadingPerformance
              ? "Loading..."
              : learningPathPerformance?.worst?.title
              ? learningPathPerformance.worst.title
              : learningPathPerformance && !learningPathPerformance.worst
              ? "No data available"
              : "-"
          }
          percentage={
            isLoadingPerformance
              ? "--"
              : learningPathPerformance?.worst?.averageScore !== undefined &&
                learningPathPerformance?.worst?.averageScore !== null
              ? `${learningPathPerformance.worst.averageScore}%`
              : learningPathPerformance && !learningPathPerformance.worst
              ? "--"
              : "-"
          }
          customIcon={
            <img src="/triangle-alert.png" alt="Alert" className="" />
          }
        />
      </div>
    </div>
  );
};

export default AdminCardCreated;
