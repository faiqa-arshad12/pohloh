"use client";

import {useEffect, useState} from "react";

import {
  LogOut,
  Ellipsis,
  Trash2,
  MessageSquareWarning,
  Check,
} from "lucide-react";

import EditProfileModal from "./Account/edit-Profile";

import {Button} from "../ui/button";

import Feedback from "./feedback";

import Table from "../ui/table";

import {useClerk, useUser} from "@clerk/nextjs";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import Billing from "./billing";

// import Apps from "./Apps";

import EditLeadModal from "./Account/edit-lead";

import Image from "next/image";

import {InviteUserModal} from "./Account/Invite-User";

import {EditUserModal} from "./Account/edit-User";

import {useRole} from "../ui/Context/UserContext";

import {apiUrl, User_columns} from "@/utils/constant";

import {ShowToast} from "../shared/show-toast";

import Loader from "../shared/loader";

import {
  defaultWorkDays,
  type Weekday,
  type WorkDaysState,
  type User,
} from "@/types/types";

import {DeleteUserModal} from "./Account/delete-user";

import {useRouter, useSearchParams} from "next/navigation";

import {getSubscriptionDetails} from "@/actions/subscription.action";

import {OrganizationalDetail} from "./Account/organizational-detail";

import {Icon} from "@iconify/react";

import LogoutPopup from "../shared/logout-popup";

