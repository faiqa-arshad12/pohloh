import React from "react";
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
import {Button} from "../ui/button";
import Table from "../ui/table";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Tutor, tutorColumns, tutorsList} from "@/utils/analytic-data";
import {Icon} from "@iconify/react/dist/iconify.js";
import {useRouter} from "next/navigation";

interface TutorListProps {
  departmentId: string | null;
}

const TutorList = ({departmentId}: TutorListProps) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>(tutorsList);

  const router = useRouter();

  useEffect(() => {
    if (departmentId === null) {
      setFilteredTutors(tutorsList);
    } else {
      const filtered = tutorsList.filter(
        (tutor) => tutor.departmentId === departmentId
      );
      setFilteredTutors(filtered);
    }
  }, [departmentId]);

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
  const handleDelete = (id: number) => {
    alert("deleted" + id);
  };

  const handleViewTutorScore = () => {
    router.push("/analytics?id=1");
  };
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
  return (
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
          data={filteredTutors}
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
  );
};

export default TutorList;
