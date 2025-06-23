"use client";
import {AnnouncementCard} from "@/components/dashboard/announcments";
import {SavedCards} from "@/components/dashboard/saved-card";
import {UnverifiedCards} from "@/components/dashboard/unverfied-card";
import React, {useEffect, useState} from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import RenewSubscription from "@/components/dashboard/modals/renew-subscription";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {apiUrl} from "@/utils/constant";
import {useUserHook} from "@/hooks/useUser";
import AdminTutorAnalyticGraph from "@/components/analytics/tutor-analytic-graph";
import {SchedulePlan} from "@/components/dashboard/SchedulePlan";

const Page = () => {
  const [cardsData, setCards] = useState<any[]>([]);
  const {userData} = useUserHook();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        if (!userData?.org_id) {
          setCards([]);
          return;
        }
        const cardsRes = await fetch(
          `${apiUrl}/cards/organizations/${userData?.org_id}`,
          {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            // credentials: "include",
            body: JSON.stringify({
              role: userData?.role,
              userId: userData?.id,
            }),
          }
        );

        if (!cardsRes.ok) throw new Error("Failed to fetch cards");
        const {cards} = await cardsRes.json();
        setCards(cards);
      } catch (err) {
        console.error("Error fetching cards:", err);
        toast.error("Failed to load cards");
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (userData) {
      fetchCards();
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <Skeleton className="h-[44px] w-[300px] rounded-lg" />

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-full space-y-4 bg-[#191919] p-6 rounded-2xl"
            >
              <Skeleton className="h-6 w-1/2 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-[#191919] p-6 rounded-2xl">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-10 w-[114px] rounded-full" />
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="space-y-4 bg-[#191919] p-6 rounded-2xl">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <h1 className="text-white text-[36px] font-semibold">
        Dashboard Overview
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div className="h-full">
          <SavedCards cards={cardsData} />
        </div>
        <div className="h-full">
          <UnverifiedCards cards={cardsData} />
        </div>
        <div className="h-full">
          <AnnouncementCard userData={userData} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#191919] rounded-[30px] h-full">
          <AdminTutorAnalyticGraph dashboard />
        </div>

        <SchedulePlan userId={userData?.id} />
      </section>

      <RenewSubscription open={false} />
    </div>
  );
};

export default Page;
