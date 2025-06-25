"use client";

import {Button} from "@/components/ui/button";
import {FilterIcon as Funnel, Check, SlidersHorizontal} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export enum TimePeriod {
  ALL = "all",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

interface TimeFilterProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  onClearFilters: () => void;
  className?: string;
  isPath?: boolean;
}

export function TimeFilter({
  timePeriod,
  onTimePeriodChange,
  onClearFilters,
  isPath,
  className = "",
}: TimeFilterProps) {
  const timeOptions = [
    // {value: TimePeriod.ALL, label: "All Time"},
    {value: TimePeriod.WEEKLY, label: "Weekly"},
    {value: TimePeriod.MONTHLY, label: "Monthly"},
    {value: TimePeriod.YEARLY, label: "Yearly"},
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black rounded-md  w-[52px] h-[50px] cursor-pointer"
            aria-label="Filter"
          >
            {isPath ? (
              <SlidersHorizontal size={16} />
            ) : (
              <Funnel className="h-8 w-8 cursor-pointer" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-[#0E0F11] text-white rounded-xl shadow-xl text-sm p-1">
          <div className="py-1">
            {timeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                onClick={() => onTimePeriodChange(option.value)}
              >
                <span className="font-medium">{option.label}</span>
                {timePeriod === option.value && (
                  <Check className="h-4 w-4 text-[#F9DB6F]" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Helper function to filter items by time period
export function filterByTimePeriod<T extends {created_at: string}>(
  items: T[],
  timePeriod: TimePeriod
): T[] {
  if (timePeriod === TimePeriod.ALL) return items;

  const now = new Date();
  const filterDate = new Date();

  switch (timePeriod) {
    case TimePeriod.WEEKLY:
      filterDate.setDate(now.getDate() - 7);
      break;
    case TimePeriod.MONTHLY:
      filterDate.setDate(now.getDate() - 30);
      break;
    case TimePeriod.YEARLY:
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return items;
  }

  return items.filter((item) => new Date(item.created_at) >= filterDate);
}
