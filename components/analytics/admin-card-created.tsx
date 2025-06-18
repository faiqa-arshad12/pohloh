"use client";

import {Trophy} from "lucide-react";
import {useState, useEffect} from "react";
import {Button} from "../ui/button";
import Graph from "./graph";
import {Icon} from "@iconify/react/dist/iconify.js";
import TopPerformance from "./top-performance";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {useUserHook} from "@/hooks/useUser";
import {fetchTeams, fetchCards} from "./analytic.service";
import {useRole} from "../ui/Context/UserContext";

const AdminCardCreated = () => {
  const {userData} = useUserHook();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [cardData, setCardData] = useState([]);
  const {roleAccess} = useRole();

  useEffect(() => {
    if (userData && roleAccess === "owner") {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response);
      };
      fetchteams();
    }
  }, [userData]);

  useEffect(() => {
    const getCards = async () => {
      try {
        setIsLoadingData(true);
        if (userData?.organizations.id && userData?.id && userData?.role) {
          const cards = await fetchCards(
            userData.organizations.id,
            userData.role,
            userData.id
          );
          if (cards) {
            setCardData(cards);
          }
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    getCards();
  }, [userData]);

  // Process card data for graph
  const processCardData = () => {
    const last6Weeks = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      return date;
    }).reverse();

    const weeklyData = last6Weeks.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const filteredCards = cardData.filter((card: any) => {
        const cardDate = new Date(card.created_at);
        const isInWeek = cardDate >= weekStart && cardDate <= weekEnd;

        let matchesDepartment = false;

        if (roleAccess === "owner") {
          // Owner can see all cards or filter by selected department
          matchesDepartment =
            selectedTeam === "all" ||
            (card.category_id && card.category_id.id === selectedTeam);
        } else if (roleAccess === "admin") {
          // Admin can only see cards where category_id matches their team_id
          matchesDepartment =
            card.category_id && card.category_id.id === userData?.team_id;
        }

        return isInWeek && matchesDepartment;
      });

      return {
        name: `Week ${index + 1}`,
        value: filteredCards.length,
      };
    });

    return weeklyData;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-ful mb-8">
      {/* Left Section: Daily Completion */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#191919] rounded-[30px] p-4 space-y-3">
        <div className="flex justify-between mb-4 flex-wrap">
          <h3 className="text-[24px] p-4 font-semibold">Cards Created</h3>
          <div className="flex gap-2 items-center">
            <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-[8px] border flex items-center justify-center gap-[10px] cursor-pointer">
              <Icon
                icon="bi:filetype-pdf"
                width="24"
                height="24"
                className="cursor-pointer"
              />
            </Button>
            {/* Only show department filter for owners */}
            {roleAccess === "owner" && (
              <DateRangeDropdown
                selectedRange={selectedTeam}
                onRangeChange={setSelectedTeam}
                width="300px"
                disabled={isLoadingData}
                bg="bg-[black]"
                options={[
                  {label: "All Department", value: "all"},
                  ...teams.map((team: any) => ({
                    label: team.name,
                    value: team.id,
                  })),
                ]}
              />
            )}
            {/* Show current team info for admins */}
          </div>
        </div>

        <Graph
          departmentId={
            roleAccess === "owner"
              ? selectedTeam !== "all"
                ? selectedTeam
                : ""
              : userData?.team_id || ""
          }
          data={processCardData()}
        />
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
  );
};

export default AdminCardCreated;
