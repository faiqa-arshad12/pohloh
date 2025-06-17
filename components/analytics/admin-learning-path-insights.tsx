import {useEffect, useState} from "react";
import {MoreHorizontal, Trash2, GraduationCap, Ellipsis} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import Image from "next/image";
import Table from "../ui/table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Icon} from "@iconify/react/dist/iconify.js";
import {apiUrl} from "@/utils/constant";
import {Avatar} from "../shared/avatar";
import TableLoader from "../shared/table-loader";
import {NoData} from "../shared/NoData";

interface LearningPathInsight {
  id: string;
  name: string;
  learning_path_name: string;
  learning_path_id: string;
  overall_completion: string;
  questions_completed: number;
  total_questions: number;
  completed_at: string;
  updated_at: string;
  profile_picture: string;
}

interface ApiResponse {
  success: boolean;
  paths: LearningPathInsight[];
}

interface AdminLearnignPathProps {
  orgId: string | null;
}

const AdminLearnignPath = ({orgId}: AdminLearnignPathProps) => {
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPathInsight[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLearningPaths();
  }, [orgId]);

  const fetchLearningPaths = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${apiUrl}/users/learning-paths-insights/${orgId || ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch learning paths");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setFilteredLearningPaths(data.paths);
      }
    } catch (error) {
      console.error("Error fetching learning paths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePath = (id: string) => {
    alert("deleted" + id);
  };

  // Custom cell renderer for learning paths
  const renderPathCell = (column: string, row: LearningPathInsight) => {
    switch (column) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <Avatar
              name={row.name || ""}
              profilePicture={row.profile_picture}
            />
          </div>
        );
      case "learning_path_name":
        return row.learning_path_name;
      case "overall_completion":
        return row.overall_completion;
      // case "questions_completed":
      //   return `${row.questions_completed}/${row.total_questions}`;
      case "completed_at":
        return new Date(row.completed_at).toLocaleDateString();
      case "action":
        return renderRowActionsPath(row);
      default:
        return row[column as keyof LearningPathInsight];
    }
  };

  // Custom cell renderer for tutors
  const renderRowActionsPath = (row: LearningPathInsight) => {
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
              <span>Reassign Learning Path</span>
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

  const columns = [
    {Header: "Name", accessor: "name"},
    {Header: "Learning Path", accessor: "learning_path_name"},
    {Header: "Overall Score", accessor: "overall_completion"},
    // {Header: "Questions", accessor: "questions_completed"},
    {Header: "Completed At", accessor: "completed_at"},
    {Header: "Actions", accessor: "action"},
  ];

  return (
    <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
      <div className="flex justify-between mb-4 items-center">
        <h3 className="font-urbanist font-medium text-[24px] leading-[21.9px] tracking-[0]">
          Learning Path Insights
        </h3>
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
      <div className="mt-4 overflow-x-auto">
        {isLoading ? (
          <TableLoader />
        ) : filteredLearningPaths.length === 0 ? (
          <NoData />
        ) : (
          <Table
            columns={columns}
            data={filteredLearningPaths}
            renderCell={renderPathCell}
            tableClassName="w-full text-sm"
            headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
            bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
            cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
            defaultItemsPerPage={4}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLearnignPath;
