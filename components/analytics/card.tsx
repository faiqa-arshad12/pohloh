import React, {useEffect, useState} from "react";
import Table from "../ui/table";
import UnverifiedCards from "../dashboard/unverfied-card";
import Image from "next/image";
import {Button} from "../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  HeadsetIcon,
  Users,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {useRole} from "../ui/Context/UserContext";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

interface UnansweredSearch {
  term: string;
  frequency: string;
}
interface LeaderboardEntry {
  name: string;
  completion: string;
  cards: string;
  engagement: string;
  rankIcon: string;
  avatarUrl: string;
}

const columnsLeaderboardEntry = [
  {Header: "Rank", accessor: "rankIcon"},
  {Header: "Name", accessor: "name"},
  {Header: "Completion Rate", accessor: "completion"},
  {Header: "Created Card & Verified", accessor: "cards"},
  {Header: "Engagement Level", accessor: "engagement"},
];

const dataLeaderboardEntry: LeaderboardEntry[] = [
  {
    name: "John Doe",
    completion: "90%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥇 Winner",
    avatarUrl: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "John Doe",
    completion: "80%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥈 2nd place",
    avatarUrl: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "John Doe",
    completion: "70%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥉 3rd place",
    avatarUrl: "https://i.pravatar.cc/40?img=3",
  },
  {
    name: "John Doe",
    completion: "90%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥇 Winner",
    avatarUrl: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "John Doe",
    completion: "80%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥈 2nd place",
    avatarUrl: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "John Doe",
    completion: "70%",
    cards: "12 (10 Verified)",
    engagement: "120 / 5",
    rankIcon: "🥉 3rd place",
    avatarUrl: "https://i.pravatar.cc/40?img=3",
  },
];
const columnsUnansweredSearch = [
  {Header: "Search Terms", accessor: "term"},
  {Header: "Search Frequency", accessor: "frequency"},
];

const dataUnansweredSearch: UnansweredSearch[] = [
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
];

const strengths = [
  {id: 1, name: "Warranty"},
  {id: 2, name: "Escalation"},
  {id: 3, name: "Brand Language"},
  {id: 4, name: "Warranty"},
  {id: 5, name: "Escalation"},
  {id: 6, name: "Brand Language"},
  {id: 7, name: "Warranty"},
  {id: 8, name: "Escalation"},
  {id: 9, name: "Brand Language"},
];

const opportunities = [
  {id: 1, name: "Return Policy"},
  {id: 2, name: "Troubleshooting"},
  {id: 3, name: "Sale"},
  {id: 4, name: "Warranty"},
  {id: 5, name: "Escalation"},
  {id: 6, name: "Brand Language"},
];

