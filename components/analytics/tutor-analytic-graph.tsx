"use client";
import {useEffect, useState, useRef} from "react";
import {Button} from "../ui/button";
import {Icon} from "@iconify/react/dist/iconify.js";
import {useRole} from "../ui/Context/UserContext";
import {fetchTutorScore, fetchTeams} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import ReusableBarChart from "./BarAnalyticsChart";
import {generateChartData} from "../../utils/char-helper";
import {
  exportToPDF,
  createTutorAnalyticsPDFConfig,
} from "../../utils/graphPdfExport";

const AdminTutorAnalyticGraph = ({
  id,
  dashboard,
  isPersonal,
}: {
  id?: string | null;
  dashboard?: boolean;
  isPersonal?: boolean;
}) => {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const {roleAccess} = useRole();
  const {userData} = useUserHook();
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch teams for owner
  useEffect(() => {
    if (userData && roleAccess === "owner") {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response || []);
      };
      fetchteams();
    }
  }, [userData, roleAccess]);

  // Initialize default date range (Last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  }, []);

  // Fetch initial data and when selectedTeam changes
  useEffect(() => {
    const fetchData = async () => {
      if (userData?.organizations?.id) {
        setIsLoadingData(true);
        try {
          let category = undefined;
          if (roleAccess === "owner") {
            category = selectedTeam !== "all" ? selectedTeam : undefined;
          } else if (roleAccess === "admin") {
            category = userData?.team_id;
          }
          const response = await fetchTutorScore(
            id ? id : userData.id,
            category,
            isPersonal
          );

          if (response && response.score && response.score.monthly) {
            const generatedData = generateChartData(
              response.score.monthly,
              "average"
            );
            setChartData(generatedData);
          } else {
            setChartData(generateChartData([], "average"));
          }
        } catch (error) {
          setChartData(generateChartData([], "average"));
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setChartData(generateChartData([], "average"));
      }
    };

    fetchData();
  }, [userData, selectedTeam, roleAccess]);

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

    // Fetch data for the selected range
    if (id) {
      try {
        const response = await fetchTutorScore(id);
        if (response && response.score && response.score.monthly) {
          setChartData(generateChartData(response.score.monthly, "average"));
        }
      } catch (error) {
        console.error("Error fetching tutor score:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  const handleApplyCustomFilter = async (
    newStartDate: Date,
    newEndDate: Date
  ) => {
    setIsLoadingData(true);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setSelectedRange(
      `${newStartDate.toLocaleDateString()} - ${newEndDate.toLocaleDateString()}`
    );

    // Fetch data for the custom date range
    if (id) {
      try {
        const response = await fetchTutorScore(id);
        if (response && response.score && response.score.monthly) {
          setChartData(generateChartData(response.score.monthly, "average"));
        }
      } catch (error) {
        console.error("Error fetching tutor score:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  const handleExportToPDF = async () => {
    setIsExportingPDF(true);

    try {
      const config = createTutorAnalyticsPDFConfig(
        chartData,
        selectedTeam,
        teams,
        "",
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
    <div className="bg-[#191919] rounded-[30px] p-6 col-span-3" ref={chartRef}>
      {" "}
      <ReusableBarChart
        chartData={chartData}
        isLoading={isLoadingData}
        title="Tutor Analytics"
        tooltipSuffix="%"
        height="h-80"
      >
        {roleAccess !== "user" && !id && !dashboard && (
          <Button
            className="w-[52px] h-[50px] bg-[#F9DB6F] hover:bg-[#F9DB6F] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer disabled:opacity-50"
            onClick={handleExportToPDF}
            disabled={isExportingPDF || isLoadingData}
          >
            {isExportingPDF ? (
              <Icon
                icon="eos-icons:loading"
                width="24"
                height="24"
                color="black"
                className="animate-spin"
              />
            ) : (
              <Icon
                icon="bi:filetype-pdf"
                width="24"
                height="24"
                color="black"
                className="cursor-pointer"
              />
            )}
          </Button>
        )}
        {/* Department filter for owners */}
        {roleAccess === "owner" && !id && (
          <DateRangeDropdown
            selectedRange={selectedTeam}
            onRangeChange={setSelectedTeam}
            width="250px"
            bg={"bg-[black]"}
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
      </ReusableBarChart>
    </div>
  );
};

export default AdminTutorAnalyticGraph;
