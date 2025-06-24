"use client";
import type React from "react";
import {useEffect, useState} from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {fetchUserGoalStatus} from "@/components/analytics/analytic.service";
import Loader from "../shared/loader";

type RangeType = "Monthly" | "Weekly" | "Daily" | "Custom";

type SchedulePlanProps = {
  userId: string;
};

type GoalData = {
  date: string;
  dayName: string;
  is_quiz_day: boolean;
  goal_achieved: boolean;
};

const getRange = (type: RangeType, refDate: Date): [Date, Date] => {
  const today = new Date();
  switch (type) {
    case "Monthly": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);
      return [thirtyDaysAgo, today];
    }
    case "Weekly": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      return [sevenDaysAgo, today];
    }
    case "Daily": {
      return [today, today];
    }
    default:
      return [refDate, refDate];
  }
};

export const SchedulePlan: React.FC<SchedulePlanProps> = ({userId}) => {
  const [rangeType, setRangeType] = useState<RangeType>("Monthly");
  const [refDate, setRefDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<[Date, Date]>(
    getRange("Weekly", new Date())
  );
  const [goalData, setGoalData] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDateRange(getRange(rangeType, refDate));
  }, [rangeType, refDate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const from =(format(dateRange[0], "yyyy-MM-dd"));
      const to = (format(dateRange[1], "yyyy-MM-dd"));
      try {
        const res = await fetchUserGoalStatus(userId, from, to);
        setGoalData(res.data || []);
      } catch (e) {
        setGoalData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, dateRange]);

  const getGoalStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return goalData.find((goal) => goal.date.slice(0, 10) === dateStr);
  };

  const renderCalendar = () => {
    // For Daily view, show only today
    if (rangeType === "Daily") {
      const today = new Date();
      const goalStatus = getGoalStatus(today);

      return (
        <div className="flex flex-col  space-y-4">
          {/* Single day display */}
          <div className="">
            <div className="text-gray-400 text-sm font-medium mb-2">
              {format(today, "EEEE")}
            </div>
            <div className="relative flex  group">
              <div
                className={`
                        flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium
                  ${
                    goalStatus?.is_quiz_day
                      ? goalStatus.goal_achieved
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "text-white bg-gray-700"
                  }
                  transition-colors duration-200
                `}
              >
                {format(today, "d")}
              </div>

              {/* Tooltip for goal status */}
              {goalStatus?.is_quiz_day && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                  {goalStatus.goal_achieved ? "Goal Achieved" : "Goal Missed"}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // For Weekly and Monthly views, show calendar grid
    const calendarStart = startOfWeek(dateRange[0], {weekStartsOn: 1});
    const calendarEnd = endOfWeek(dateRange[1], {weekStartsOn: 1});
    const calendarDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="text-center text-[#7C7C7C] text-[13px] font-urbanist font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const goalStatus = getGoalStatus(day);
                const isInRange = day >= dateRange[0] && day <= dateRange[1];
                const isCurrentMonth = isSameMonth(day, refDate);

                return (
                  <div
                    key={day.toISOString()}
                    className="relative flex items-center justify-center h-12 w-12 mx-auto group cursor-pointer"
                  >
                    <div
                      // className={`
                      //   flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium bg-[black]
                      //   ${
                      //     goalStatus?.is_quiz_day
                      //       ? goalStatus.goal_achieved
                      //         ? "bg-green-500 text-white"
                      //         : "bg-red-500 text-white"
                      //       : isCurrentMonth && isInRange
                      //       ? "text-white hover:bg-[black] bg-[black]"
                      //       : "text-gray-600"
                      //   }
                        // ${!isCurrentMonth ? "text-gray-600 bg-[black]" : ""}
                      // `}
                      className={`
                        flex items-center justify-center text-[16px] font-urbanist h-10 w-10 rounded-full text-sm font-medium
                        ${
                          goalStatus?.is_quiz_day
                            ? goalStatus.goal_achieved
                              ? "bg-[#50DDA5] text-black"
                              : "bg-[#EA2D30] text-white"
                            : isCurrentMonth && isInRange
                            ? "text-white hover:bg-[black] bg-[black]"
                            : "text-gray-600"
                        }
                        ${!isCurrentMonth ? "text-white bg-[black]" : ""}

                      `}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Tooltip for goal status */}
                    {goalStatus?.is_quiz_day && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        {goalStatus.goal_achieved
                          ? "Goal Achieved"
                          : "Goal Missed"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#191919] !rounded-[30px] p-6 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[24px] font-medium text-white">Schedule Plan</h2>
        <Select
          value={rangeType}
          onValueChange={(v) => setRangeType(v as RangeType)}
        >
          <SelectTrigger className="bg-black text-white w-[114px] rounded-[80px] border-0 cursor-pointer">
            <SelectValue placeholder="Weekly" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-gray-700">
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex mb-4">
        <div className="text-white text-[11px] font-urbanist bg-[#232323] inline-flex items-center justify-center rounded-[8px] px-4 h-[41px]">
          {`From ${format(dateRange[0], "d MMM yyyy")} - ${format(
            dateRange[1],
            "d MMM yyyy"
          )}`}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : (
        renderCalendar()
      )}
    </div>
  );
};