export default function Account() {
  const {signOut} = useClerk();
  const {roleAccess} = useRole();
  const {user, isLoaded} = useUser();
  const searchParams = useSearchParams();
  const page = searchParams?.get("page");
  const [activeTab, setActiveTab] = useState("user");
  const [profileImage, setProfileImage] = useState("/placeholder-profile.svg");
  const [openInvite, setOpenInvite] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditlead, setOpenEditlead] = useState(false);
  const [steps, setStep] = useState<number>();
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [isLoadeding, setIsLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [selectedRow, setSelectedRow] = useState<any>();
  const [users, setUsers] = useState<any>([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const [dailyQuestions, setDailyQuestions] = useState<string>("0");
  const [weeklyCards, setWeeklyCards] = useState<string>("0");
  const [workDays, setWorkDays] = useState<WorkDaysState>(defaultWorkDays);

  // Initial state tracking for changes detection
  const [initialState, setInitialState] = useState({
    dailyQuestions: "0",
    weeklyCards: "0",
    workDays: defaultWorkDays,
  });

  // Check if any changes have been made
  const hasChanges = () => {
    const changes =
      dailyQuestions !== initialState.dailyQuestions ||
      weeklyCards !== initialState.weeklyCards ||
      JSON.stringify(workDays) !== JSON.stringify(initialState.workDays);

    // Temporary debugging - you can remove this
    console.log("Current values:", {dailyQuestions, weeklyCards, workDays});
    console.log("Initial values:", initialState);
    console.log("Has changes:", changes);

    return changes;
  };

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  const handleInvitingNewUser = async () => {
    try {
      setIsInviteLoading(true);
      if (userDetails?.organizations?.subscriptions[0].subscription_id) {
        const subscription: any = await getSubscriptionDetails(
          userDetails?.organizations?.subscriptions[0].subscription_id
        );
        const response = await fetch(
          `${apiUrl}/users/count/${userDetails?.organizations?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch organization data: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();

        console.log(subscription, "subscription");

        if (subscription?.plan?.subscription?.status !== "active") {
          ShowToast("Upgrade your subscription to invite users", "error");
          return;
        } else if (
          result.data.count >= subscription.plan.subscription.quantity &&
          subscription.plan.subscription.status === "active"
        ) {
          ShowToast(
            "You've reached the maximum number of users for your current plan. Upgrade your subscription to invite more users.",
            "error"
          );
          return;
        } else {
          setOpenInvite(true);
        }
      } else {
        ShowToast("Upgrade your subscription to invite more users", "error");
        return;
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
        num_of_questions: dailyQuestions,
      };

      const response = await fetch(`${apiUrl}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
        // credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update user in database");
      }

      ShowToast("Profile updated successfully");

      // Update initial state after successful save
      setInitialState({
        dailyQuestions: dailyQuestions,
        weeklyCards: weeklyCards,
        workDays: {...workDays},
      });
    } catch (error) {
      ShowToast("Failed to update profile", "error");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await res.json();
      setUserDetails(data.user);

      // Use consistent default values - match what the user expects
      const weeklyCardsValue = data.user?.num_of_card?.toString() || "5";
      const dailyQuestionsValue =
        data.user?.num_of_questions?.toString() || "5";

      setWeeklyCards(weeklyCardsValue);
      setDailyQuestions(dailyQuestionsValue);
      setProfileImage(data.user?.organizations.org_picture);

      const updatedWorkDays = {...defaultWorkDays};
      if (data.user?.week_days && Array.isArray(data.user.week_days)) {
        data.user.week_days.forEach((day: any) => {
          if (day in updatedWorkDays) {
            updatedWorkDays[day as keyof WorkDaysState] = true;
          }
        });
      }
      setWorkDays(updatedWorkDays);

      // Set initial state for change tracking - only once here
      setInitialState({
        dailyQuestions: dailyQuestionsValue,
        weeklyCards: weeklyCardsValue,
        workDays: updatedWorkDays,
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      // Set fallback values
      const fallbackWeeklyCards = "5";
      const fallbackDailyQuestions = "5";
      const fallbackWorkDays = defaultWorkDays;

      setWeeklyCards(fallbackWeeklyCards);
      setDailyQuestions(fallbackDailyQuestions);
      setWorkDays(fallbackWorkDays);

      // Set initial state even for fallback values
      setInitialState({
        dailyQuestions: fallbackDailyQuestions,
        weeklyCards: fallbackWeeklyCards,
        workDays: fallbackWorkDays,
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserDetails();
    }
  }, [user?.id, isLoaded]);

  useEffect(() => {
    if (page) {
      setStep(Number.parseInt(page));
    } else {
      setStep(1);
    }
  }, [page]);

  const renderRowActions = (row: any) => {
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
            className="min-w-[144px] bg-[#222222] p-2 border border-[#333] rounded-md shadow-lg py-2 z-50 w-[154px]"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              style={{borderRadius: "4px"}}
              onSelect={(event) => {
                const button = (event.target as HTMLElement)?.closest("button");
                if (button) {
                  button.blur(); // Blur the button to close dropdown
                }
                setSelectedRow(row);
                setTimeout(() => {
                  setOpenEdit(true);
                }, 0);
              }}
            >
              {/* <Pencil className="h-4 w-4" /> */}
              <Icon icon="iconamoon:edit-light" width="24" height="24" />
              <span>Edit</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
              style={{borderRadius: "4px"}}
              onSelect={(event) => {
                const button = (event.target as HTMLElement)?.closest("button");
                if (button) {
                  button.blur();
                }
                setSelectedRow(row);
                setTimeout(() => {
                  setDeleteModalOpen(true);
                }, 0);
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

  const fetchUsers = async () => {
    try {
      setUserDataLoading(true);
      const response = await fetch(
        `${apiUrl}/users/organizations/${userDetails?.organizations?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch organization data: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      setUsers(result.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setUserDataLoading(false);
    }
  };

  const fetchUsersByTeam = async () => {
    try {
      setUserDataLoading(true);
      const response = await fetch(
        `${apiUrl}/users/organizations/teams/${userDetails.team_id}?orgId=${userDetails.org_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch organization data: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      setUsers(result.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    if (userDetails && userDetails?.role === "owner") fetchUsers();
    else if (userDetails && userDetails.role === "admin") fetchUsersByTeam();
  }, [user, userDetails]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  return (
    <div className="min-h-screen  text-white py-5 ">
      {!isLoaded || userDataLoading ? (
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
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm cursor-pointer ${
                steps === 1
                  ? "bg-[#F9E36C] text-black"
                  : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
              }`}
            >
              <Icon icon="heroicons:users" width="24" height="24" />
              <span className="text-[20px] text-normal font-urbanist">
                Account
              </span>
            </Button>
            {roleAccess === "owner" && (
              <Button
                onClick={() => setStep(2)}
                className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm  cursor-pointer ${
                  steps === 2
                    ? "bg-[#F9E36C] text-black"
                    : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
                }`}
              >
                <Icon icon="octicon:credit-card-24" width="24" height="24" />
                <span className="text-[20px] text-normal font-urbanist">
                  Billing
                </span>
              </Button>
            )}
            <Button
              onClick={() => setStep(4)}
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm  cursor-pointer ${
                steps === 4
                  ? "bg-[#F9E36C] text-black"
                  : "bg-[#0E0F11] text-white border border-[#828282] hover:bg-[#0E0F11]"
              }`}
            >
              <MessageSquareWarning className="w-10 h-10" />
              <span className="text-[20px] text-normal font-urbanist">
                Feedback
              </span>
            </Button>
            <Button
              onClick={() => setLogoutModalOpen(true)}
              className={`flex items-center gap-2 w-full h-[70px] px-4 py-3.5 rounded-lg font-medium text-sm cursor-pointer  cursor-pointer ${
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
                        className={`flex-1 p-3 font-urbanist font-medium text-[26px] leading-[100%] tracking-[0] cursor-pointer ${
                          activeTab === "user"
                            ? "bg-[#F9DB6F] text-black rounded-lg"
                            : "text-gray-400"
                        }`}
                        onClick={() => setActiveTab("user")}
                      >
                        User Details
                      </button>
                      <button
                        className={`flex-1 p-3 font-urbanist font-medium text-[26px] leading-[100%] tracking-[0] cursor-pointer ${
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
                        <div className="w-14 h-14 rounded-full  overflow-hidden">
                          <img
                            src={userDetails?.profile_picture || profileImage}
                            alt="avatar"
                            className="w-full h-full"
                            // style={{width:'90px', height:'90px'}}
                          />
                        </div>
                        <div>
                          {userDetails && (
                            <>
                              <p className="font-urbanist font-semibold text-[30px] ">
                                {userDetails?.first_name}{" "}
                                {userDetails?.last_name}
                              </p>
                              <p className="font-urbanist font-normal text-[30px]  text-[#FFFFFFCC]">
                                {userDetails.location}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <Button className="self-end md:self-auto bg-[#F9E36C] text-black rounded-lg  flex items-center justify-center cursor-pointer">
                        <div
                          onClick={() => {
                            setIsEditProfileModalOpen(true);
                          }}
                          className="p-2 text-black rounded-md flex items-center justify-center "
                        >
                          {/* <Edit className="w-4 h-4 cursor-pointer" /> */}
                          <Image
                            src="/editIcon.png"
                            width={10}
                            height={10}
                            alt="edit user"
                          />
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
                            className="bg-[#F9E36C] h-[40px] text-black px-4 py-2 rounded-md hover:bg-[#F9E36C] transition-colors font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] cursor-pointer opacity-100 hover:opacity-80"
                            onClick={() => handleInvitingNewUser()}
                          >
                            {isInviteLoading ? <Loader /> : "Invite User"}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <Table
                            columns={User_columns.slice(0, -1)}
                            data={users}
                            renderActions={(row) =>
                              renderRowActions(row as User)
                            }
                            loggedInUserId={user?.id}
                            tableClassName="min-w-full text-sm sm:text-base shadow rounded-lg border-collapse"
                            headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[16px] leading-[21.9px] tracking-[0]"
                            bodyClassName="py-3 px-4 font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] "
                            cellClassName="border-t border-[#E0EAF5] py-3 px-4 align-middle whitespace-nowrap "
                            itemsPerPageOptions={[5, 10, 20, 100]}
                            defaultItemsPerPage={5}
                            renderCell={(
                              column: string,
                              row: {[x: string]: any}
                            ) => {
                              // Get the value (this would use getNestedValue internally in the Table component)
                              const value = column.includes(".")
                                ? getNestedValue(row, column)
                                : row[column];

                              if (column === "role") {
                                return value === "admin"
                                  ? "Lead"
                                  : value === "user"
                                  ? "User"
                                  : value?.toString();
                              }

                              if (value === null || value === undefined)
                                return "";

                              if (typeof value === "object")
                                return JSON.stringify(value);

                              return value;
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Preferences Card */}
                    <div className=" rounded-xl p-6 bg-[#FFFFFF0A] relative">
                      <h3 className="text-base font-semibold">Preferences</h3>
                      <p className="text-sm text-[#CDCDCD] mb-5 mt-2">
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
                                    className="peer h-full w-full appearance-none border border-[#F9E36C] bg-transparent cursor-pointer"
                                  />
                                  {checked && (
                                    <Check className="absolute top-0 left-0 h-full w-full text-[#F9E36C] p-[6px] pointer-events-none cursor-pointer" />
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
                            className="w-full max-w-xs bg-[#FFFFFF14] text-white rounded-md px-3 py-3 text-sm border-none appearance-none bg-no-repeat bg-[right_12px_center] focus:outline-none cursor-pointer"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
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
                            className="w-full max-w-xs bg-[#FFFFFF14] text-white rounded-md px-3 py-3 text-sm border-none appearance-none bg-no-repeat bg-[right_12px_center] focus:outline-none cursor-pointer"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
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
                      className={`w-[164px] h-12 rounded-[8px] border px-10 py-[10px] cursor-pointer transition-all bg-[#F9DB6F] text-black hover:bg-[#F9DB6F]/90

                      `}
                      onClick={() => {
                        if (hasChanges() && !isLoadeding) {
                          handleSaveChange();
                        }
                      }}
                      disabled={!hasChanges() || isLoadeding}
                    >
                      {isLoadeding ? <Loader /> : "Save Changes"}
                    </Button>
                  </div>
                )}

                {activeTab === "organization" && (
                  <OrganizationalDetail organization={userDetails} />
                )}
              </div>
            </>
          )}

          {steps == 2 && <Billing />}
          {/* {steps == 3 && <Apps />} */}
          {steps === 4 && <Feedback />}
        </div>
      )}

      <EditLeadModal
        open={openEditlead}
        onClose={setOpenEditlead}
        userDetails={userDetails}
      />
      <DeleteUserModal
        open={deleteModalOpen}
        UserDetails={selectedRow}
        onOpenChange={setDeleteModalOpen}
        fetchUserDetails={fetchUserDetails}
      />
      <InviteUserModal open={openInvite} onOpenChange={setOpenInvite} />
      <EditUserModal
        open={openEdit}
        userDetails={selectedRow}
        onOpenChange={setOpenEdit}
        fetchUserDetails={fetchUserDetails}
      />
      <EditProfileModal
        userData={userDetails}
        isOpen={isEditProfileModalOpen}
        setIsOpen={setIsEditProfileModalOpen}
        fetchUserDetails={fetchUserDetails}
        fetchUsers={fetchUsers}
      />
      <LogoutPopup
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        isLoading={isLogoutLoading}
      />
    </div>
  );
}
