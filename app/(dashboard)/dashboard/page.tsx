"use client";
import {AnnouncementCard} from "@/components/dashboard/announcments";
import {SavedCards} from "@/components/dashboard/saved-card";
import {UnverifiedCards} from "@/components/dashboard/unverfied-card";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {Calendar, dateFnsLocalizer, Event} from "react-big-calendar";
import {format, parse, startOfWeek, getDay} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {enUS, fr, de} from "date-fns/locale";
import {addMonths, startOfMonth, endOfMonth} from "date-fns";
import * as Tooltip from "@radix-ui/react-tooltip";
import RenewSubscription from "@/components/dashboard/modals/renew-subscription";
import {toast} from "sonner";
import {useUser} from "@clerk/nextjs";
import {Skeleton} from "@/components/ui/skeleton";

type ViewMode = "Monthly" | "Weekly" | "Daily";
type Interval = "monthly" | "weekly" | "daily";

const locales = {
  en: enUS,
  fr: fr,
  de: de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), {weekStartsOn: 1}),
  getDay,
  locales,
});

type DayStatus = "active" | "urgent" | "inactive";

interface CustomToolbarProps {
  label: string;
  onNavigate: (direction: "PREV" | "NEXT") => void;
}

interface CustomDayCellProps {
  date: Date;
}

const events: Event[] = [
  {
    title: "Meeting with Student",
    start: new Date(2025, 1, 18, 10, 0),
    end: new Date(2025, 1, 18, 11, 0),
  },
  {
    title: "Group Session",
    start: new Date(2025, 1, 20, 14, 0),
    end: new Date(2025, 1, 20, 16, 0),
  },
];