export default function Card() {
  const [interval, setInterval] = useState("monthly");
  const {roleAccess} = useRole();
  const [rowsPerPageUnanswered, setRowsPerPageUnanswered] = useState(4);
  const [currentPageUnanswered, setCurrentPageUnanswered] = useState(1);
  const [rowsPerPageLeaderboard, setRowsPerPageLeaderboard] = useState(4);
  const [currentPageLeaderboard, setCurrentPageLeaderboard] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageStrength, setCurrentPageStrength] = useState(0);
  const [currentPageOppurtinity, setCurrentPageOppurtinity] = useState(0);
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [policies] = useState([
    {
      title: "How to order products online?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "CX Tips & Tricks",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Design Techniques",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Remote Work Policy",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Security Policy",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Code of Conduct",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
  ]);
  const CARDS_PER_PAGE = 3;
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(policies.length / CARDS_PER_PAGE);
  const totalStrengthPages = Math.ceil(strengths.length / ITEMS_PER_PAGE);
  const totalOppurtinityPages = Math.ceil(
    opportunities.length / ITEMS_PER_PAGE
  );
  const visiblePolicies = policies.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );
  const visibleStrength = strengths.slice(
    currentPageStrength * ITEMS_PER_PAGE,
    (currentPageStrength + 1) * ITEMS_PER_PAGE
  );
  const visibleOppurtinity = opportunities.slice(
    currentPageOppurtinity * ITEMS_PER_PAGE,
    (currentPageOppurtinity + 1) * ITEMS_PER_PAGE
  );
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goToPreviousStrength = () =>
    setCurrentPageStrength((prev) => Math.max(prev - 1, 0));
  const goToNextStrength = () =>
    setCurrentPageStrength((prev) =>
      Math.min(prev + 1, totalStrengthPages - 1)
    );
  const goToPreviousOppurtinity = () =>
    setCurrentPageOppurtinity((prev) => Math.max(prev - 1, 0));
  const goToNextOppurtinity = () =>
    setCurrentPageOppurtinity((prev) =>
      Math.min(prev + 1, totalOppurtinityPages - 1)
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
  const isExpanded = (itemId: number) => expandedItems.has(itemId);
  // Pagination logic
  const paginatedUnansweredData = dataUnansweredSearch.slice(
    (currentPageUnanswered - 1) * rowsPerPageUnanswered,
    currentPageUnanswered * rowsPerPageUnanswered
  );
  const paginatedLeaderboardData = dataLeaderboardEntry.slice(
    (currentPageLeaderboard - 1) * rowsPerPageLeaderboard,
    currentPageLeaderboard * rowsPerPageLeaderboard
  );
  const totalUnansweredPages = Math.ceil(
    dataUnansweredSearch.length / rowsPerPageUnanswered
  );
  const totalLeaderboardPages = Math.ceil(
    dataLeaderboardEntry.length / rowsPerPageLeaderboard
  );
  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="bg-[#191919] rounded-[30px] p-4 pt-10 lg:w-2/3 w-full">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%] mb-2 sm:mb-0">
              Cards Created on Weekly Basis
            </h3>
            <div className="flex items-center gap-2">
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="bg-black text-white w-[114px] rounded-[114px] border-0">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative h-48 sm:h-56 lg:h-64">
            <Image
              src="/Frame 5.png"
              alt="Analytics Chart"
              fill
              className="rounded-lg object-contain"
              quality={100}
              priority
            />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <UnverifiedCards />
        </div>
      </div>

      {(roleAccess === "admin" || roleAccess === "owner") && (
        <div className="">
          {/* Unanswered Searches Card */}
          <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full mb-6">
            <div className="flex justify-between mb-4 items-center">
              <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
                Unanswered Searches
              </h3>
              <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                <FileText size={16} />
              </Button>
            </div>
            <div className="flex flex-col w-full items-start justify-between mb-6 gap-4">
              <div className="w-full">
                <Table
                  columns={columnsUnansweredSearch}
                  data={paginatedUnansweredData}
                  renderActions={() => (
                    <button className="text-[#F9DB6F] font-medium hover:text-[#F9DB6F] transition-colors px-3 py-1.5">
                      + Create Card
                    </button>
                  )}
                  tableClassName="w-full text-sm"
                  headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                  bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
                  cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <Select
                  value={String(rowsPerPageUnanswered)}
                  onValueChange={(value) => {
                    setRowsPerPageUnanswered(Number(value));
                    setCurrentPageUnanswered(1);
                  }}
                >
                  <SelectTrigger className="bg-black text-white w-[70px] rounded-[80px] border-0 py-1 px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    {[4, 6, 8, 10, 20].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs text-gray-400">
                Page {currentPageUnanswered} of {totalUnansweredPages}
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setCurrentPageUnanswered((prev) => prev - 1)}
                  disabled={currentPageUnanswered === 1}
                  className="bg-[#333435] hover:bg-[#333435] border-[#CDCDCD] border py-1 px-3 rounded-[8px] flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPageUnanswered((prev) => prev + 1)}
                  disabled={currentPageUnanswered === totalUnansweredPages}
                  className="bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black py-1 px-3 rounded-[8px] flex items-center gap-1"
                >
                  Next
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full">
            <div className="flex justify-between mb-4 items-center">
              <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
                Leaderboard
              </h3>
              <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                <FileText size={16} />
              </Button>
            </div>
            <div className="flex flex-col justify-end items-start mb-6 gap-4">
              <div className="w-full">
                <Table
                  columns={columnsLeaderboardEntry}
                  data={paginatedLeaderboardData}
                  renderCell={(column, row) => {
                    if (column === "rankIcon")
                      return (
                        <span className="bg-[#F9DB6F] text-black px-3 py-1 rounded-full font-bold text-xs">
                          {row[column]}
                        </span>
                      );
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

            <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <Select
                  value={String(rowsPerPageLeaderboard)}
                  onValueChange={(value) => {
                    setRowsPerPageLeaderboard(Number(value));
                    setCurrentPageLeaderboard(1);
                  }}
                >
                  <SelectTrigger className="bg-black text-white w-[70px] rounded-[80px] border-0 py-1 px-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    {[4, 6, 8, 10, 20].map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-xs text-gray-400">
                Page {currentPageLeaderboard} of {totalLeaderboardPages}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setCurrentPageLeaderboard((prev) => prev - 1)}
                  disabled={currentPageLeaderboard === 1}
                  className="bg-[#333435] hover:bg-[#333435] border-[#CDCDCD] border py-1 px-3 rounded-[8px] flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPageLeaderboard((prev) => prev + 1)}
                  disabled={currentPageLeaderboard === totalLeaderboardPages}
                  className="bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black py-1 px-3 rounded-[8px] flex items-center gap-1"
                >
                  Next
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {roleAccess === "user" && (
        <div className="flex flex-col lg:flex-row gap-6 mt-6 ">
          {/* Completed Learning Paths */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#1c1c1c] rounded-[30px] h-full p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">
                    Trent’s Recent Cards
                  </h2>
                  <p>Last 30 days</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
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
            <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
                  Insights
                </h2>
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger className="bg-black text-white w-[114px] rounded-[80px] border-0 py-1 px-2 text-xs">
                    <SelectValue placeholder="Monthly" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Strengths & Opportunities */}
              <div className="space-y-4 flex flex-col lg:flex-row gap-4 w-full">
                {/* Strengths Section */}
                <div className="bg-[#191919] rounded-xl p-4 w-full flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">Strengths</h3>
                    <div className="flex gap-2">
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
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
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          currentPageStrength < totalStrengthPages - 1
                            ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                            : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={goToNextStrength}
                        disabled={
                          currentPageStrength === totalStrengthPages - 1
                        }
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    {visibleStrength.map((strength) => (
                      <div
                        key={strength.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 mb-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                        onClick={() => toggleExpanded(strength.id)}
                      >
                        {strength.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opportunities Section */}
                <div className="bg-[#191919] rounded-xl p-4 w-full flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">Opportunities</h3>
                    <div className="flex gap-2">
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          currentPageOppurtinity > 0
                            ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                            : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={goToPreviousOppurtinity}
                        disabled={currentPageOppurtinity === 0}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          currentPageOppurtinity < totalOppurtinityPages - 1
                            ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                            : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={goToNextOppurtinity}
                        disabled={
                          currentPageOppurtinity === totalOppurtinityPages - 1
                        }
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    {visibleOppurtinity.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-4 border-l-4 border-[#F9DB6F] bg-[#0f0f0f] hover:bg-[#0f0f0f]`}
                        onClick={() => toggleExpanded(opportunity.id)}
                      >
                        {opportunity.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//@ts-expect-error: some error
const PolicyCard = ({title, description}) => {
  return (
    <div className="group relative bg-[#191919] rounded-xl p-4 transition-all hover:bg-[#191919]/90 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="bg-[#F9DB6F] w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
          <CircleAlert className="text-black" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-gray-300 text-sm mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};
