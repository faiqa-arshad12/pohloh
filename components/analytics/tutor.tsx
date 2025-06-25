import React, {useEffect, useState} from "react";

import TutorScoreCard from "./tutor-score";
import {CompletedLearningPaths} from "./completed-path";
import CategoriesScore from "./categories-score";
import StrengthWeekness from "./strength-weekness";
import MetricCard from "@/components/matric-card";
import {Flame} from "lucide-react";
import {useRole} from "@/components/ui/Context/UserContext";
import AdminTutorAnalyticGraph from "./tutor-analytic-graph";
import {
  fetchLeaningPathInsightsByDept,
  fetchTutorStats,
  fetchUserStats,
} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import InsightsSkeleton from "./insights-skeleton";

export default function TutorAnalytics({
  id,
  startDate,
  endDate,
  team,
}: {
  id?: string | null;
  startDate?: Date;
  endDate?: Date;
  team?: string;
}) {
  const {roleAccess} = useRole();
  const [data, setData] = useState<any>();
  const {userData} = useUserHook();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetchUserStats(
            roleAccess === "user" ? userData.id : id
          );

          if (response) {
            setData(response);
            console.log("Generated Chart Data:", response);
          } else {
            console.log("No valid data in response");
          }
        } catch (error) {
          console.error("Error fetching tutor score:", error);
        } finally {
          setLoading(false);
        }
      };
      if (id) fetchData();
    }
  }, [id]);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await fetchTutorStats(
        roleAccess === "user" ? userData.id : id,
        startDate ? startDate.toISOString() : undefined,
        endDate ? endDate.toISOString() : undefined,
        team !== "all" ? team : undefined
      );
      setStats(stats?.stats);
    };

    if (id || userData) fetchStats();
  }, [id, userData, startDate, endDate, team]);

  useEffect(() => {
    const fetchInsights = async () => {
      const userId = roleAccess === "user" ? userData.id : id;
      if (userId) {
        const response = await fetchLeaningPathInsightsByDept(userId);
        if (response?.path) {
          setInsights(response.path);
          const firstCategory = Object.keys(response.path)[0];
          if (firstCategory) {
            setSelectedCategory(firstCategory);
          }
        }
      }
    };
    if (id || userData) fetchInsights();
  }, [id, userData, roleAccess]);

  return (
    <div className="">
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
          value={`${stats?.dailyGoalAchievedPercentage || 0}%`}
          label="Daily Goal Achieved"
          icon={
            <div className="bg-[#6B91D933] p-2 rounded-full">
              <Flame className="text-[#EFBE0F] w-10 h-10" />
            </div>
          }
          loading={loading}
        />
        <MetricCard
          value={
            stats?.teamRank?.rank &&
            stats.teamRank.rank !== 0 &&
            stats?.teamRank?.teamSize
              ? `${stats.teamRank.rank} / ${stats.teamRank.teamSize}`
              : "0"
          }
          label="Team Rank"
          icon={
            <div className="">
              <img src="/rank.png" alt="rank" />
            </div>
          }
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 h-auto">
        <TutorScoreCard user={roleAccess === "user" ? userData : data?.user} />

        <AdminTutorAnalyticGraph id={id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 h-auto">
        <div className="w-full">
          <CompletedLearningPaths id={id} />
        </div>

        <div className="w-full h-full lg:col-span-2">
          <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-lg h-full rounded-[30px]">
            {!insights ? (
              <InsightsSkeleton />
            ) : (
              <>
                <CategoriesScore
                  insights={insights}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
                {selectedCategory && (
                  <StrengthWeekness
                    strengths={insights[selectedCategory]?.strengths || []}
                    opportunities={
                      insights[selectedCategory]?.opportunities || []
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
