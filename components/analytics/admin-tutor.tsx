import {useEffect, useState} from "react";

import {
  MoreHorizontal,
  ChevronDown,
  Filter,
  Trash2,
  Flame,
  Trophy,
  Eye,
  GraduationCap,
  Ellipsis,
  Router,
} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {useRole} from "../ui/Context/UserContext";
import Graph from "./graph";
import {
  LearningPath,
  learningPaths,
  pathColumns,
  Tutor,
  tutorColumns,
  tutorsList,
} from "@/utils/analytic-data";
import TutorScoreCard from "./tutor-card";
import {Icon} from "@iconify/react/dist/iconify.js";
import MetricCard from "../matric-card";
import TopPerformance from "./top-performance";
import {USER_ROLES} from "@/utils/constant";
import {useRouter} from "next/navigation";

const AdminAanalytic = () => {
  const {roleAccess} = useRole();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("tutor");
  const [interval, setInterval] = useState("monthly");
  const router = useRouter();

  useEffect(() => {
    // console.log("User role detected", roleAccess);
    // if (roleAccess === "user") {
    //   setActiveTab("tutor");
    // } else {
    //   setActiveTab("");
    // }
    setActiveTab("tutor");
  }, [roleAccess]);

  const handleDelete = (id: number) => {
    alert("deleted" + id);
  };

  const handleDeletePath = (id: number) => {
    alert("deleted" + id);
  };
  const handleViewTutorScore = () => {
    alert("wwhh");
    router.push("/analytics?id=asfsfg");
  };
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
              <Icon icon="proicons:pdf" width="24" height="24" />
              <span>Export as PDF</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              onClick={() => {
                handleViewTutorScore();
              }}
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Icon icon="iconamoon:edit-light" width="24" height="24" />

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
              <span>Ressign Learning Path</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <Icon icon="iconamoon:edit-light" width="24" height="24" />

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
                className="bg-[#F9DB6F66] text-[15.93px] px-3 rounded-full h-[38px] items-center text-center flex"
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
                className="bg-[#F9DB6F66] text-[15.93px] px-3 rounded-full h-[38px] items-center text-center flex"
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
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value="08"
          label="Completion Path"
          icon={
            <div className="">
              <img src="/check-icon.png" alt="check" />
            </div>
          }
        />

        <MetricCard
          value="160"
          label="Total Questions Answered"
          icon={
            <div className="">
              <img src="/total_question.png" alt="questions" />
            </div>
          }
        />
        {roleAccess !== "user" ? (
          <MetricCard
            value="3/11"
            label="Team Rank"
            icon={
              <div className="">
                <img src="/rank.png" alt="rank" />
              </div>
            }
          />
        ) : (
          <MetricCard
            value="#14"
            label="Leaderboard"
            icon={
              <div className="">
                <img src="/goal.png" alt="goal" />
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
      {/* Tutor Score Section */}
      <div className=" flex flex-col md:grid md:grid-cols-4 gap-4 mb-8">
        <TutorScoreCard />

        <div className="bg-[#191919] rounded-[30px] p-4 col-span-3">
          <div className="flex justify-between mb-4">
            <h3 className="text-[24px] font-medium py-4">Tutor Analytics</h3>
            <div className="flex items-center gap-2 mb-2">
              <Button className="w-[52px] h-[50px] bg-[#F9DB6F] hover:bg-[#F9DB6F] rounded-lg border border-gray-700 px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer">
                <Icon
                  icon="bi:filetype-pdf"
                  width="24"
                  height="24"
                  color="black"
                  className="cursor-pointer"
                />
              </Button>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger
                  className="bg-black hover:bg-black rounded-[80px] w-[114px] text-white p-2 flex items-center gap-1 border-0"
                  style={{height: "40px"}}
                >
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white dark:bg-gray-800 rounded-lg">
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
          <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border  w-[52px] h-[50px] flex items-center justify-center gap-[10px] cursor-pointer">
            <Icon
              icon="bi:filetype-pdf"
              width="24"
              height="24"
              color="white"
              className="cursor-pointer"
            />
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
          <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border  px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer">
            <Icon
              icon="bi:filetype-pdf"
              width="24"
              height="24"
              color="white"
              className="cursor-pointer"
            />
          </Button>
        </div>
        <Table
          columns={pathColumns.slice(0, -1)}
          data={learningPaths}
          renderCell={renderPathCell}
          renderActions={(row) => renderRowActionsPath(row as LearningPath)}
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
              <h3 className="text-[24px] p-4 font-semibold">
                Daily Completion
              </h3>
              <div className="flex gap-2 items-center">
                <Button className="bg-[#F9DB6F] text-black text-[14px] font-semibold font-urbanist h-[36px] rounded flex items-center gap-1 cursor-pointer">
                  Organization
                  <ChevronDown size={14} />
                </Button>
                <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-[8px] border   flex items-center justify-center gap-[10px] cursor-pointer">
                  <Icon
                    icon="bi:filetype-pdf"
                    width="24"
                    height="24"
                    className="cursor-pointer"
                  />
                </Button>
                <Button className="bg-[#F9DB6F] w-[52px] h-[50px] text-black  rounded-[8px] cursor-pointer ">
                  <Filter size={16} className="cursor-pointer" />
                </Button>
              </div>
            </div>

            <Graph />
          </div>

          {/* Right Section: Top Performing Learning Paths */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
            <TopPerformance
              title="Top Performing Learning Path"
              subtitle="Warrant Policy"
              percentage="92%"
              icon={Trophy}
            />
            <TopPerformance
              title="Worst Performing Learning Path"
              subtitle="Warrant Policy"
              percentage="50%"
              customIcon={
                <img src="/triangle-alert.png" alt="Alert" className="" />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAanalytic;
