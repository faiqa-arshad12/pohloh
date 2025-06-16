import {ChevronDown, Trophy} from "lucide-react";
import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import Graph from "./graph";
import {Icon} from "@iconify/react/dist/iconify.js";
import TopPerformance from "./top-performance";
import {DateRangeDropdown} from "../shared/custom-date-picker";
import {useUserHook} from "@/hooks/useUser";
import {fetchTeams} from "./analytic.service";

const AdminCardCreated = () => {
  const {userData} = useUserHook();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (userData) {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        setTeams(response);
      };
      fetchteams();
    }
  }, [userData]);

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
          </div>
        </div>

        <Graph departmentId={selectedTeam !== "all" ? selectedTeam : ""} />
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
