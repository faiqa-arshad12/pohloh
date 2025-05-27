"use client";

import {useEffect, useState} from "react";
import {
  MoreVertical,
  Pencil,
  SlidersHorizontal,
  SquarePen,
  Trash2,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import SearchInput from "../shared/search-input";
import {useRouter} from "next/navigation";
import ArrowBack from "../shared/ArrowBack";
import Table from "@/components/ui/table";
import {Skeleton} from "../ui/skeleton";
import {apiUrl} from "@/utils/constant";
import {LearningPath, Question, User} from "@/types/types";
import {Icon} from "@iconify/react";
import {useUserHook} from "@/hooks/useUser";
import {ShowToast} from "../shared/show-toast";
import DeleteConfirmationModal from "./delete-modal";

interface ApiResponse {
  success: boolean;
  cards: LearningPath[];
}

interface EnrolledUser {
  id: string;
  user_id: User;
  question_completed: number;
  learning_path_id: {
    id: string;
    card: string;
    title: string;
    org_id: string;
    status: string;
    category: string;
    questions: Question[];
    created_at: string;
    path_owner: string;
    updated_at: string;
    question_type: string;
    num_of_questions: number;
    verification_period: string;
  };
  enrolled_at: string;
}

interface EnrolledUsersResponse {
  success: boolean;
  paths: EnrolledUser[];
}

// Interface for the table data structure
interface LearningPathTableData {
  id: string;
  courseName: string;
  verificationDate: string;
  owner: string;
  totalQuestions: string;
  enrolledUsers: User[];
  enrolled: boolean;
  originalData: LearningPath;
}

export default function ExploreLearningPath() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [filterdata, setFilterData] = useState("");
  const [data, setData] = useState<LearningPathTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setEnrolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const {userData} = useUserHook();
  // Fetch data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      // First, get the learning paths
      const response = await fetch(
        `${apiUrl}/learning-paths/organizations/${userData.org_id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const apiData: ApiResponse = await response.json();

      if (apiData.success && apiData.cards) {
        // Filter to only include published learning paths
        const publishedCards = apiData.cards.filter(
          (card) => card.status.toLowerCase() === "published"||"draft"||"generated"
        );

        // Create initial data with empty enrolled users
        const initialData: LearningPathTableData[] = publishedCards.map(
          (card) => ({
            id: card.id,
            courseName: card.title,
            verificationDate: new Date(
              card.verification_period
            ).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "2-digit",
            }),
            owner: card.path_owner.first_name + " " + card.path_owner.last_name,
            totalQuestions: card.num_of_questions.toString(),
            enrolledUsers: [],
            enrolled: false, // We'll update this when we fetch enrolled users
            originalData: card,
          })
        );

        setData(initialData);

        // Now fetch enrolled users for each learning path
        const enrollmentData = await Promise.all(
          initialData.map(async (path) => {
            try {
              const enrolledResponse = await fetch(
                `${apiUrl}/learning-paths/users/${path.id}`
              );

              if (!enrolledResponse.ok) {
                console.error(
                  `Failed to fetch enrolled users for path ${path.id}`
                );
                const {paths} = await enrolledResponse.json();
                // return paths;
                return {...path, enrolledUsers: []};
              }
              // const apiDat = console.log(apiDat, "eee");

              const enrolledData: EnrolledUsersResponse =
                await enrolledResponse.json();

              if (enrolledData.success && enrolledData.paths) {
                // Extract users from the response
                const users = enrolledData.paths.map((entry) => entry.user_id);
                // Check if current user is enrolled
                const isCurrentUserEnrolled = enrolledData.paths.some(
                  (entry) => {
                    return entry.user_id.id === userData.id;
                  }
                );
                // console.log(isCurrentUserEnrolled, "is",enrolledData);
                return {
                  ...path,
                  enrolledUsers: users,
                  enrolled: isCurrentUserEnrolled,
                };
              }

              return path;
            } catch (err) {
              console.error(
                `Error fetching enrolled users for path ${path.id}:`,
                err
              );
              return path;
            }
          })
        );

        setData(enrollmentData);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userData) fetchData();
  }, [userData]);

  // Function to handle enrolling in a learning path
  const handleEnroll = async (id: string) => {
    try {
      setEnrolling(true);
      const response = await fetch(`${apiUrl}/learning-paths/users`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        // credentials: "include",
        body: JSON.stringify({
          user_id: userData.id,
          learning_path_id: id,
        }),
      });
      ShowToast(`Successfully Enrolled!`);
      fetchData();

      if (!response.ok) throw new Error("Failed to enroll learning path");
    } catch (err) {
      console.error(`Error enrolling learningpath :`, err);
      ShowToast(`Error occured while enrolling learning path: ${err}`, "error");
    } finally {
      setEnrolling(false);
    }
  };

  // Function to handle publishing a learning path
  const handlePublish = (row: LearningPathTableData) => {
    console.log(`Publishing: ${row.courseName}`, row.originalData);
    // Add your publish logic here
  };

  // Function to handle editing a learning path
  const handleEdit = (row: LearningPathTableData) => {
    console.log(`Editing: ${row.courseName}`, row.originalData);
    // Add your edit logic here
  };

  const openDeleteModal = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  // Function to handle confirming deletion
  const confirmDelete = async (id: string) => {
    try {
      console.log(id,'string')
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
          // credentials: "include",
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
      setDeleteModalOpen(false)
    }
  };

  const filteredData = data.filter((row) =>
    row.courseName.toLowerCase().includes(filterdata.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-white py-4">
        <div className="">

          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
              <ArrowBack link="/tutor" />
              <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
                {"Explore Learning Paths"}
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
                className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md"
              >
                <SlidersHorizontal size={16} />
              </Button>
            </div>
          </div>
        </div>
        {/* Table skeleton */}
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
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Main content */}
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between my-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
            <ArrowBack link="/knowledge-base" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              {"Explore Learning Paths"}
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
              className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md w-[51px] h-[50px] cursor-pointer"
            >
              <SlidersHorizontal size={16} />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">No published learning paths found</p>
            </div>
          ) : (
            <Table
              columns={[
                {Header: "Course Name", accessor: "courseName"},
                {Header: "Verification Date", accessor: "verificationDate"},
                {Header: "Owner", accessor: "owner"},
                {Header: "Total Questions", accessor: "totalQuestions"},
                {Header: "Enrolled Users", accessor: "enrolledUsers"},
              ]}
              data={filteredData}
              filterValue={filterdata}
              tableClassName="w-full border-collapse"
              headerClassName="bg-[#f0d568] text-black justify-between text-left text-sm font-medium px-4 py-3 border-b border-gray-800"
              cellClassName="px-4 py-4 border-t border-[#E0EAF5] text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
              bodyClassName="divide-y divide-gray-800 justify-between text-sm font-normal"
              renderCell={(column, row) => {
                if (column === "courseName") {
                  return (
                    <div className="flex items-center gap-2">
                      {row.courseName}
                      {row.enrolled && (
                        <span className="bg-[#3a3a1a] text-[#f0d568] text-xs px-2 py-0.5 rounded-full">
                          Enrolled
                        </span>
                      )}
                    </div>
                  );
                }
                if (column === "enrolledUsers") {
                  const users = row.enrolledUsers;
                  const displayCount = Math.min(5, users.length);
                  const remainingCount = users.length - displayCount;

                  return (
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {users.slice(0, displayCount).map((user, i) => (
                          <Avatar
                            key={user.id}
                            className="h-8 w-8 border-2 border-[#121212]"
                          >
                            <AvatarImage
                              src={user.profile_picture || "/placeholder.svg"}
                            />
                            <AvatarFallback className="bg-gray-500 text-xs">
                              {user?.first_name
                                ? user?.first_name.charAt(0)
                                : "" + user?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {users.length > 0 ? (
                        remainingCount > 0 ? (
                          <span className="ml-1 text-gray-400">
                            +{remainingCount}
                          </span>
                        ) : null
                      ) : (
                        <span className="ml-1 text-gray-400">
                          No users enrolled
                        </span>
                      )}
                    </div>
                  );
                }

                // Handle each column explicitly to avoid returning complex objects
                const value = row[column as keyof LearningPathTableData];

                // Only return primitive values or JSX elements
                if (
                  column === "id" ||
                  column === "courseName" ||
                  column === "verificationDate" ||
                  column === "owner" ||
                  column === "totalQuestions"
                ) {
                  return String(value);
                }

                // For any other columns or complex objects, return a fallback
                return "—";
              }}
              renderActions={(row) => {
                return (
                  <DropdownMenu
                    open={activeDropdown === row.id}
                    onOpenChange={(open) => {
                      if (open) setActiveDropdown(row.id);
                      else if (activeDropdown === row.id)
                        setActiveDropdown(null);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:text-white bg-transparent hover:bg-transparent cursor-pointer"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#2a2a2a] border border-gray-700 text-white w-[154px] py-2"
                    >
                      {!row.enrolled ? (
                        <DropdownMenuItem
                          onClick={() => handleEnroll(row.id)}
                          disabled={isEnrolling}
                          className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                        >
                          <SquarePen
                            size={16}
                            className="text-white group-hover:text-[#F9DB6F]"
                          />
                          <span className="group-hover:text-[#F9DB6F]">
                            Enroll
                          </span>
                        </DropdownMenuItem>
                      ) : (
                        // <DropdownMenuItem
                        //   className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer opacity-50"
                        //   disabled
                        // >
                        //   <SquarePen size={16} className="text-white" />
                        //   <span>Already Enrolled</span>
                        // </DropdownMenuItem>
                        <></>
                      )}

                      <DropdownMenuItem
                        onClick={() => handleEdit(row)}
                        className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                      >
                        <Icon
                          icon="iconamoon:edit-light"
                          width="24"
                          height="24"
                        />
                        <span className="group-hover:text-[#F9DB6F]">Edit</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => openDeleteModal(row.id)}
                        className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
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
              }}
            />
          )}
        </div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6">
        <Button className="h-14 w-14 rounded-full bg-[#f0d568] hover:bg-[#e0c558] text-black">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="black"
            />
          </svg>
        </Button>
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
