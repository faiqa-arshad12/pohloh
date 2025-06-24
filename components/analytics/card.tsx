import React, {useEffect, useState} from "react";
import {UnverifiedCards} from "../dashboard/unverfied-card";
import {useRole} from "../ui/Context/UserContext";
import MetricCard from "../matric-card";
import AdminCard from "./admin-card";
import {UserCard} from "./user-card";
import CardCreatedOverview from "./card-created-overview";
import {useUnverifiedCards} from "@/hooks/use-unverified-cards";
import {getKnowledgeCardStats} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";

export default function Card() {
  const {roleAccess} = useRole();
  const {cards, isLoading} = useUnverifiedCards();
  const [stats, setStats] = useState<any>(null);
  const {userData} = useUserHook();

  useEffect(() => {}, [userData]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const res = await getKnowledgeCardStats(userData.id);
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching tutor score:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userData) getStats();
  }, [userData]);

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ">
        <MetricCard
          value={stats?.total_cards_created || "0"}
          label="Cards Created"
          icon={
            <div className="p-2 rounded-full  flex items-center justify-center">
              <img src="/copy-icon.png" alt="copy" />
            </div>
          }
          loading={loading}
        />
        <MetricCard
          value={`${(stats?.verified_percentage || 0).toFixed(2)}%`}
          label="Trust Score"
          icon={
            <div className=" p-2 rounded-full flex items-center justify-center">
              <img src="/card-icon.png" alt="copy" />
            </div>
          }
          loading={loading}
        />
        <MetricCard
          value={stats?.rank || "N/A"}
          label="Team Rank"
          icon={
            <div className=" p-2 rounded-full  flex items-center justify-center">
              <img src="/card-rank.png" alt="copy" />
            </div>
          }
          loading={loading}
        />
        <MetricCard
          value={stats?.goal != null ? `${stats.goal}%` : "N/A"}
          label="Card Goal Achieved"
          icon={
            <div className=" p-2 rounded-full">
              <img src="/card-score.png" alt="copy" />
            </div>
          }
          loading={loading}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <CardCreatedOverview />
        <div className="w-full lg:w-1/3">
          <UnverifiedCards cards={cards} isAnalytic />
        </div>
      </div>
      {(roleAccess === "admin" || roleAccess === "owner") && <AdminCard />}
      {roleAccess === "user" && <UserCard />}
    </div>
  );
}
