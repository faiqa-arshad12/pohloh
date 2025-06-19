import {useEffect, useState} from "react";

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
import {fetchTeams, fetchTutorStats} from "./analytic.service";
import AdminTutorAnalyticGraph from "./tutor-analytic-graph";
import AdminCardCreated from "./admin-card-created";

interface AdminAanalyticProps {
  selectedTeam: string;
  startDate?: Date;
  endDate?: Date;
  team?: string;
}

const AdminAanalytic = ({
  selectedTeam,
  startDate,
  endDate,
  team,
}: AdminAanalyticProps) => {
  const {roleAccess} = useRole();
  const {userData} = useUserHook();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const departmentId = selectedTeam === "all" ? null : selectedTeam;
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await fetchTutorStats(
          userData.id,
          startDate ? startDate.toISOString() : undefined,
          endDate ? endDate.toISOString() : undefined,
          team !== "all" ? team : undefined
        );
        setStats(stats?.stats);
      } finally {
        setLoading(false);
      }
    };

    if (userData) fetchStats();
  }, [userData, startDate, endDate, team]);
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
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            value={stats?.completedLearningPaths | 0}
            label="Learning Paths Completed"
            icon={
              <div className="">
                <img src="/check-icon.png" alt="check" />
              </div>
            }
            loading={loading}
          />

          <MetricCard
            value={stats?.totalQuestionsAnswered | 0}
            label="Total Questions Answered"
            icon={
              <div className="">
                <img src="/total_question.png" alt="questions" />
              </div>
            }
            loading={loading}
          />
          <MetricCard
            value="---"
            label="Daily Goal Achieved"
            icon={
              <div className="bg-[#6B91D933] p-2 rounded-full">
                <Flame className="text-[#EFBE0F] w-10 h-10" />
              </div>
            }
            loading={loading}
          />
            <MetricCard
              value={`${stats?.verifiedPercentage||0}%`}
              label="Org Trust Score"
              icon={
                <div className="">
                  <img src="/rank.png" alt="rank" />
                </div>
              }
              loading={loading}
            />

        </div>
        {/* Tutor Score Section */}
        <div className="flex flex-col md:grid md:grid-cols-4 gap-4 mb-8 h-full">
          <TutorScoreCard />
          <AdminTutorAnalyticGraph />
        </div>

        <TutorList departmentId={departmentId} orgId={userData?.org_id} />

        <AdminLearnignPath orgId={userData?.org_id} />
        <AdminUnverifiedCard />

        <div className="flex flex-col">
          <AdminCardCreated />
          <AdminLeaderBoard />
        </div>
      </>
    </div>
  );
};

export default AdminAanalytic;
