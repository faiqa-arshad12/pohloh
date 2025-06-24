"use client";

import {useEffect, useState, useCallback, useMemo} from "react";
import {MoreHorizontal, Trash2} from "lucide-react";
import Table from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchInput from "../shared/search-input";
import {useRouter} from "next/navigation";
import ArrowBack from "../shared/ArrowBack";
import {toast} from "sonner";
import {Icon} from "@iconify/react";
import {useUserHook} from "@/hooks/useUser";
import {
  TimeFilter,
  TimePeriod,
  filterByTimePeriod,
} from "@/components/shared/TimeFilter";
import TableLoader from "../shared/table-loader";
import DeleteConfirmationModal from "../tutor/delete-modal";
import {getUserCompletedCards} from "./analytic.service";

// Table data structure for completed paths
interface CompletedPathTableData {
  id: string;
  courseName: string;
  overallScore: string;
  completedDate: string;
  category: string;
  originalData: any;
  created_at: string;
}

export default function CompletedLearningPathsList({
  userId,
}: {
  userId?: string | null;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<CompletedPathTableData[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.ALL);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {userData} = useUserHook();

  // Fetch completed learning paths
  const fetchData = useCallback(async () => {
    if (!userData?.id || !userData?.org_id) return;

    try {
      setLoading(true);

      const response = await getUserCompletedCards(
        userId || userData.id,
        userData.org_id
      );

      const completedPaths =
        response?.success && response?.path
          ? response.path.map((card: any) => ({
              id: card.id,
              courseName: card.learning_path_id?.title || "Untitled",
              overallScore: card.score ? `${card.score}%` : "0%",
              completedDate: card.updated_at
                ? new Date(card.updated_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "",
              category: card.learning_path_id?.category?.name || "",
              originalData: card,
              created_at: card.updated_at,
            }))
          : [];

      setData(completedPaths);
    } catch (err) {
      console.error("Error fetching data:", err);

      toast.error("Failed to load completed learning paths");
    } finally {
      setLoading(false);
    }
  }, [userData?.id, userData?.org_id, userId]);

  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [userData, fetchData]);

  // Enhanced filtering with search by title, category, and date
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply time period filter first
    filtered = filterByTimePeriod(filtered, timePeriod);

    // Apply enhanced search filter (title, category, date)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((row) => {
        const searchableFields = [
          row.courseName.toLowerCase(),
          row.category.toLowerCase(),
          row.completedDate.toLowerCase(),
          // Also search by score if needed
          row.overallScore.toLowerCase(),
        ];

        return searchableFields.some((field) => field.includes(query));
      });
    }

    return filtered;
  }, [data, searchQuery, timePeriod]);

  const handleTimePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setTimePeriod(TimePeriod.ALL);
  }, []);

  const openDeleteModal = useCallback((id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      // Add your delete API call here
      // await deleteCompletedPath(itemToDelete);

      // Remove from local state
      setData((prev) => prev.filter((item) => item.id !== itemToDelete));
      toast.success("Learning path deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting learning path:", err);
      toast.error("Failed to delete learning path");
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete]);

  const handleEdit = useCallback(
    (row: CompletedPathTableData) => {
      // Add your edit logic here
      router.push(`/edit-learning-path/${row.id}`);
    },
    [router]
  );

  // Memoized actions renderer
  const renderActions = useCallback(
    (row: CompletedPathTableData) => {
      const isAdmin = userData?.role === "owner";
      const isPathOwner = row.originalData.user_id === userData?.id;
      const hasAccess = isAdmin || isPathOwner;

      if (!hasAccess) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-transparent hover:text-white cursor-pointer"
              disabled={isProcessing}
            >
              <MoreHorizontal className="h-5 w-5 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border border-gray-700 text-white w-[154px]">
            <DropdownMenuItem
              onClick={() => handleEdit(row)}
              className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
              disabled={isProcessing}
            >
              <Icon icon="iconamoon:edit-light" width="24" height="24" />
              <span className="group-hover:text-[#F9DB6F]">
                Reassign Learning Path
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => openDeleteModal(row.id)}
              className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
              disabled={isProcessing}
            >
              <Trash2
                size={16}
                className="text-white group-hover:text-[#F9DB6F]"
              />
              <span className="text-white group-hover:text-[#F9DB6F]">
                Delete
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [userData?.role, userData?.id, isProcessing, handleEdit, openDeleteModal]
  );

  // Memoized cell renderer
  const renderCell = useCallback(
    (column: string, row: CompletedPathTableData) => {
      const validColumns = [
        "courseName",
        "overallScore",
        "completedDate",
        "category",
      ];
      if (validColumns.includes(column)) {
        return String(row[column as keyof CompletedPathTableData]);
      }
      return "—";
    },
    []
  );

  if (loading) {
    return (
      <div className="text-white py-4">
        <div className="flex mb-6 md:mb-8 justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7">
            <ArrowBack link={`/analytics?id=${userId}`} />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              Completed Learning Paths
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput onChange={setSearchQuery} />
            <TimeFilter
              timePeriod={timePeriod}
              onTimePeriodChange={handleTimePeriodChange}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
        <TableLoader />
      </div>
    );
  }

  return (
    <div className="text-white py-4">
      <div className="flex mb-6 md:mb-8 justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-7">
          <ArrowBack link={`/analytics?id=${userId}`} />

          <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
            Completed Learning Paths
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            onChange={setSearchQuery}
            placeholder="Search by title, category, or date..."
          />
          <TimeFilter
            timePeriod={timePeriod}
            onTimePeriodChange={handleTimePeriodChange}
            onClearFilters={clearFilters}
          />
        </div>
      </div>

      <div className="overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">
              {searchQuery || timePeriod !== TimePeriod.ALL
                ? "No learning paths match your search criteria"
                : "No completed learning paths found"}
            </p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                {Header: "Learning Paths", accessor: "courseName"},
                {Header: "Overall Score", accessor: "overallScore"},
                {Header: "Completed", accessor: "completedDate"},
                {Header: "Category", accessor: "category"},
              ]}
              data={filteredData}
              filterValue={searchQuery}
              renderActions={renderActions}
              tableClassName="w-full border-collapse"
              headerClassName="bg-[#f0d568] text-black justify-between text-left text-sm font-medium px-4 py-3 border-b border-gray-800"
              cellClassName="px-4 py-3 border-t border-[#E0EAF5] text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] h-[68px]"
              bodyClassName="divide-y divide-gray-800 justify-between text-sm font-normal"
              renderCell={renderCell}
            />
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        id={itemToDelete}
        title="Learning Path"
        isLoading={isDeleting}
      />
    </div>
  );
}