const Page = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("Monthly");
  const [interval, setInterval] = useState<Interval>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString()
  );
  const {user, isLoaded: isUserLoaded} = useUser();
  const [cardsData, setCards] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [dateStatuses] = useState<Record<string, DayStatus>>({
    "2025-04-15": "active",
    "2025-04-20": "urgent",
    "2025-04-25": "active",
    "2025-04-08": "urgent",
    "2025-04-30": "inactive",
  });

  useEffect(() => {
    const fetchCards = async () => {
      if (!isUserLoaded || !user?.id) return;

      try {
        setIsLoading(true);

        // Get user details
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
          }
        );

        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        const orgId = userData?.user?.organizations?.id;
        const userRole = userData?.user?.role;
        setUserInfo(userData.user);

        if (!orgId) {
          setCards([]);
          return;
        }

        // Get all cards for the organization
        const cardsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cards/organizations/${orgId}`,
          {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
          }
        );

        if (!cardsRes.ok) throw new Error("Failed to fetch cards");
        const {cards} = await cardsRes.json();

        if (userRole === "owner") {
          setCards(cards || []);
        } else if (userRole === "user") {
          const filteredCards = (cards || []).filter((card: any) => {
            return card.card_owner_id?.id === userData.user.id;
          });

          setCards(filteredCards);
        } else {
          const filteredCards = (cards || []).filter((card: any) => {
            return (
              card.card_owner_id?.id === userData.user.id ||
              card.category_id.id == userData.user.team_id
            );
          });

          setCards(filteredCards);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        toast.error("Failed to load cards");
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [user, isUserLoaded]);

  const generateMonths = (count: number) => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const monthDate = addMonths(today, i);
      months.push({
        value: monthDate.toISOString(),
        label: format(monthDate, "MMM, yyyy"),
      });
    }

    return months;
  };

  const CustomDayCell = ({date}: CustomDayCellProps) => {
    const dateKey = date.toISOString().split("T")[0];
    const status = dateStatuses[dateKey] || "inactive";

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-400 text-black hover:bg-green-300";
        case "urgent":
          return "bg-red-500 text-white hover:bg-red-400";
        default:
          return "bg-gray-900 text-white hover:bg-gray-700";
      }
    };

    const getTooltipColor = (status: string) => {
      switch (status) {
        case "active":
          return "bg-green-400 text-black";
        case "urgent":
          return "bg-red-500 text-white";
        default:
          return "bg-[#333] text-white";
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "active":
          return "Available";
        case "urgent":
          return "Urgent Meeting";
        default:
          return "Unavailable";
      }
    };

    return (
      <div className="flex items-center justify-center bg-[#191919] h-full w-full border-none">
        <Tooltip.Provider delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div
                className={`flex items-center justify-center ${getStatusColor(
                  status
                )}
                  w-[38px] h-[38px] rounded-full cursor-pointer transition-all
                  duration-200 hover:scale-105`}
              >
                {date.getDate()}
              </div>
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                className={`${getTooltipColor(
                  status
                )} px-3 py-2 rounded-md text-sm shadow-lg
                  animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out
                  data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`}
                side="top"
                align="center"
                sideOffset={8}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === "active"
                        ? "bg-black/30"
                        : status === "urgent"
                        ? "bg-white/30"
                        : "bg-white/20"
                    }`}
                  />
                  <div>
                    <p className="font-semibold">{getStatusLabel(status)}</p>
                    <p
                      className={`text-xs ${
                        status === "active"
                          ? "text-black/70"
                          : status === "urgent"
                          ? "text-white/80"
                          : "text-white/60"
                      }`}
                    >
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Tooltip.Arrow className={`${getTooltipColor(status)}`} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    );
  };

  const CustomToolbar = ({}: CustomToolbarProps) => {
    const months = generateMonths(12);
    const formatDateRange = (dateString: string) => {
      const date = new Date(dateString);
      const start = format(startOfMonth(date), "d MMM, yyyy");
      const end = format(endOfMonth(date), "d MMM, yyyy");
      return `${start} - ${end}`;
    };

    return (
      <div className="flex flex-col w-full text-white">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-2xl font-normal">Schedule Plan</h2>
          <div className="relative">
            <Select
              value={viewMode}
              onValueChange={(value: ViewMode) => setViewMode(value)}
            >
              <SelectTrigger className="bg-black text-white w-[114px] rounded-[80px] border-0 cursor-pointer">
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white">
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="py-2 mx-4 mb-5 rounded-md inline-block">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-[#232323] w-[full] h-[41px] text-[#FFFFFF] p-4  border-none cursor-pointer" style={{borderRadius:'8px'}}>
              <SelectValue>{formatDateRange(selectedMonth)}</SelectValue>
            </SelectTrigger>

            <SelectContent className="bg-[#232323] text-gray-400 border-none cursor-pointer">
              {months.map((month) => (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] cursor-pointer"
                >
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (!isUserLoaded || isLoading) {
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
          <AnnouncementCard userData={userInfo} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#191919] rounded-2xl p-6 h-full">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <h3 className="text-xl font-medium mb-2 sm:mb-0 text-white">
              Tutor Analytics
            </h3>
            <div className="flex items-center gap-2 cursor-pointer">
              <Select
                value={interval}
                onValueChange={(value: Interval) => setInterval(value)}
              >
                <SelectTrigger className="cursor-pointer bg-black text-white w-[114px] rounded-[80px] border-0">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative h-48 sm:h-56 lg:h-64 w-full">
            <Image
              src="/Frame 5.png"
              alt="Analytics Chart"
              fill
              className="rounded-xl object-contain"
              quality={100}
              priority
            />
          </div>
        </div>
        <div className="h-full w-full bg-[#191919] p-6 rounded-2xl">
          <Calendar
            localizer={localizer}
            defaultDate={new Date(selectedMonth)}
            views={["month"]}
            style={{
              height: 400,
              backgroundColor: "#191919",
              color: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            events={events}
            eventPropGetter={() => ({
              style: {
                backgroundColor: "#191919",
                color: "black",
                borderRadius: "4px",
              },
            })}
            components={{
              toolbar: CustomToolbar,
              month: {
                dateHeader: ({date}: {date: Date}) => (
                  <CustomDayCell date={date} />
                ),
              },
            }}
            className="custom-calendar [&_.rbc-row]:gap-1"
            key={selectedMonth}
          />
        </div>
      </section>

      <RenewSubscription open={false} />
    </div>
  );
};

export default Page;
