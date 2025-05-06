"use client";
import {useEffect, useState} from "react";
import {
  User,
  LogOut,
  Edit,
  Ellipsis,
  Trash2,
  UserIcon,
  BuildingIcon,
  TrashIcon,
  UploadIcon,
  CreditCard,
  MessageSquareWarning,
  LayoutGrid,
  Check,
} from "lucide-react";
import EditProfileModal from "./Account/edit-Profile";
import {Button} from "../ui/button";
import Feedback from "./feedback";
import Table from "../ui/table";
import {useClerk, useUser} from "@clerk/nextjs";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Billing from "./billing";
import Apps from "./apps";
import EditLeadModal from "./Account/edit-lead";
import Image from "next/image";
import {useSearchParams} from "next/navigation";
import {InviteUserModal} from "./Account/Invite-User";
import {EditUserModal} from "./Account/edit-User";
import {useRole} from "../ui/Context/UserContext";
import {getUserDetails} from "@/actions/auth";
import {DEPARTMENTS, organizations} from "@/utils/constant";
import {ShowToast} from "../shared/show-toast";
import Loader from "../shared/loader";
import {supabase} from "@/supabase/client";
import {defaultWorkDays, Weekday, WorkDaysState} from "@/types/types";

interface User {
  name: string;
  seatType: string;
  team: string;
  jobRole: string;
}

type UserDetails = {
  id: string;
  created_at: string;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  user_id: string;
  org_id: string;
  role: string;
  user_role: string;
  location: string;
  status: string;
  profile_picture: string;
};

