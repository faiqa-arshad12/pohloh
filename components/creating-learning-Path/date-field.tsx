"use client";

import { useState, forwardRef } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "../shared/calendar.css";

type VerificationPeriodPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  onDateChange?: (date: Date | null) => void;
  dateValue?: Date | null;
};

const CustomDateInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center justify-between w-full h-[44px] px-4 bg-[#2C2D2E] text-[#FFFFFF52] rounded-[6px] border border-white/10 cursor-pointer"
    >
      <span className={value ? "" : "text-[#FFFFFF52]"}>{value || placeholder}</span>
      <CalendarDays size={18} className="text-[white]" />
    </div>
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default function VerificationPeriodPicker({
  value = "",
  onChange,
  onDateChange,
  dateValue = null,
}: VerificationPeriodPickerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(value);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    onChange?.(value);
  };

  return (
    <div className="w-full">
      <label
        htmlFor="period-select"
        className="font-urbanist font-normal text-base leading-6 align-middle"
      >
        Select Verification Period
      </label>

      <div className="mt-2">
        <Select onValueChange={handlePeriodChange} value={selectedPeriod}>
          <SelectTrigger
            id="period-select"
            className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between"
          >
            <SelectValue placeholder="Select verification period">
              {{
                "2week": "2 Weeks",
                "1month": "1 Month",
                "6months": "6 Months",
                "12months": "1 Year",
                custom: "Custom Date",
              }[selectedPeriod] ?? "Select verification period"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="bg-[#2D2D2E] border-none text-white">
            <SelectItem value="2week">2 Weeks</SelectItem>
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="12months">1 Year</SelectItem>
            <SelectItem value="custom">Custom Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedPeriod === "custom" && (
        <div className="relative mt-2 w-full">
          <DatePicker
            selected={dateValue}
            onChange={(date) => onDateChange?.(date)}
            minDate={new Date(new Date().setHours(0, 0, 0, 0))} // ← Prevent past dates
            dateFormat="MM/dd/yyyy"
            customInput={<CustomDateInput />}
            calendarClassName="custom-datepicker"
            popperClassName="!z-50"
            wrapperClassName="w-full"
          />
        </div>
      )}
    </div>
  );
}
