import React, {useState, useEffect, useCallback} from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";
import {Icon} from "@iconify/react/dist/iconify.js";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import {fetchTeams, fetchLeaderBoard} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import TableLoader from "../shared/table-loader";
import {exportToPDF} from "@/utils/exportToPDF";
import Loader from "../shared/loader";

interface AdminLeaderBoardProps {
  departmentId: string | null;
}

const AdminLeaderBoard = () => {
  interface LeaderboardEntry {
    name: string;
    completion: string;
    cards: string;
    engagement: string;
    rankIcon: string;
    avatarUrl: string;
    departmentId?: string;
    total: number;
    verified: number;
    percentage: number;
  }

  const {userData} = useUserHook();
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [teams, setTeams] = useState<{id: string; name: string}[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [filteredLeaderboardData, setFilteredLeaderboardData] = useState<
    LeaderboardEntry[]
  >([]);

  const columnsLeaderboardEntry = [
    {Header: "Rank", accessor: "rankIcon"},
    {Header: "Name", accessor: "name"},
    {Header: "Created Card", accessor: "total"},
    {Header: "Verified", accessor: "verified"},
    {Header: "Completion Rate", accessor: "percentage"},
  ];

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

  const exportLeaderboardToPDF = useCallback(() => {
    if (filteredLeaderboardData.length === 0 || isExportingPDF) return;

    setIsExportingPDF(true);
    try {
      const dataForPdf = filteredLeaderboardData.map((entry, index) => ({
        rank: index + 1,
        name: entry.name,
        total: entry.total,
        verified: entry.verified,
        percentage: entry.completion,
      }));

      exportToPDF({
        title: "Leaderboard",
        filename: "leaderboard-list",
        data: dataForPdf,
        type: "table",
        columns: ["rank", "name", "total", "verified", "percentage"],
        headers: {
          rank: "Rank",
          name: "Name",
          total: "Created Card",
          verified: "Verified",
          percentage: "Completion Rate",
        },
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  }, [filteredLeaderboardData, isExportingPDF]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!userData?.user_id) return;
      setIsLoadingData(true);
      const data = await fetchLeaderBoard(
        userData.id,
        startDate?.toISOString(),
        endDate?.toISOString(),
        selectedTeam !== "all" ? selectedTeam : undefined
      );
      if (data?.stats) {
        setFilteredLeaderboardData(
          data.stats.map((entry: any, idx: number) => ({
            name: `${entry.card_owner.first_name} ${entry.card_owner.last_name}`,
            completion: `${entry.percentage}%`,
            cards: `${entry.total} (${entry.verified} Verified)`,
            engagement: `${entry.total} / ${entry.verified}`,
            rankIcon: idx === 0 ? "winner" : idx === 1 ? "second" : "third",
            avatarUrl: entry.card_owner.profile_picture,
            departmentId: entry.card_owner.team_id,
            total: entry.total,
            verified: entry.verified,
            percentage: entry.percentage,
          }))
        );
      } else {
        setFilteredLeaderboardData([]);
      }
      setIsLoadingData(false);
    };

    fetchLeaderboard();
  }, [userData, selectedTeam, startDate, endDate]);

  return (
    <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full">
      <div className="flex justify-between mb-4 items-center">
        <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
          Leaderboard
        </h3>
        <div className="flex items-center gap-4">
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
          <DateRangeDropdown
            selectedRange={selectedTeam}
            onRangeChange={setSelectedTeam}
            width="250px"
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
          <Button
            onClick={exportLeaderboardToPDF}
            disabled={
              isLoadingData ||
              filteredLeaderboardData.length === 0 ||
              isExportingPDF
            }
            className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer"
          >
            {isExportingPDF ? (
             <Loader/>
            ) : (
              <Icon
                icon="bi:filetype-pdf"
                width="24"
                height="24"
                color="white"
                className="cursor-pointer"
              />
            )}
          </Button>
        </div>
      </div>
      <div
        className={`flex flex-col justify-end items-start mb-6 gap-4 transition-opacity duration-300 ${
          isLoadingData ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoadingData ? (
          <TableLoader />
        ) : (
          <div className="w-full">
            <Table
              columns={columnsLeaderboardEntry}
              data={filteredLeaderboardData}
              renderCell={(column, row) => {
                if (column === "rankIcon") {
                  let rankText;
                  switch (row[column]) {
                    case "winner":
                      rankText = "Winner";
                      break;
                    case "second":
                      rankText = "2nd place";
                      break;
                    case "third":
                      rankText = "3rd place";
                      break;
                    default:
                      rankText = "Winner";
                  }
                  return (
                    <span className="bg-[#F9DB6F] text-black px-3 w-full py-3 h-[23px] rounded-full font-bold text-[10px] max-w-[100px] flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <img
                          src="/champion.png"
                          alt="Champion"
                          className="w-5 h-5 object-contain"
                        />
                        <span>{rankText}</span>
                      </div>
                    </span>
                  );
                }
                if (column === "name")
                  return (
                    <div className="flex items-center gap-3">
                      <Image
                        src={row.avatarUrl}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-white">
                        {row.name}
                      </span>
                    </div>
                  );
                if (column === "percentage")
                  return (
                    <div className="flex items-center gap-3">
                      {row.completion}
                    </div>
                  );
                return row[column as keyof LeaderboardEntry];
              }}
              tableClassName="w-full text-sm"
              headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
              bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
              cellClassName="py-2 px-4 relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] border-t border-[#E0EAF5]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaderBoard;
