import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";
import {Icon} from "@iconify/react/dist/iconify.js";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {CustomDateFilterModal} from "../shared/date-filter";
import {getDropdownOptions} from "@/utils/constant";
import {fetchTeams} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";

interface AdminLeaderBoardProps {
  departmentId: string | null;
}

const AdminLeaderBoard = ({departmentId}: AdminLeaderBoardProps) => {
  interface LeaderboardEntry {
    name: string;
    completion: string;
    cards: string;
    engagement: string;
    rankIcon: string;
    avatarUrl: string;
    departmentId?: string;
  }

  const {userData} = useUserHook();
  const [selectedRange, setSelectedRange] = useState("Last 30 days");
  const [showCustomFilterModal, setShowCustomFilterModal] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");

  const columnsLeaderboardEntry = [
    {Header: "Rank", accessor: "rankIcon"},
    {Header: "Name", accessor: "name"},
    {Header: "Completion Rate", accessor: "completion"},
    {Header: "Created Card & Verified", accessor: "cards"},
    {Header: "Engagement Level", accessor: "engagement"},
  ];

  const initialDataLeaderboardEntry: LeaderboardEntry[] = [
    {
      name: "John Doe",
      completion: "90%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "winner",
      avatarUrl: "https://i.pravatar.cc/40?img=1",
      departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19", // Customer Department
    },
    {
      name: "John Doe",
      completion: "80%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "second",
      avatarUrl: "https://i.pravatar.cc/40?img=2",
      departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f", // Operations Department
    },
    {
      name: "John Doe",
      completion: "70%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "third",
      avatarUrl: "https://i.pravatar.cc/40?img=3",
      departmentId: "9b62f894-209c-4418-8779-16c8adde4eea", // Security Department
    },
    {
      name: "John Doe",
      completion: "90%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "winner",
      avatarUrl: "https://i.pravatar.cc/40?img=1",
      departmentId: "ff8d7ba1-ff9b-436f-bb1e-a7dbb83bbcff", // test Department
    },
    {
      name: "John Doe",
      completion: "80%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "second",
      avatarUrl: "https://i.pravatar.cc/40?img=2",
      departmentId: "62e7b485-70c7-4807-b3e3-943a7d7e7d19",
    },
    {
      name: "John Doe",
      completion: "70%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "third",
      avatarUrl: "https://i.pravatar.cc/40?img=3",
      departmentId: "9bbec25d-a60a-433d-8f87-58f256fcc16f",
    },
  ];

  const [filteredLeaderboardData, setFilteredLeaderboardData] = useState<
    LeaderboardEntry[]
  >(initialDataLeaderboardEntry);

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

  useEffect(() => {
    if (departmentId === null && selectedTeam === "all") {
      setFilteredLeaderboardData(initialDataLeaderboardEntry);
    } else {
      const filtered = initialDataLeaderboardEntry.filter(
        (entry) =>
          entry.departmentId ===
          (selectedTeam !== "all" ? selectedTeam : departmentId)
      );
      setFilteredLeaderboardData(filtered);
    }
  }, [departmentId, selectedTeam]);

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
          <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer">
            <Icon
              icon="bi:filetype-pdf"
              width="24"
              height="24"
              color="white"
              className="cursor-pointer"
            />
          </Button>
        </div>
      </div>
      <div
        className={`flex flex-col justify-end items-start mb-6 gap-4 transition-opacity duration-300 ${
          isLoadingData ? "opacity-50" : "opacity-100"
        }`}
      >
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
              //@ts-expect-error: column error
              return row[column];
            }}
            tableClassName="w-full text-sm"
            headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
            bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
            cellClassName="py-2 px-4 relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] border-t border-[#E0EAF5]"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderBoard;
