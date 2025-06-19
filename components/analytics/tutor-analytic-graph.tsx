"use client";
import {useEffect, useState} from "react";
import {Button} from "../ui/button";
import {Icon} from "@iconify/react/dist/iconify.js";
import {useRole} from "../ui/Context/UserContext";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceDot,
} from "recharts";
import {fetchTutorScore, fetchTeams} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {Skeleton} from "../ui/skeleton";
import Loader from "../shared/loader";

const generateChartData = (monthlyData: any[]) => {
  // Get current month index (0-11)
  const currentMonth = new Date().getMonth();

  // Create array of last 12 months instead of 6
  const last12Months = Array.from({length: 12}, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames[monthIndex];
  }).reverse();

  // Find the maximum value to determine which bar should be yellow
  const maxValue = Math.max(...monthlyData.map((item) => item.average), 0);

  // Map the data to include only last 12 months
  const chartData = last12Months.map((month) => {
    // Find matching data by comparing short month name with API month format
    const monthData = monthlyData.find((item) => {
      const apiMonth = item.month.split(" ")[0]; // Extract "Jul" from "Jul 2024"
      return apiMonth === month;
    }) || {
      month,
      average: 0,
      count: 0,
    };

    const isHighestValue = monthData.average === maxValue && maxValue > 0;

    return {
      month: monthData.month.split(" ")[0] || month, // Use short month name for display
      value: monthData.average || 0.1, // Use actual value, minimum 0.1 for visibility when 0
      actualValue: monthData.average, // Keep actual value for tooltip
      count: monthData.count,
      isHighlighted: isHighestValue, // Only highlight the highest value
      hasData: monthData.count > 0,
    };
  });

  return chartData;
};

const CustomTooltip = ({active, payload, label}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Show tooltip for bars with actual data
    if (data.hasData) {
      return (
        <div className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border-0">
          <div>{`${label}: ${data.actualValue}%`}</div>
        </div>
      );
    }
  }
  return null;
};

const AdminTutorAnalyticGraph = ({
  id,
  dashboard,
}: {
  id?: string | null;
  dashboard?: boolean;
}) => {
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const {roleAccess} = useRole();
  const {userData} = useUserHook();

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
            category
          );

          if (response && response.score && response.score.monthly) {
            const generatedData = generateChartData(response.score.monthly);
            setChartData(generatedData);
          } else {
            setChartData(generateChartData([]));
          }
        } catch (error) {
          setChartData(generateChartData([]));
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setChartData(generateChartData([]));
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
          setChartData(generateChartData(response.score.monthly));
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
          setChartData(generateChartData(response.score.monthly));
        }
      } catch (error) {
        console.error("Error fetching tutor score:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  return (
    <div className="bg-[#191919] rounded-[30px] p-6 col-span-3">
      {/* SVG Pattern Definitions */}
      <svg width="0" height="0">
        <defs>
          <pattern
            id="diagonalHatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="#2a2a2a" />
            <rect width="2" height="6" fill="#404040" />
          </pattern>
        </defs>
      </svg>

      <div className="flex justify-between mb-6">
        <h3 className="text-[24px] font-medium text-white">Tutor Analytics</h3>
        <div className="flex items-center gap-2">
          {roleAccess !== "user" && !id && !dashboard && (
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
        </div>
      </div>

      <div
        className={`relative w-full h-80 transition-opacity duration-300 flex justify-center ${
          isLoadingData ? "opacity-100" : "opacity-100"
        }`}
      >
        {isLoadingData ? (
          <div className="flex flex-col justify-center items-center w-full h-full gap-4">
            <Loader size={40} />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 60,
                right: 30,
                left: 30,
                bottom: 30,
              }}
              barCategoryGap="15%"
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{fill: "#888", fontSize: 14, fontWeight: 400}}
                dy={10}
                tickFormatter={(label) => label.split(" ")[0]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{fill: "transparent"}}
                position={{x: undefined, y: undefined}}
                allowEscapeViewBox={{x: false, y: true}}
                offset={-20}
                coordinate={{x: undefined, y: undefined}}
                isAnimationActive={false}
              />
              <Bar
                dataKey="value"
                radius={[12, 12, 12, 12]}
                stroke="none"
                style={{cursor: "pointer"}}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isHighlighted ? "#F9DB6F" : "url(#diagonalHatch)"
                    }
                    stroke="none"
                    style={{cursor: "pointer"}}
                  />
                ))}
              </Bar>

              {/* Add dots on top of bars */}
              {chartData.map((entry, index) => (
                <ReferenceDot
                  key={`dot-${index}`}
                  x={entry.month}
                  y={entry.value + 2}
                  r={4}
                  fill="#F9DB6F"
                  stroke="none"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        )}
      </div>

      <style jsx>{`
        .recharts-bar-rectangle {
          cursor: pointer !important;
        }
        .recharts-responsive-container {
          cursor: default;
        }
        .recharts-bar-rectangle:hover {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
};

export default AdminTutorAnalyticGraph;