export default function Account() {
  const {signOut} = useClerk();
  const {roleAccess} = useRole();
  const {user, isLoaded} = useUser();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  const [activeTab, setActiveTab] = useState("user");
  const [selectedDepartments, setSelectedDepartments] = useState(["Customer"]);
  const [organizationName, setOrganizationName] = useState("");
  const [seats, setSeats] = useState<number>(0);
  const [customDepartment, setCustomDepartment] = useState("");
  const [profileImage, setProfileImage] = useState("/placeholder-profile.svg");

  const [openInvite, setOpenInvite] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditlead, setOpenEditlead] = useState(false);
  const [steps, setStep] = useState<number>();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setloading] = useState<boolean>(false);
  const [organizationNameError, setOrganizationNameError] = useState("");
  const [customDepartmentError, setCustomDepartmentError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [org_loading, setOrg_loading] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [isLoadeding, setIsLoading] = useState(false);

  // const [workDays, setWorkDays] = useState<WorkDaysState>()

  const [users] = useState<User[]>([
    {name: "John Doe", seatType: "User", team: "Design", jobRole: "Designer"},
    {name: "Trent", seatType: "Lead", team: "Sale", jobRole: "Sales"},
    {
      name: "James",
      seatType: "User",
      team: "Analytics",
      jobRole: "Analytics",
    },
    {name: "David", seatType: "Lead", team: "HR", jobRole: "HR"},
    {name: "David", seatType: "User", team: "HR", jobRole: "HR"},
  ]);
  const handleLogout = async () => {
    setStep(3);
    await signOut();
  };
  const handleInvitingNewUser = async () => {
    try {
      setIsInviteLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/organizations/${userDetails?.organizations?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch organization data: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      if (result.data.count >= result.data.num_of_seat) {
        ShowToast(
          "You've reached the maximum number of users for your current plan. Upgrade your subscription to invite more users.",
          "error"
        );
      } else {
        setOpenInvite(true);
      }
    } catch (err) {
      console.error("Error inviting user:", err);
      ShowToast(
        "Something went wrong while checking your invite limit.",
        "error"
      );
    } finally {
      setIsInviteLoading(false);
    }
  };

  const toggleDepartment = (department: string) => {
    if (selectedDepartments.includes(department)) {
      setSelectedDepartments(
        selectedDepartments.filter((dep) => dep !== department)
      );
    } else {
      setSelectedDepartments([...selectedDepartments, department]);
    }
  };

  const customDepartments = selectedDepartments?.filter(
    (dept) => !DEPARTMENTS.includes(dept)
  );
  const [dailyQuestions, setDailyQuestions] = useState<string>("0");
  const [weeklyCards, setWeeklyCards] = useState<string>("0");
  const [workDays, setWorkDays] = useState<WorkDaysState>(defaultWorkDays);

  const handleSaveChange = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        console.error("User not found");
        return;
      }

      const selectedDays = Object.entries(workDays)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      const updatedUserData = {
        week_days: selectedDays, // Send as array
        num_of_card: weeklyCards,
        num_of_tutor: dailyQuestions,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUserData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user in database");
      }

      ShowToast("Profile updated successfully");
    } catch (error) {
      ShowToast("Failed to update profile", "error");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await res.json();
        setUserDetails(data.user);
        setWeeklyCards(data.user?.num_of_card?.toString() || "0");
        setDailyQuestions(data.user?.num_of_tutor?.toString() || "0");
        setOrganizationName(data.user?.organizations.name || "");
        setSeats(data.user?.organizations.num_of_seat || "");
        setSelectedDepartments(data.user?.organizations.departments || []);
        // setDepa(data.user?.organizations.num_of_seat||'')

        if (data?.week_days && Array.isArray(data.week_days)) {
          const updatedWorkDays = {...defaultWorkDays};
          data.user?.week_days.forEach((day: any) => {
            if (day in updatedWorkDays) {
              updatedWorkDays[day as keyof WorkDaysState] = true;
            }
          });
          setWorkDays(updatedWorkDays);
        } else {
          setWorkDays(defaultWorkDays);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setWeeklyCards("0");
        setDailyQuestions("0");
        setWorkDays(defaultWorkDays);
      }
    };

    if (user?.id) {
      fetchUserDetails();
    }
  }, [user?.id, isLoaded]);
  const columns = [
    {Header: "User Name", accessor: "name"},
    {Header: "Seat Type", accessor: "seatType"},
    {Header: "Team", accessor: "team"},
    {Header: "Job Role", accessor: "jobRole"},
    {Header: "Action", accessor: "action"},
  ];

  useEffect(() => {
    if (page) {
      setStep(parseInt(page));
    } else {
      setStep(1);
    }
  }, [page]);

  // Custom action renderer
  const renderRowActions = (row: User) => {
    return (
      <div className="flex justify-start">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded"
            >
              <Ellipsis className="h-5 w-5 text-white" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            className="min-w-[144px] bg-[#222222] p-2 border border-[#333] rounded-md shadow-lg py-2 z-50"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              onSelect={(event) => {
                // ✅ Blur the trigger to fix re-open issue
                const button = (event.target as HTMLElement)?.closest("button");
                if (button) {
                  button.blur(); // Blur the button to close dropdown
                }

                // ✅ Delay modal open so Radix can clean up
                setTimeout(() => {
                  if (row.seatType === "Lead") {
                    setOpenEditlead(true);
                  } else {
                    setOpenEdit(true);
                  }
                }, 0);
              }}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              onSelect={() => {
                console.log("Delete", row);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  };
  const handleCheckboxChange = (day: Weekday) => {
    setWorkDays((prev) => ({...prev, [day]: !prev[day]}));
  };

  const handleSave = (userData: {
    name: string;
    role: string;
    seatType: string;
    team: string;
  }) => {
    // console.log("Saving user:", userData);
    // Add your save logic here
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Optional chaining to handle null or undefined files
    if (file) {
      setFileToUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage("/organization-logo.png");
  };
  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!file || !user) return null;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const {data, error} = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        ShowToast("Failed to upload profile picture", "error");
        return null;
      }

      const {
        data: {publicUrl},
      } = supabase.storage.from("images").getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Error in file upload:", error);
      return null;
    }
  };

  const submitOrganizationDetails = async () => {
    try {
      setOrg_loading(true);
      console.log("sdhjd");
      // ✅ Get form values
      if (!user) return;
      // const customerId = user?.id;

      let profilePictureUrl = profileImage || "";

      if (fileToUpload) {
        const uploadedUrl = await uploadFileToSupabase(fileToUpload);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        }
      }

      const payload = {
        name: organizationName, // form field
        departments: selectedDepartments, // form field (array)
        num_of_seat: seats, // form field
        // customer_id: customerId,
        org_picture: profilePictureUrl,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${organizations}/${userDetails?.organizations.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      ShowToast("organization data has been updated successfully!");
      setOrg_loading(false);
      return result; // Return the result if needed
    } catch (error) {
      setOrg_loading(false);
      ShowToast("An error occured with updating organization", "error");
      console.error("Error creating organization:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await res.json();

        // Update states with fetched data
        // Convert string values to numbers for the form
        setWeeklyCards(data.user?.num_of_card?.toString() || "5");
        setDailyQuestions(data.user?.num_of_tutor?.toString() || "3");

        if (data.user?.week_days && Array.isArray(data.user.week_days)) {
          const updatedWorkDays = {...defaultWorkDays};
          data.user.week_days.forEach((day: string) => {
            if (day in updatedWorkDays) {
              updatedWorkDays[day as Weekday] = true;
            }
          });
          setWorkDays(updatedWorkDays);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchUserData();
  }, [user?.id, isLoaded]);

  return (
    <div className="min-h-screen  text-white py-5 ">
      {loading || !isLoaded ? (
        <div className="flex flex-row justify-center items-center min-h-screen">
          <Loader size={50} />
        </div>
      ) : (
        <div className="mx-auto grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5 ">
          {/* Sidebar */}
          <div className="flex flex-col gap-2.5 md:gap-3 md:flex-col   rounded-[12px] ">
            <div className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%] p-4 pb-6 pt-0">
              Settings
            </div>

            <Button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm ${
                steps === 1
                  ? "bg-[#F9E36C] text-black"
                  : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
              }`}
            >
              <User className="w-4.5 h-4.5" />
              <span>Account</span>
            </Button>
            {roleAccess === "owner" && (
              <Button
                onClick={() => setStep(2)}
                className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm ${
                  steps === 2
                    ? "bg-[#F9E36C] text-black"
                    : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
                }`}
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>Billing</span>
              </Button>
            )}

            {roleAccess === "owner" && (
              <Button
                onClick={() => setStep(3)}
                className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm ${
                  steps === 3
                    ? "bg-[#F9E36C] text-black"
                    : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
                }`}
              >
                <LayoutGrid className="w-4.5 h-4.5" />
                <span>Apps</span>
              </Button>
            )}

            <Button
              onClick={() => setStep(4)}
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm ${
                steps === 4
                  ? "bg-[#F9E36C] text-black"
                  : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
              }`}
            >
              <MessageSquareWarning className="w-4.5 h-4.5" />
              <span>Feedback</span>
            </Button>

            <Button
              onClick={() => {
                handleLogout();
                setStep(5);
              }}
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm ${
                steps === 5
                  ? "bg-[#F9E36C] text-black"
                  : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
              }`}
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Main Content */}
          {steps === 1 && (
            <>
              <div>
                {roleAccess === "owner" && (
                  <>
                    <div className="flex w-full mb-8 bg-[#191919] p-2">
                      <button
                        className={`flex-1 p-3 font-urbanist font-medium text-[26px] leading-[100%] tracking-[0] ${
                          activeTab === "user"
                            ? "bg-[#F9DB6F] text-black rounded-lg"
                            : "text-gray-400"
                        }`}
                        onClick={() => setActiveTab("user")}
                      >
                        User Details
                      </button>
                      <button
                        className={`flex-1 p-3 font-urbanist font-medium text-[26px] leading-[100%] tracking-[0] ${
                          activeTab === "organization"
                            ? "bg-[#F9DB6F] text-black rounded-lg"
                            : "text-gray-400"
                        }`}
                        onClick={() => setActiveTab("organization")}
                      >
                        Organizational Details
                      </button>
                    </div>
                  </>
                )}

                {activeTab === "user" && (
                  <div
                    className="flex flex-col gap-5 p-5 bg-[#191919]"
                    style={{borderRadius: "30px"}}
                  >
                    {/* Profile Card */}
                    <div className="bg-[#FFFFFF0A] rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#7963E4] overflow-hidden">
                          <img
                            src={userDetails?.profile_picture || profileImage}
                            alt="avatar"
                            // className="w-full h-full"
                            // style={{width:'90px', height:'90px'}}
                            // width={56}
                            // height={56}
                          />
                        </div>
                        <div>
                          {userDetails && (
                            <>
                              <p className="font-urbanist font-semibold text-[30px] ">
                                {userDetails.first_name} {userDetails.last_name}
                              </p>
                              <p className="font-urbanist font-semibold text-[30px]  text-[white]">
                                {userDetails.location}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <Button className="self-end md:self-auto bg-[#F9E36C] text-black rounded-lg p-2 flex items-center justify-center">
                        <div
                          onClick={() => {
                            setIsEditProfileModalOpen(true);
                          }}
                          className="p-2 text-black rounded-md flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4" />
                        </div>
                      </Button>
                    </div>

                    {/* User Invite  */}
                    {(roleAccess === "owner" || roleAccess === "admin") && (
                      <div className="bg-[#FFFFFF0A] text-white p-6 rounded-lg ">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 ">
                          <h1 className="font-urbanist font-medium text-[24px] leading-[27.87px] tracking-[0] ">
                            User Management
                          </h1>
                          <button
                            className="bg-[#F9E36C] h-[40px] text-black px-4 py-2 rounded-md hover:bg-[#F9E36C] transition-colors font-urbanist font-medium text-[14px] leading-[100%] tracking-[0]"
                            onClick={() => handleInvitingNewUser()}
                          >
                            {isInviteLoading ? <Loader /> : "Invite User"}
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <Table
                            columns={columns.slice(0, -1)} // Exclude the Action column as we're using renderActions
                            data={users}
                            renderActions={(row) =>
                              renderRowActions(row as User)
                            }
                            tableClassName="min-w-full text-sm sm:text-base shadow rounded-lg border-collapse"
                            headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[16px] leading-[21.9px] tracking-[0]"
                            bodyClassName="py-3 px-4 font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] "
                            cellClassName="border-t border-[#E0EAF5] py-3 px-4 align-middle whitespace-nowrap  "
                          />
                        </div>
                      </div>
                    )}

                    {/* Preferences Card */}
                    <div className=" rounded-xl p-6 bg-[#FFFFFF0A] relative">
                      <h3 className="text-base font-semibold">Preferences</h3>
                      <p className="text-sm text-[#A0A0A0] mb-5">
                        Customize tutor/card settings
                      </p>

                      <div className="space-y-6">
                        {/* Work Days */}
                        <div className="bg-[#FFFFFF0A] p-5 rounded-[20px]">
                          <label className="block font-urbanist font-semibold text-[18px] leading-[100%] tracking-[0] mb-3">
                            Select the days of the week you work:
                          </label>
                          <p className=" font-urbanist font-semibold text-[14px] leading-[100%] tracking-[0] mb-4 text-gray-400">
                            This will let us know which days to ask Tutor
                            questions
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(workDays).map(([day, checked]) => (
                              <div
                                className="flex flex-col items-center space-y-1"
                                key={day}
                              >
                                <div className="relative h-[30px] w-[30px]">
                                  <input
                                    type="checkbox"
                                    id={day}
                                    checked={checked}
                                    onChange={() =>
                                      handleCheckboxChange(day as Weekday)
                                    }
                                    className="peer h-full w-full appearance-none border border-[#F9E36C] bg-transparent"
                                  />

                                  {checked && (
                                    <Check className="absolute top-0 left-0 h-full w-full text-[#F9E36C] p-[6px] pointer-events-none" />
                                  )}
                                </div>

                                <label
                                  htmlFor={day}
                                  className="inline-flex items-center justify-center w-9 h-9 rounded-md"
                                >
                                  <span className="font-urbanist font-medium text-[12px] leading-[100%] tracking-[0] uppercase text-white">
                                    {day.slice(0, 3)}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Daily Questions */}
                        <div className="bg-[#FFFFFF0A] p-5 rounded-[20px]">
                          <label className="block font-urbanist font-semibold text-[18px] leading-[100%] tracking-[0] mb-3">
                            Select the number of tutor questions to be asked
                            daily:
                          </label>

                          <select
                            value={dailyQuestions}
                            onChange={(e) => setDailyQuestions(e.target.value)}
                            className="w-full max-w-xs bg-[#FFFFFF14] text-white rounded-md px-3 py-3 text-sm border-none appearance-none bg-no-repeat bg-[right_12px_center] focus:outline-none"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                            }}
                          >
                            {[3, 5, 10, 15, 20].map((num) => (
                              <option
                                key={num}
                                value={num.toString()}
                                className="bg-[#2a2a2a] text-white"
                              >
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Weekly Cards */}
                        <div className="bg-[#FFFFFF0A] p-5 rounded-[20px]">
                          <label className="block font-urbanist font-semibold text-[18px] leading-[100%] tracking-[0] mb-3">
                            Select the number of cards to be created weekly:
                          </label>
                          <p className=" font-urbanist font-semibold text-[14px] leading-[100%] tracking-[0] mb-4 text-gray-400">
                            We will send a reminder at the end of each week to
                            help meet this goal
                          </p>
                          <select
                            value={weeklyCards}
                            onChange={(e) => setWeeklyCards(e.target.value)}
                            className="w-full max-w-xs bg-[#FFFFFF14] text-white rounded-md px-3 py-3 text-sm border-none appearance-none bg-no-repeat bg-[right_12px_center] focus:outline-none"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                            }}
                          >
                            {[5, 10, 15, 20, 25].map((num) => (
                              <option
                                key={num}
                                value={num.toString()}
                                className="bg-[#2a2a2a] text-white"
                              >
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-[164px] h-12 rounded-[8px] border  px-10 py-[10px] text-black"
                      onClick={() => {
                        handleSaveChange();
                      }}
                    >
                      {isLoadeding ? <Loader /> : " Save Changes"}
                    </Button>
                  </div>
                )}

                {activeTab === "organization" && (
                  <div>
                    <div className=" mx-auto  pb-8">
                      <div
                        className="bg-[#191919] rounded-lg p-6"
                        style={{borderRadius: "30px"}}
                      >
                        {/* Profile Image */}
                        <div className="flex flex-col items-start mb-8">
                          <div className="flex items-center justify-start space-x-4">
                            <div className="w-24 h-24 bg-[#F9DB6F] rounded-full overflow-hidden">
                              <Image
                                src={profileImage}
                                alt="Organization logo"
                                width={500} // set a width (can be any number)
                                height={300} // set a height (or use layout="fill" for full container fill)
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <label className="bg-[#F9DB6F]  h-[48px] text-black px-4 py-2 rounded-[8px] flex items-center cursor-pointer font-urbanist font-medium text-[14px] leading-[100%] tracking-[0]">
                              <UploadIcon size={16} className="mr-2" />
                              Upload Image
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleImageUpload}
                                accept="image/*"
                              />
                            </label>

                            <button
                              className=" border border-[#FFFFFF] h-[48px] px-4 py-2 rounded-[8px] flex items-center font-urbanist font-medium text-[14px] leading-[100%] tracking-[0]"
                              onClick={removeImage}
                            >
                              <TrashIcon size={16} className="mr-2" />
                              Remove Image
                            </button>
                          </div>
                        </div>

                        {/* Organization Form */}
                        <div className="space-y-6">
                          <div>
                            <label className="block font-urbanist font-normal text-[16px] leading-[24px] tracking-[0] align-middle mb-2">
                              Organization Name
                            </label>
                            <div className="flex items-center border border-[#FFFFFF0F] bg-[#FFFFFF14] rounded px-3 py-2 ">
                              <BuildingIcon
                                size={18}
                                className="text-gray-400 mr-2"
                              />
                              <input
                                type="text"
                                placeholder="Pholoh"
                                className="bg-transparent w-full focus:outline-none text-white"
                                value={organizationName}
                                onChange={(e) => {
                                  setOrganizationName(e.target.value);
                                  setOrganizationNameError("");
                                }}
                                onBlur={() => {
                                  if (!organizationName.trim()) {
                                    setOrganizationNameError(
                                      "Organization name is required"
                                    );
                                  } else if (organizationName.length > 50) {
                                    setOrganizationNameError(
                                      "Organization name cannot exceed 50 characters"
                                    );
                                  }
                                }}
                              />
                            </div>
                            {organizationNameError && (
                              <p className="text-red-400 text-sm mt-1">
                                {organizationNameError}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[16px] leading-[24px] tracking-[0px] align-middle font-normal font-['Urbanist'] mb-2">
                              Add departments to your organization
                            </label>

                            <p className="text-[12px] leading-[14px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-[#FFFFFF52] mb-4">
                              {
                                "This will pre-populate categories for your knowledge base. Don't worry you can always edit these later. Select all that apply."
                              }
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                              {DEPARTMENTS.map((dept) => (
                                <button
                                  key={dept}
                                  className={`py-2 px-4  bg-[#FFFFFF14] rounded-[6px] font-urbanist font-normal text-[14px] leading-[20px] tracking-[0] align-middle border ${
                                    selectedDepartments?.includes(dept)
                                      ? "border-[#F9DB6F] text-[#F9DB6F]"
                                      : "border-none text-[#FFFFFF52]"
                                  }`}
                                  onClick={() => toggleDepartment(dept)}
                                >
                                  {dept}
                                </button>
                              ))}
                            </div>
                            {departmentError && (
                              <p className="text-red-400 text-sm mb-2">
                                {departmentError}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-[16px] text-[#F9DB6F] leading-[24px] font-medium tracking-[0px] align-middle font-['Urbanist'] mb-2 block">
                              Add your Custom Department
                            </label>

                            {customDepartments?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {customDepartments.map((department) => (
                                  <div
                                    key={department}
                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9DB6F] text-[#2C2D2E]"
                                  >
                                    <span>{department}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleDepartment(department)
                                      }
                                      className="hover:text-[#ffffff]"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="text-[16px] leading-[24px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-white mb-1 block">
                                Add Department Name
                              </label>

                              <input
                                type="text"
                                placeholder="Enter the department name"
                                className="w-full bg-[#FFFFFF14] border-none rounded p-2 focus:outline-none text-[#FFFFFFA3]"
                                value={customDepartment}
                                onChange={(e) => {
                                  setCustomDepartment(e.target.value);
                                  setCustomDepartmentError("");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const customDept = customDepartment.trim();

                                    if (!customDept) {
                                      setCustomDepartmentError(
                                        "Department name cannot be empty"
                                      );
                                      return;
                                    }

                                    if (customDept.length > 30) {
                                      setCustomDepartmentError(
                                        "Department name cannot exceed 30 characters"
                                      );
                                      return;
                                    }

                                    if (
                                      selectedDepartments.includes(customDept)
                                    ) {
                                      setCustomDepartmentError(
                                        "Department already exists"
                                      );
                                      return;
                                    }

                                    toggleDepartment(customDept);
                                    setCustomDepartment("");
                                  }
                                }}
                              />
                              {customDepartmentError && (
                                <p className="text-red-400 text-sm mt-1">
                                  {customDepartmentError}
                                </p>
                              )}
                            </div>

                            <div className="mb-3">
                              <label className="text-[16px] leading-[24px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-white mb-1 block">
                                Number of Seats
                              </label>

                              <div className="flex items-center gap-2">
                                {/* Add Button */}
                                <button
                                  type="button"
                                  onClick={() => setSeats(seats + 1)}
                                  className="px-3 py-2  bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition"
                                >
                                  +
                                </button>

                                <input
                                  type="text"
                                  placeholder="Enter the department name"
                                  className=" w-[120px] bg-[#FFFFFF14] border-none rounded-[6px] p-2 focus:outline-none text-[#FFFFFF52]"
                                  value={seats}
                                  onChange={(e) =>
                                    setSeats(Number(e.target.value) || 0)
                                  }
                                />

                                {/* Subtract Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSeats((prev) => Math.max(prev - 1, 0))
                                  }
                                  className="px-3 py-2 bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition"
                                >
                                  −
                                </button>
                              </div>
                              {seats === 0 && (
                                <p className="text-red-400 text-sm mt-1">
                                  At least 1 seat required
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-4 pt-4 justify-between">
                            <button className=" h-[48px] w-[370px] py-3 border border-gray-600 rounded">
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="py-3 w-[370px] h-[48px] bg-[#F9DB6F] text-black rounded"
                              onClick={(e) => {
                                e.preventDefault();

                                // Validate all fields
                                let isValid = true;

                                if (!organizationName.trim()) {
                                  setOrganizationNameError(
                                    "Organization name is required"
                                  );
                                  isValid = false;
                                }

                                if (selectedDepartments.length === 0) {
                                  setDepartmentError(
                                    "Please select at least one department"
                                  );
                                  isValid = false;
                                }

                                if (seats < 1) {
                                  isValid = false;
                                }

                                if (isValid) {
                                  submitOrganizationDetails();
                                }
                              }}
                              disabled={org_loading}
                            >
                              {org_loading ? (
                                <div className="flex justify-center ">
                                  <Loader />
                                </div>
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {steps == 2 && <Billing />}
          {steps == 3 && <Apps />}
          {steps === 4 && <Feedback />}
        </div>
      )}

      <EditLeadModal open={openEditlead} onClose={setOpenEditlead} />

      <InviteUserModal open={openInvite} onOpenChange={setOpenInvite} />

      <EditUserModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSave={handleSave}
        defaultValues={{
          name: "John Doe",
          role: "editor",
          seatType: "dev",
          team: "qa",
        }}
      />
      <EditProfileModal
        userData={userDetails}
        isOpen={isEditProfileModalOpen}
        setIsOpen={setIsEditProfileModalOpen}
      />
    </div>
  );
}
