"use client";

import {useEffect, useState, useCallback} from "react";
import {FilterIcon as Funnel, MoreHorizontal} from "lucide-react";
import Table from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchInput from "../shared/search-input";
import {Upload, Pencil, Trash2} from "lucide-react";
import {useRouter} from "next/navigation";
import ArrowBack from "../shared/ArrowBack";
import {useUser} from "@clerk/nextjs";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {apiUrl} from "@/utils/constant";
import {Icon} from "@iconify/react";
import {LearningPath} from "@/types/types";
import {useUserHook} from "@/hooks/useUser";
import DeleteConfirmationModal from "./delete-modal";
import {ShowToast} from "../shared/show-toast";
// Define interfaces based on the API response structure

interface ApiResponse {
  success: boolean;
  cards: LearningPath[];
}

// Interface for the table data structure
interface DraftTableData {
  id: string;
  courseName: string;
  verificationPeriod: string;
  totalQuestions: string;
  originalData: LearningPath; // Store the original data for reference
}

export default function Drafts() {
  const router = useRouter();
  const [filterdata, setFilterData] = useState("");
  const [data, setData] = useState<DraftTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const {userData} = useUserHook();
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLearningPaths = useCallback(async (orgId: string) => {
    try {
      const response = await fetch(
        `${apiUrl}/learning-paths/organizations/${orgId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiData: ApiResponse = await response.json();

      if (apiData.success && apiData.cards) {
        // Filter learning paths with status "draft" and transform the data
        const draftPaths = apiData.cards
          .filter((card) => card.status.toLowerCase() === "draft")
          .map((card) => ({
            id: card.id,
            courseName: card.title,
            verificationPeriod: new Date(
              card.verification_period
            ).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "2-digit",
            }),
            totalQuestions: card.num_of_questions.toString(),
            originalData: card,
          }));

        return draftPaths;
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Error fetching learning paths:", err);
      throw err;
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    if (!userData || !userData.id || !userData.org_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch learning paths
      const draftPaths = await fetchLearningPaths(userData.org_id);
      setData(draftPaths);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [userData, fetchLearningPaths]);

  useEffect(() => {
    if (userData) {
      fetchData();
    }
  }, [userData, fetchData]);

  // Function to handle publishing a learning path
  const handlePublish = async (row: DraftTableData) => {
    try {
      // setIsProcessing(true);
      // console.log(`Publishing: ${row.courseName}`, row.originalData);
      // // Here you would call your API to update the status to "published"
      // // For example:
      // // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-paths/${row.id}`, {
      // //   method: 'PUT',
      // //   headers: { 'Content-Type': 'application/json' },
      // //   credentials: 'include',
      // //   body: JSON.stringify({ status: 'published' }),
      // // });
      // // Remove the published item from the drafts list
      // setData(data.filter((item) => item.id !== row.id));
      // toast.success("Learning path published successfully");
    } catch (err) {
      console.error("Error publishing learning path:", err);
      toast.error("Failed to publish learning path");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle editing a learning path
  const handleEdit = (row: DraftTableData) => {
    console.log(`Editing: ${row.courseName}`, row.originalData);
    // Add your edit logic here
    // router.push(`/edit-learning-path/${row.id}`);
  };

  // Function to handle deleting a learning path
  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  // Function to handle confirming deletion
  const confirmDelete = async (id: string) => {
    try {
      console.log(id, "string");
      setIsDeleting(true);

      if (itemToDelete !== null) {
        const itemToDeleteData = data.find((item) => item.id === itemToDelete);
        if (itemToDeleteData) {
          const newData = data.filter((item) => item.id !== itemToDelete);
          setData(newData);
        }

        const response = await fetch(`${apiUrl}/learning-paths/${id}`, {
          method: "delete",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
        });
        ShowToast(`Successfully deleted!`);
        fetchData();

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

  // Filter data based on search input
  const filteredData = data.filter((row) =>
    row.courseName.toLowerCase().includes(filterdata.toLowerCase())
  );

  // Render skeleton loading UI
  if (loading) {
    return (
      <div className="text-white py-4">
        <div className="">
          <div className="flex mb-6 md:mb-8 justify-between">
            <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
              <ArrowBack link="/tutor" />
              <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
                Learning Path Drafts
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchInput onChange={(value) => setFilterData(value)} />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md cursor-pointer"
              >
                <Funnel className="h-[24px] w-[24px]" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({length: 5}).map((_, i) => {
              const widthPercent = Math.floor(70 + Math.random() * 30); // between 70% and 100%
              return (
                <Skeleton
                  key={i}
                  className="h-[28px]"
                  style={{width: `${widthPercent}%`}}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md p-6 bg-[#2a2a2a] rounded-lg">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Error Loading Data
          </h2>
          <p>{error}</p>
          <Button
            className="mt-4 bg-[#f0d568] hover:bg-[#e0c558] text-black"
            onClick={() => fetchData()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Custom render function for the actions column
  const renderActions = (row: DraftTableData) => (
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
          onClick={() => handlePublish(row)}
          className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
          disabled={isProcessing}
        >
          {/* <Upload size={16} className="text-white group-hover:text-[#F9DB6F]" /> */}
          <Icon
            icon="material-symbols:publish-rounded"
            width="24"
            height="24"
          />
          <span className="group-hover:text-[#F9DB6F]">Publish</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleEdit(row)}
          className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
          disabled={isProcessing}
        >
          {/* <Pencil size={16} className="text-white group-hover:text-[#F9DB6F]" /> */}
          <Icon icon="iconamoon:edit-light" width="24" height="24" />
          <span className="group-hover:text-[#F9DB6F]">Edit</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => openDeleteModal(row.id)}
          className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
          disabled={isProcessing}
        >
          <Trash2 size={16} className="text-white group-hover:text-[#F9DB6F]" />
          <span className="text-white group-hover:text-[#F9DB6F]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="text-white py-4">
      <div className="">
        {/* Header */}
        <div className="flex mb-6 md:mb-8 justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
            <ArrowBack link="/knowledge-base" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              Learning Path Drafts
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchInput onChange={(value) => setFilterData(value)} />
            </div>
            {filterdata && (
              <div className="ml-2 text-sm text-gray-400">
                {filteredData.length} results found
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md cursor-pointer"
            >
              <Funnel className="h-[24px] w-[24px]" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No draft learning paths found</p>
            </div>
          ) : (
            <Table
              columns={[
                {Header: "Course Name", accessor: "courseName"},
                {Header: "Verification Period", accessor: "verificationPeriod"},
                {
                  Header: "Total Questions Per Card",
                  accessor: "totalQuestions",
                },
              ]}
              data={filteredData}
              filterValue={filterdata}
              renderActions={renderActions}
              tableClassName="w-full border-collapse"
              headerClassName="bg-[#f0d568] text-black justify-between text-left text-sm font-medium px-4 py-3 border-b border-gray-800"
              cellClassName="px-4 py-3 border-t border-[#E0EAF5] text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] h-[68px]"
              bodyClassName="divide-y divide-gray-800 justify-between text-sm font-normal"
              renderCell={(column, row) => {
                // Handle each column explicitly to avoid returning complex objects
                const value = row[column as keyof DraftTableData];

                // Only return primitive values
                if (
                  column === "courseName" ||
                  column === "verificationPeriod" ||
                  column === "totalQuestions"
                ) {
                  return String(value);
                }

                // For any other columns or complex objects, return a fallback
                return "—";
              }}
            />
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        id={itemToDelete}
        title="Learning Path"
        isLoading={isDeleting}
      />
    </div>
  );
}
