"use client";

import {useState, useEffect} from "react";
import {ChevronDown} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {defaultOptions} from "@/utils/constant";

interface DateRangeOption {
  label: string;
  value: string;
  description?: string;
}

interface DateRangeDropdownProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  className?: string;
  width?: string;
  disabled?: boolean;
  options?: DateRangeOption[];
  bg?: string;
}

export function DateRangeDropdown({
  selectedRange,
  onRangeChange,
  className = "",
  width = "200px",
  disabled = false,
  bg,
  options = defaultOptions,
}: DateRangeDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when disabled
  useEffect(() => {
    if (disabled) {
      setDropdownOpen(false);
    }
  }, [disabled]);

  const handleRangeSelect = (range: string) => {
    onRangeChange(range);
    setDropdownOpen(false);
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (!disabled) {
      setDropdownOpen(open);
    }
  };

  const formatDisplayText = (range: string) => {
    // First, try to find the label from options
    const selectedOption = options.find((option) => option.value === range);
    if (selectedOption) {
      return selectedOption.label;
    }

    // If it's a custom date range (contains dates), format it nicely
    if (range.includes("-") && range.includes("/")) {
      const parts = range.split(" - ");
      if (parts.length === 2) {
        try {
          const startDate = new Date(parts[0]);
          const endDate = new Date(parts[1]);

          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startStr = startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const endStr = endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year:
                startDate.getFullYear() !== endDate.getFullYear()
                  ? "numeric"
                  : undefined,
            });
            return `${startStr} - ${endStr}`;
          }
        } catch (error) {
          // If parsing fails, return original
          return range;
        }
      }
    }

    // Fallback to the original range if no option found
    return range;
  };

  return (
    <div
      className={` ${
        bg ? bg : "bg-[#191919]"
      } !max-w-[160px] rounded-full overflow-hidden  h-[46px] px-4 flex items-center justify-between text-white text-lg cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      // style={{ width }}
    >
      <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger
          className="flex w-full justify-between items-center outline-none disabled:cursor-not-allowed rounded-xl"
          onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
          disabled={disabled}
        >
          <span className="truncate text-sm pr-2">
            {formatDisplayText(selectedRange)}
          </span>
          <ChevronDown
            size={20}
            className={`flex-shrink-0 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`${
            bg ? bg : " bg-[#2D2D2D]"
          } border-[#FFFFFF] text-white max-h-[300px] rounded-xl`}
          align="end"
          sideOffset={8}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleRangeSelect(option.value)}
              className={`hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer py-3 px-4 ${
                selectedRange === option.value
                  ? "bg-[#F9DB6F33] text-[#F9DB6F]"
                  : ""
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
