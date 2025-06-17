import {useEffect} from "react";

import {Flame} from "lucide-react";
import React from "react";

import {useRole} from "../ui/Context/UserContext";
import TutorScoreCard from "./tutor-card";
import MetricCard from "../matric-card";
import AdminLeaderBoard from "./admin-leader-borad-tutor";
import TutorList from "./tutor-list";
import AdminLearnignPath from "./admin-learning-path-insights";
import AdminUnverifiedCard from "./admin-unverified-card-insights";
import {useUserHook} from "@/hooks/useUser";
import {fetchTeams} from "./analytic.service";
import AdminTutorAnalyticGraph from "./tutor-analytic-graph";
import AdminCardCreated from "./admin-card-created";

interface AdminAanalyticProps {
  selectedTeam: string;
}

const AdminAanalytic = ({selectedTeam}: AdminAanalyticProps) => {
  const {roleAccess} = useRole();
  const {userData} = useUserHook();

  const departmentId = selectedTeam === "all" ? null : selectedTeam;

  useEffect(() => {
    if (userData) {
      const fetchteams = async () => {
        const response = await fetchTeams((userData.org_id as string) || "");
        console.log(response);
      };
      fetchteams();
    }
  }, [userData]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value="08"
          label="Learning Paths Completed"
          icon={
            <div className="">
              <img src="/check-icon.png" alt="check" />
            </div>
          }
        />

        <MetricCard
          value="160"
          label="Total Questions Answered"
          icon={
            <div className="">
              <img src="/total_question.png" alt="questions" />
            </div>
          }
        />
        <MetricCard
          value="82%"
          label="Daily Goal Achieved"
          icon={
            <div className="bg-[#6B91D933] p-2 rounded-full">
              <Flame className="text-[#EFBE0F] w-10 h-10" />
            </div>
          }
        />
        {roleAccess !== "user" ? (
          <MetricCard
            value="3/11"
            label="Org Trust Score"
            icon={
              <div className="">
                <img src="/rank.png" alt="rank" />
              </div>
            }
          />
        ) : (
          <MetricCard
            value="#14"
            label="Leaderboard"
            icon={
              <div className="">
                <img src="/goal.png" alt="goal" />
              </div>
            }
          />
        )}
      </div>
      {/* Tutor Score Section */}
      <div className=" flex flex-col md:grid md:grid-cols-4 gap-4 mb-8">
        <TutorScoreCard />
        <AdminTutorAnalyticGraph />
      </div>

      <TutorList departmentId={departmentId} orgId={userData?.org_id} />

      <AdminLearnignPath  orgId={userData?.org_id} />
      <AdminUnverifiedCard />

      <div className="flex flex-col">
        <AdminCardCreated />
        <AdminLeaderBoard departmentId={departmentId} />
      </div>
    </div>
  );
};

export default AdminAanalytic;
