import {useEffect, useState} from "react";
import {
  XAxis,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  CartesianGrid,
  Area,
} from "recharts";
import {
  MoreHorizontal,
  ChevronDown,
  Filter,
  FileText,
  Edit,
  Trash2,
  Check,
  Flame,
  Trophy,
  Eye,
  FileDown,
  GraduationCap,
  Headset,
  TriangleAlert,
  ArrowRight,
  ArrowLeft,
  Ellipsis,
  CircleHelp,
  Users,
  Copy,
} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";
import TutorAnalytics from "./Admin/tutor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Card from "./card";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {useRole} from "../ui/Context/UserContext";
import {Role} from "@/types/types";
// Table Component

// Interfaces for data types
interface Tutor {
  id: number;
  name: string;
  rating: string;
  completionRate: string;
  strengths: string[];
  opportunities: string[];
}

const data = [
  {name: "Week 1", value: 4},
  {name: "Week 2", value: 5},
  {name: "Week 3", value: 4},
  {name: "Week 4", value: 4.5},
  {name: "Week 5", value: 5.5},
  {name: "Week 6", value: 5},
];

interface LearningPath {
  id: number;
  name: string;
  path: string;
  completion: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  image: string;
}

// Mock data
const tutorsList: Tutor[] = [
  {
    id: 1,
    name: "John Henry",
    rating: "91%",
    completionRate: "6%",
    strengths: ["Shopify", "Tier 1"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 2,
    name: "Darlene Robertson",
    rating: "83%",
    completionRate: "83%",
    strengths: ["Warranty", "Tier 2"],
    opportunities: ["Summer Sale", "Troubleshooting"],
  },
  {
    id: 3,
    name: "Albert Flores",
    rating: "5%",
    completionRate: "5%",
    strengths: ["Escalation", "Brand Language"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 4,
    name: "Cameron Williamson",
    rating: "39",
    completionRate: "41%",
    strengths: ["Call Script", "Summer Sale"],
    opportunities: ["Tier 1", "Troubleshooting"],
  },
  {
    id: 5,
    name: "John ",
    rating: "91%",
    completionRate: "6%",
    strengths: ["Shopify", "Tier 1"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 6,
    name: "Robertson",
    rating: "83%",
    completionRate: "83%",
    strengths: ["Warranty", "Tier 2"],
    opportunities: ["Summer Sale", "Troubleshooting"],
  },
  {
    id: 7,
    name: "Flores",
    rating: "5%",
    completionRate: "5%",
    strengths: ["Escalation", "Brand Language"],
    opportunities: ["Return Policy", "Troubleshooting"],
  },
  {
    id: 8,
    name: "Williamson",
    rating: "39",
    completionRate: "41%",
    strengths: ["Call Script", "Summer Sale"],
    opportunities: ["Tier 1", "Troubleshooting"],
  },
];

const learningPaths: LearningPath[] = [
  {
    id: 1,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
  },
  {
    id: 2,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
  },
  {
    id: 3,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
  },
  {
    id: 4,
    name: "John Doe",
    image: "/pic1.png",
    path: "Customer Support",
    completion: "30%",
    dueDate: "10 Sept 2024",
    priority: "High",
  },
  {
    id: 5,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Low",
  },
  {
    id: 6,
    name: "John Doe",
    image: "/pic1.png",
    path: "Advanced Sales",
    completion: "40%",
    dueDate: "10 Sept 2024",
    priority: "Medium",
  },
];

// const rowsPerPage = 4;

export default function AnalyticsDashboard() {
  const {roleAccess} = useRole();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("tutor");
  const [interval, setInterval] = useState("monthly");

  // Define columns for tutors table
  const tutorColumns = [
    {Header: "Tutor Name", accessor: "name"},
    {Header: "Average Tutor Score", accessor: "rating"},
    {Header: "Completion rate", accessor: "completionRate"},
    {Header: "Strength", accessor: "strengths"},
    {Header: "Opportunities", accessor: "opportunities"},
    {Header: "Action", accessor: "action"},
  ];

  // Define columns for learning paths table
  const pathColumns = [
    {Header: "Name", accessor: "name"},
    {Header: "Learning Path", accessor: "path"},
    {Header: "Completion", accessor: "completion"},
    {Header: "Due Date", accessor: "dueDate"},
    {Header: "Priority", accessor: "priority"},
    {Header: "Action", accessor: "action"},
  ];

  useEffect(() => {
    console.log("User role detected", roleAccess);
    if (roleAccess === "user") {
      setActiveTab("tutor");
    } else {
      setActiveTab("");
    }
  }, [roleAccess]);

  const handleDelete = (id: number) => {
    alert("deleted" + id);
  };

  const handleDeletePath = (id: number) => {
    alert("deleted" + id);
  };

  {
    /*** table related Functions  */
  }
  const renderRowActionsTutor = (row: Tutor) => {
    return (
      <div className="flex justify-start">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded">
              <Ellipsis className="h-5 w-5 text-white" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            className="min-w-[200px] bg-[#222222] border border-[#333] rounded-md shadow-lg py-2 p-2 z-50"
          >
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <GraduationCap className="h-4 w-4" />
              <span>Assigned Learning Path</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <FileDown className="h-4 w-4" />
              <span>Export as PDF</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => handleDelete(row.id)}
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  };

  // Updated renderRowActionsPath function
  const renderRowActionsPath = (row: LearningPath) => {
    return (
      <div className="flex justify-start">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded">
              <Ellipsis className="h-5 w-5 text-white" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            className="min-w-[200px] bg-[#222222] border border-[#333] rounded-md shadow-lg py-2 p-2 z-50"
          >
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <GraduationCap className="h-4 w-4" />
              <span>Assigned Learning Path</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <FileDown className="h-4 w-4" />
              <span>Export as PDF</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Eye className="h-4 w-4" />
              <span>View</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => handleDeletePath(row.id)}
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  };

  // Custom cell renderer for tutors
  const renderTutorCell = (column: string, row: Tutor) => {
    switch (column) {
      case "strengths":
        return (
          <div className="flex gap-1">
            {row.strengths.map((strength, i) => (
              <span
                key={i}
                className="bg-[#F9DB6F66] text-xs px-2 py-1 rounded-full"
              >
                {strength}
              </span>
            ))}
          </div>
        );
      case "opportunities":
        return (
          <div className="flex gap-1">
            {row.opportunities.map((opportunity, i) => (
              <span
                key={i}
                className="bg-[#F9DB6F66] text-xs px-2 py-1 rounded-full"
              >
                {opportunity}
              </span>
            ))}
          </div>
        );
      case "action":
        return (
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="text-gray-400"
          >
            <MoreHorizontal size={16} />
          </button>
        );
      default:
        return row[column as keyof Tutor];
    }
  };

  // Custom cell renderer for learning paths
  const renderPathCell = (column: string, row: LearningPath) => {
    switch (column) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <div className="rounded-full h-8 w-8 flex items-center justify-center overflow-hidden">
              <Image
                src="/pic1.png"
                alt="Avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            {row.name}
          </div>
        );
      case "priority":
        const priorityColor =
          row.priority === "High"
            ? "bg-red-500"
            : row.priority === "Medium"
            ? "bg-yellow-500"
            : "bg-green-500";

        return (
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${priorityColor}`}></div>
            {row.priority}
          </div>
        );
      case "action":
        return (
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="text-gray-400"
          >
            <MoreHorizontal size={16} />
          </button>
        );
      default:
        return row[column as keyof LearningPath];
    }
  };

  return (
    <div className=" text-white min-h-screen">
      {/* Main Content */}
      <div className="py-6">
        {/* Main Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-white text-[36px] font-semibold">Analytics</h1>

            <div className="flex gap-2">
              <Button className="bg-[#F9DB6F] text-black px-4 py-1 rounded">
                <Filter size={16} />
              </Button>

              <div className="flex border border-[#FFFFFF] rounded-full overflow-hidden p-2 gap-2">
                <Button
                  onClick={() => setActiveTab("tutor")}
                  className={`w-[48px] h-[24px] px-4 py-1 ${
                    activeTab === "tutor"
                      ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                      : "bg-transparent hover:bg-transparent text-gray-700"
                  }`}
                >
                  Tutor
                </Button>
                <Button
                  onClick={() => setActiveTab("Card")}
                  className={`w-[48px] h-[24px] px-4 py-1 ${
                    activeTab === "Card"
                      ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                      : "bg-transparent hover:bg-transparent text-gray-700"
                  }`}
                >
                  Card
                </Button>
              </div>
            </div>
          </div>

          {/* Metric Cards Section */}
          {activeTab === "Card" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ">
                <MetricCard
                  value="08"
                  label="Cards Created"
                  icon={
                    <div className="bg-[#A7EC1C1A] p-2 rounded-full  flex items-center justify-center">
                      <Copy className="text-[#A7EC1C] w-10 h-10" />
                    </div>
                  }
                />

                <MetricCard
                  value="160"
                  label="Total Cards Uses"
                  icon={
                    <div className="bg-[#A9EEFC66] p-2 rounded-full flex items-center justify-center">
                      <FileText className="text-[#24C6E7] w-10 h-10" />
                    </div>
                  }
                />
                <MetricCard
                  value="3/11"
                  label="Card Creation Rank"
                  icon={
                    <div className="bg-[#F573B44D] p-2 rounded-full  flex items-center justify-center">
                      <Users className="text-[#F573B4] w-10 h-10" />
                    </div>
                  }
                />
                <MetricCard
                  value="82%"
                  label="Daily Goal Achieved"
                  icon={
                    <div className="bg-[#6B91D933] p-2 rounded-full">
                      <Flame className="text-[#EFBE0F] w-10 h-10" />
                    </div>
                  }
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                value="08"
                label="Completion Path"
                icon={
                  <div className="bg-[#BB6BD933] p-2 rounded-full">
                    <Check className="text-[#BB6BD9] w-10 h-10" />
                  </div>
                }
              />

              <MetricCard
                value="160"
                label="Total Questions Answered"
                icon={
                  <div className="bg-[#E8681833] p-2 rounded-full flex items-center justify-center">
                    <CircleHelp className="text-[#BB6BD9] w-10 h-10" />
                  </div>
                }
              />
              {roleAccess !== "user" ? (
                <MetricCard
                  value="3/11"
                  label="Team Rank"
                  icon={
                    <div className="bg-[#71D96B33] p-2 rounded-full">
                      <Trophy className="text-[#71D96B] w-10 h-10" />
                    </div>
                  }
                />
              ) : (
                <MetricCard
                  value="#14"
                  label="Leaderboard"
                  icon={
                    <div className="bg-[#71D96B33] p-2 rounded-full">
                      <Trophy className="text-[#71D96B] w-10 h-10" />
                    </div>
                  }
                />
              )}
              <MetricCard
                value="82%"
                label="Daily Goal Achieved"
                icon={
                  <div className="bg-[#6B91D933] p-2 rounded-full">
                    <Flame className="text-[#EFBE0F] w-10 h-10" />
                  </div>
                }
              />
            </div>
          )}
        </div>

        {activeTab === "" && (
          <div>
            {/* Tutor Score Section */}
            <div className=" flex flex-col md:grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#191919] rounded-[30px] p-4">
                <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0] mb-2 text-center">
                  Average Tutor Score
                </h3>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="mb-4 w-40 h-40">
                    <Headset className=" w-40 h-40" />
                  </div>
                  <div className="font-urbanist font-normal text-[16px] leading-[100%] tracking-[0] text-center mb-4">
                    Overall Tutor Score
                  </div>
                  <div className="flex flex-row gap-2 w-full">
                    {/* Progress Bar with accessibility attributes */}
                    <div
                      className="w-full flex  text-center rounded border overflow-hidden flex-row "
                      role="progressbar"
                      aria-valuenow={88}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="bg-[#F9DB6F] text-black py-1 font-urbanist font-medium text-[20px] leading-[100%] tracking-[0] transition-all duration-300"
                        style={{width: "88%"}}
                      >
                        88%
                      </div>
                      <div
                        className="  overflow-hidden bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: "url('/Frame.png')",
                          backgroundColor: "#f0f0f0",
                          width: "20%",
                        }}
                        role="img"
                        aria-label="Preview thumbnail"
                      >
                        <div className="sr-only">Content preview</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#191919] rounded-[30px] p-4 col-span-3">
                <div className="flex justify-between mb-4">
                  <h3 className="text-sm font-medium">Tutor Analytics</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Button className="w-[52px] h-[50px] bg-[#F9DB6F] hover:bg-[#F9DB6F] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                      <FileText size={16} />
                    </Button>
                    <Select value={interval} onValueChange={setInterval}>
                      <SelectTrigger
                        className="bg-black hover:bg-black rounded-[80px] w-[114px] text-white p-2 flex items-center gap-1 border-0"
                        style={{height: "40px"}}
                      >
                        <SelectValue placeholder="Monthly" />
                      </SelectTrigger>
                      <SelectContent className="bg-black text-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="relative w-full h-64">
                  <Image
                    src="/Frame 5.png"
                    alt="Chart Background"
                    fill
                    style={{objectFit: "cover"}}
                    className="rounded-lg"
                    quality={100}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Tutors Table */}

            <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
              <div className="flex justify-between mb-4 flex-wrap items-center">
                <h3 className="font-urbanist  text-[24px] leading-[21.9px] tracking-[0] font-medium">
                  Tutors
                </h3>
                <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                  <FileText size={16} />
                </Button>
              </div>

              {/* Table with Horizontal Scrolling */}
              <div className="mt-4 overflow-x-auto">
                <Table
                  columns={tutorColumns.slice(0, -1)} // Exclude action column if handled separately
                  data={tutorsList}
                  renderCell={renderTutorCell}
                  renderActions={(row) => renderRowActionsTutor(row)}
                  tableClassName="w-full text-sm"
                  headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                  bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
                  cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                />
              </div>

              {/* Pagination */}
            </div>

            {/* Learning Paths */}
            <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
              <div className="flex justify-between mb-4 items-center">
                <h3 className="font-urbanist font-medium text-[24px] leading-[21.9px] tracking-[0]">
                  Assign New Learning Path
                </h3>
                <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                  <FileText size={16} />
                </Button>
              </div>
              <Table
                columns={pathColumns.slice(0, -1)}
                data={learningPaths}
                renderCell={renderPathCell}
                renderActions={(row) =>
                  renderRowActionsPath(row as LearningPath)
                }
                tableClassName="w-full text-sm"
                headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
                cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
              />
            </div>

            {/* Daily Completion Section */}
            <div className="flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-ful">
                {/* Left Section: Daily Completion */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#191919] rounded-[30px] p-4 space-y-3">
                  <div className="flex justify-between mb-4 flex-wrap">
                    <h3 className="text-sm font-medium">Daily Completion</h3>
                    <div className="flex gap-2">
                      <Button className="bg-[#F9DB6F] text-black text-xs px-2 py-1 rounded flex items-center gap-1">
                        Organization
                        <ChevronDown size={14} />
                      </Button>
                      <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px]">
                        <FileText size={16} />
                      </Button>
                      <Button className="bg-[#F9DB6F] w-[52px] h-[50px] text-black px-4 py-1 rounded">
                        <Filter size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
                        margin={{top: 10, right: 10, left: 0, bottom: 5}}
                      >
                        <defs>
                          <linearGradient
                            id="colorValue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#F59E0B"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="100%"
                              stopColor="#F59E0B"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} stroke="#333" />

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{fill: "#9CA3AF", fontSize: 10}}
                        />
                        <YAxis
                          domain={[0, 6]}
                          ticks={[0, 2, 4, 6]}
                          axisLine={false}
                          tickLine={false}
                          tick={{fill: "#9CA3AF", fontSize: 10}}
                        />

                        {/* ✅ Area Fill */}
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="transparent"
                          fill="url(#colorValue)"
                        />

                        {/* ✅ Line */}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{stroke: "#F59E0B", fill: "#F59E0B", r: 4}}
                          activeDot={{
                            r: 6,
                            fill: "#FFF",
                            stroke: "#F59E0B",
                            strokeWidth: 2,
                          }}
                        />

                        {/* ✅ Tooltip */}
                        <Tooltip
                          content={({active, payload}) =>
                            active && payload?.length ? (
                              <div className="bg-gray-800 p-2 rounded text-xs border border-gray-700 shadow-lg">
                                <p className="text-[#F9DB6F] font-medium">
                                  {payload[0].payload.name}: {payload[0].value}
                                </p>
                              </div>
                            ) : null
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Section: Top Performing Learning Paths */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
                  <div className="bg-[#191919] p-4 rounded-[12px] text-white flex flex-col justify-between shadow-md">
                    <div className="flex justify-between items-center ">
                      <h4 className="font-urbanist font-bold text-[16px] leading-[140%] tracking-[0.01em] text-white">
                        Top Performing Learning Path
                      </h4>
                      <button className="text-xs text-[#F9DB6F] hover:underline">
                        View Stats
                      </button>
                    </div>
                    <div>
                      <h5 className="text-[#F9DB6F] font-urbanist font-normal text-[20px] leading-[120%] tracking-[0]">
                        Warrant Policy
                      </h5>
                      <div className="text-[#F9DB6F] font-urbanist font-bold text-[48px] leading-[140%] tracking-[1%] flex flex-row justify-between">
                        92%
                        <div className="flex">
                          <div className="bg-white rounded-full p-2 w-[80px] h-[80px] flex items-center justify-center">
                            <Trophy size={40} className="text-[#F9DB6F]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#191919] p-4 rounded-[12px] text-white flex flex-col justify-between shadow-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-urbanist font-bold text-[16px] leading-[140%] tracking-[0.01em]  text-white">
                        Top Performing Learning Path
                      </h4>
                      <button className="text-xs text-[#F9DB6F] hover:underline">
                        View Stats
                      </button>
                    </div>
                    <div>
                      <h5 className="text-[#F9DB6F] font-urbanist font-normal text-[20px] leading-[120%] tracking-[0]">
                        Refund Policy
                      </h5>
                      <div className="text-[#F9DB6F] font-urbanist font-bold text-[48px] leading-[140%] tracking-[1%] flex flex-row justify-between">
                        52%
                        <div className="flex">
                          <div className="bg-white rounded-full p-2 w-[80px] h-[80px] flex items-center justify-center">
                            <TriangleAlert size={40} className="text-red-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tutor" && <TutorAnalytics />}
        {activeTab === "Card" && <Card />}
      </div>
    </div>
  );
}

// Custom icons
//@ts-expect-error: Metric card
function MetricCard({value, label, icon, className = ""}) {
  return (
    <div className={`bg-[#191919] rounded-[20px] p-4 text-white ${className}`}>
      <div className="flex items-center gap-8 py-4">
        <div className="text-yellow-400">{icon}</div>
        <div className="text-left">
          <span className="font-urbanist font-medium text-[34px] leading-[40px] tracking-[0] align-bottom">
            {value}
          </span>
          <p className="font-urbanist font-medium text-[20px] leading-[24px] tracking-[0] align-bottom text-white mt-1">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
