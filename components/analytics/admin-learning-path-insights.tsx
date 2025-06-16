import {useEffect, useState} from "react";

import {MoreHorizontal, Trash2, GraduationCap, Ellipsis} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {LearningPath, learningPaths, pathColumns} from "@/utils/analytic-data";
import {Icon} from "@iconify/react/dist/iconify.js";

interface AdminLearnignPathProps {
  departmentId: string | null;
}

const AdminLearnignPath = ({departmentId}: AdminLearnignPathProps) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [filteredLearningPaths, setFilteredLearningPaths] =
    useState<LearningPath[]>(learningPaths);

  useEffect(() => {
    if (departmentId === null) {
      setFilteredLearningPaths(learningPaths);
    } else {
      const filtered = learningPaths.filter(
        (path) => path.departmentId === departmentId
      );
      setFilteredLearningPaths(filtered);
    }
  }, [departmentId]);

  const handleDeletePath = (id: number) => {
    alert("deleted" + id);
  };

  // Custom cell renderer for tutors
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
    <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
      <div className="flex justify-between mb-4 items-center">
        <h3 className="font-urbanist font-medium text-[24px] leading-[21.9px] tracking-[0]">
          Learning Path Insights
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
        data={filteredLearningPaths}
        renderCell={renderPathCell}
        renderActions={(row) => renderRowActionsPath(row as LearningPath)}
        tableClassName="w-full text-sm"
        headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
        bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
        cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
      />
    </div>
  );
};

export default AdminLearnignPath;
