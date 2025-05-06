import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  HeadsetIcon,
  Users,
  ChartNoAxesCombined,
  CircleAlert,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Table from "@/components/ui/table";

interface LeaderboardEntry {
  name: string;
  completion: string;
  cards: string;
  engagement: string;
  rankIcon: string;
  avatarUrl: string;
}

const columnsLeaderboardEntry = [
  { Header: "Rank", accessor: "rankIcon" },
  { Header: "Name", accessor: "name" },
  { Header: "Completion Rate", accessor: "completion" },
  { Header: "Created Card & Verified", accessor: "cards" },
  { Header: "Engagement Level", accessor: "engagement" },
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

export default function TutorAnalytics() {
  const [interval, setInterval] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [rowsPerPageLeaderboard, setRowsPerPageLeaderboard] = useState(4);
  const [currentPageLeaderboard, setCurrentPageLeaderboard] = useState(1);

  // Pagination logic
  const paginatedLeaderboardData = dataLeaderboardEntry.slice(
    (currentPageLeaderboard - 1) * rowsPerPageLeaderboard,
    currentPageLeaderboard * rowsPerPageLeaderboard
  );

  const totalLeaderboardPages = Math.ceil(
    dataLeaderboardEntry.length / rowsPerPageLeaderboard
  );
  console.log("", timePeriod, expandedItems);

  const categories = [
    { id: 1, name: "Marketing", score: 91, icon: "📢" },
    { id: 2, name: "CX", score: 55, icon: <HeadsetIcon /> },
    { id: 3, name: "HR", score: 87, icon: <Users /> },
    { id: 4, name: "Sales", score: 68, icon: <ChartNoAxesCombined /> },
  ];

  const strengths = [
    { id: 1, name: "Warranty", color: "#BB6BD9" },
    { id: 2, name: "Escalation", color: "#E86818" },
    { id: 3, name: "Brand Language", color: "#EFBE0F" },
  ];

  const opportunities = [
    { id: 1, name: "Return Policy", color: "#2ABF1D" },
    { id: 2, name: "Troubleshooting", color: "#D72828" },
    { id: 3, name: "Sale", color: "#306BE1" },
  ];

  const [policies] = useState([
    // Your policy array
    {
      title: "Warranty Policy",
      category: "Customer Support",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Vacation Policy",
      category: "HR",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Office Policy",
      category: "Marketing",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Remote Work Policy",
      category: "HR",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Security Policy",
      category: "IT",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
    {
      title: "Code of Conduct",
      category: "General",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    },
  ]);

  const CARDS_PER_PAGE = 3;
  const totalPages = Math.ceil(policies.length / CARDS_PER_PAGE);

  const visiblePolicies = policies.slice(
    currentPage * CARDS_PER_PAGE,
    (currentPage + 1) * CARDS_PER_PAGE
  );

  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));

  const toggleExpanded = (itemId: number) => {
    setTimePeriod("Monthly");
    setExpandedItems(prev => {
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
    <div className="">
      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Tutor Score Card */}
        <div className="bg-[#191919] rounded-[30px] p-4 lg:col-span-1">
          <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0] pt-5 mb-2 text-center"> Overall Tutor Score</h3>
          <div className="flex flex-col items-center">
            <div className="mb-4 w-20 h-20 relative">
              <Image
                src="/pic1.png"
                alt="Chart Background"
                fill
                className="rounded-lg object-cover"
                quality={100}
                priority
              />
            </div>
            <div className="text-center mb-4">
              <p className="text-smfont-urbanist font-medium text-[15px] leading-[100%] tracking-[0] mb-3">Maaz Amjad</p>
              <p className="font-urbanist font-medium text-[15px] leading-[100%] tracking-[0] text-white">maaz0301301@gmail.com</p>
            </div>
            <div className="w-full">
              <p className="font-urbanist font-bold text-[16px] leading-[140%] tracking-[0.01em] text-center  my-3">Overall Tutor Score</p>
              <div className="w-full flex rounded border overflow-hidden">
                <div className="bg-[#F9DB6F] text-center font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] text-black py-1 transition-all duration-300" style={{ width: "88%" }}>
                  88%
                </div>
                {/* <div className="bg-gray-200 flex-shrink-0"
                                    style={{ backgroundImage: "url('/Frame.png')", width: "100%" }}>
                                    <div className="sr-only">Content preview</div>
                                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Tutor Analytics Card */}
        <div className="bg-[#191919] rounded-[30px] p-4 lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <h3 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%] pt-5 mb-2 sm:mb-0">Tutor Analytics</h3>
            <div className="flex items-center gap-2">
              <Button className="h-10 w-10 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90">
                <FileText size={16} />
              </Button>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="bg-black text-white w-[114px] border-0 rounded-[80px]" style={{ height: "40px" }}>
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
      </div>

      {/* Bottom Section Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Completed Learning Paths */}
        <div className="w-full lg:w-1/3">
          <div className="bg-[#1c1c1c] rounded-[30px] h-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                Completed Learning Paths
              </h2>
              <div className="flex gap-2">
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage > 0
                      ? "text-[#F9DB6F] border-2 border-[#F9DB6F]"
                      : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                    }`}
                  onClick={goToPrevious}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage < totalPages - 1
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
                  category={policy.category}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">Insights</h2>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="bg-black text-white w-[114px] border-0 rounded-[80px]" style={{ height: "40px" }}>
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Scores */}
            <div className=" lg:flex  w-full  grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 overflow-x-auto overflow-y-hidden scrollbar-hide ">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`flex items-center justify-between p-8 rounded-xl bg-[#0E0F11] hover:bg-[#0E0F11] transition-colors gap-5 ${selectedCategory === category.id
                      ? "ring-2 ring-[#F9DB6F]"
                      : ""
                    }`}
                  //@ts-expect-error : category._id
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center gap-5">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <span className="bg-[#F9DB6F] text-black text-sm px-2 py-1 rounded-full">
                    {category.score}%
                  </span>
                </button>
              ))}
            </div>

            {/* Strengths & Opportunities */}
            <div className="space-y-4">
              <div className="bg-[#191919] rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-4">Strengths</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {strengths.map((strength) => (
                    <div
                      key={strength.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 bg-[#15FF00A1] border-[#F9DB6F]`}
                      onClick={() => toggleExpanded(strength.id)}
                    >
                      {strength.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#191919] rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-4">Opportunities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {opportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="p-3 rounded-lg cursor-pointer transition-colors border-l-4 bg-[#C80909E5] border-[#F9DB6F] hover:bg-[#C80909E5]"

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

      <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 mt-10 shadow-lg w-full">
        <div className="flex justify-between mb-4 items-center">
          <h3 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
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
                    <div className="flex items-center gap-3 text-white">
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
              cellClassName="py-2 px-4 relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
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
              <SelectTrigger className="bg-black text-white w-[70px] border-0 py-1 px-2 text-xs">
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
  );
}

//@ts-expect-error: some error
const PolicyCard = ({ title, description, category }) => {
  return (
    <div className="group relative bg-[#191919] rounded-xl p-4 transition-all hover:bg-[#191919]/90 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="bg-[#F9DB6F] w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
          <CircleAlert className="text-black" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-600/30 rounded-full">
              {category}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-2">{description}</p>
        </div>
      </div>
    </div>
  );
};
