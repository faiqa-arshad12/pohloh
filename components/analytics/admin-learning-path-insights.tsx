"use client";

import {useEffect, useState, useCallback} from "react";
import {Trash2, GraduationCap, Ellipsis} from "lucide-react";
import {Button} from "../ui/button";
import Table from "../ui/table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Icon} from "@iconify/react/dist/iconify.js";
import {apiUrl} from "@/utils/constant";
import {exportToPDF} from "@/utils/exportToPDF";
import {Avatar} from "../shared/avatar";
import {useUserHook} from "@/hooks/useUser";
import {useRole} from "../ui/Context/UserContext";
import TableLoader from "../shared/table-loader";
import {NoData} from "../shared/NoData";
import Loader from "../shared/loader";
import {reAssignUserLearningPath} from "./analytic.service";
import {ShowToast} from "../shared/show-toast";
import DeleteConfirmationModal from "../tutor/delete-modal";

interface LearningPathInsight {
  id: string;
  name: string;
  learning_path_name: string;
  learning_path_id: string;
  category: string;
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
  const {userData} = useUserHook();
  const {roleAccess} = useRole();
  const [filteredLearningPaths, setFilteredLearningPaths] = useState<
    LearningPathInsight[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [reassigningPathId, setReassigningPathId] = useState<string | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLearningPaths();
  }, [orgId, userData, roleAccess]);

  const fetchLearningPaths = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${apiUrl}/users/learning-paths-insights/${userData?.id || ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch learning paths");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        let filteredPaths = data.paths;

        // Apply role-based filtering
        if (roleAccess === "admin" && userData?.team_id) {
          // Admin can only see learning paths where category matches their team_id
          filteredPaths = data.paths.filter(
            (path) => path.category === userData.team_id
          );
        }
        // If roleAccess === "owner", show all learning paths (no additional filtering needed)

        setFilteredLearningPaths(filteredPaths);
      }
    } catch (error) {
      console.error("Error fetching learning paths:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const reAssignLearningPath = async (id: string) => {
    setReassigningPathId(id);
    try {
      const data = {
        completed: false,
        session_summary: null,
        strengths: null,
        opportunities: null,
        score: null,
        questions_answered: [],
        question_completed: 0,
      };
      await reAssignUserLearningPath(id, data);
      ShowToast("Learning path has been reassigned successfully", "success");
      fetchLearningPaths();
    } catch (error) {
      console.error("Error reassigning learning path:", error);
      ShowToast("Failed to reassign learning path", "error");
    } finally {
      setReassigningPathId(null);
    }
  };

  const exportLearningPathsToPDF = useCallback(() => {
    if (filteredLearningPaths.length === 0 || isExportingPDF) return;
    setIsExportingPDF(true);

    try {
      const dataForPdf = filteredLearningPaths.map((path) => ({
        name: path.name,
        learning_path_name: path.learning_path_name,
        overall_completion: path.overall_completion,
        completed_at: new Date(path.completed_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));

      exportToPDF({
        title: "Learning Path Insights",
        filename: "learning-path-insights",
        data: dataForPdf,
        type: "table",
        columns: [
          "name",
          "learning_path_name",
          "overall_completion",
          "completed_at",
        ],
        headers: {
          name: "Name",
          learning_path_name: "Learning Path",
          overall_completion: "Overall Score",
          completed_at: "Completed At",
        },
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  }, [filteredLearningPaths, isExportingPDF]);

  const exportSingleLearningPathToPDF = useCallback(
    (path: LearningPathInsight) => {
      if (isExportingPDF) return;
      setIsExportingPDF(true);

      try {
        const filteredPathData = {
          name: path.name,
          learning_path_name: path.learning_path_name,
          overall_completion: path.overall_completion,
          questions_completed: `${path.questions_completed}/${path.total_questions}`,
          completed_at: new Date(path.completed_at).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          ),
        };

        exportToPDF({
          title: "Learning Path Details",
          filename: `learning-path-${path.learning_path_name
            .replace(/\s+/g, "-")
            .toLowerCase()}`,
          data: filteredPathData,
          type: "details",
          headers: {
            name: "Name",
            learning_path_name: "Learning Path",
            overall_completion: "Overall Score",
            questions_completed: "Questions",
            completed_at: "Completed At",
          },
        });
      } catch (error) {
        console.error("Error exporting PDF:", error);
        alert("Failed to export PDF.");
      } finally {
        setIsExportingPDF(false);
      }
    },
    [isExportingPDF]
  );

  const handleDeletePath = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

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
      case "completed_at":
        return new Date(row.completed_at).toLocaleDateString();
      case "action":
        return renderRowActionsPath(row);
      default:
        return row[column as keyof LearningPathInsight];
    }
  };

  const confirmDelete = async (pathId: string) => {
    try {
      setIsDeleting(true);

      if (itemToDelete !== null) {
        const response = await fetch(
          `${apiUrl}/learning-paths/user-path/${pathId}`,
          {
            method: "delete",
            headers: {"Content-Type": "application/json"},
          }
        );
        ShowToast(`Successfully deleted!`);
        fetchLearningPaths();

        if (!response.ok) throw new Error("Failed to delete learning path");
      }
    } catch (err) {
      console.error(`Error deleting learningpath :`, err);
      ShowToast(`Error occured while deleting learning path: ${err}`, "error");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };
  const renderRowActionsPath = (row: LearningPathInsight) => {
    const isReassigning = reassigningPathId === row.learning_path_id;
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
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              disabled={isReassigning}
              onClick={() => {
                if (!isReassigning) {
                  reAssignLearningPath(row.id);
                }
              }}
            >
              {isReassigning ? (
                <Loader />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              <span>
                {isReassigning ? "Reassigning..." : "Reassign Learning Path"}
              </span>
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
    {Header: "Completed At", accessor: "completed_at"},
    {Header: "Actions", accessor: "action"},
  ];

  return (
    <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
      <div className="flex justify-between mb-4 items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-urbanist font-medium text-[24px] leading-[21.9px] tracking-[0]">
            Learning Path Insights
          </h3>
        </div>
        <Button
          onClick={exportLearningPathsToPDF}
          disabled={
            isLoading || filteredLearningPaths.length === 0 || isExportingPDF
          }
          className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer"
        >
          {isExportingPDF ? (
            <Loader />
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
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        id={itemToDelete}
        title="Tutor Learning Path"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminLearnignPath;
