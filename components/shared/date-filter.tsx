"use client";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {DatePicker} from "@/components/ui/date-picker";
import Loader from "./loader";

interface CustomDateFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function CustomDateFilterModal({
  open,
  onOpenChange,
  onApplyFilter,
}: CustomDateFilterModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Reset dates when modal opens
  useEffect(() => {
    if (open) {
      setStartDate(null);
      setEndDate(null);
      setDateError(null);
    }
  }, [open]);

  const handleApplyCustomFilter = async () => {
    setIsApplyingFilter(true);

    // Validate dates
    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required");
      setIsApplyingFilter(false);
      return;
    }

    if (startDate > endDate) {
      setDateError("Start date cannot be after end date");
      setIsApplyingFilter(false);
      return;
    }

    // Check if date range is too large (optional validation)
    const daysDifference = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDifference > 365) {
      setDateError("Date range cannot exceed 365 days");
      setIsApplyingFilter(false);
      return;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Apply the filter
    onApplyFilter(startDate, endDate);

    // Reset states
    setIsApplyingFilter(false);
    setDateError(null);
    onOpenChange(false);
  };

  const handleCloseModal = () => {
    setDateError(null);
    setIsApplyingFilter(false);
    onOpenChange(false);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setDateError(null);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setDateError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#1C1C1C] border-0 text-white p-6 rounded-[30px] w-full max-w-3xl"
        onPointerDownOutside={(e) => {
          // Prevent dialog from closing if click originated from date picker popover
          if (
            e.target instanceof HTMLElement &&
            e.target.closest(".date-picker-popover-content")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-white text-2xl font-semibold">
            Custom Filter
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-[#FFFFFF] text-[16px] font-normal mb-2"
            >
              Start Date
            </label>
            <DatePicker
              selectedDate={startDate}
              onSelectDate={handleStartDateChange}
              placeholder="Select the start date"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-[#FFFFFF] text-[16px] font-normal mb-2"
            >
              End Date
            </label>
            <DatePicker
              selectedDate={endDate}
              onSelectDate={handleEndDateChange}
              placeholder="Select the end date"
            />
          </div>
        </div>

        {dateError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                !
              </span>
              {dateError}
            </p>
          </div>
        )}

        <div className="flex justify-between flex-row py-4">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border-0 rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyCustomFilter}
            disabled={isApplyingFilter || !startDate || !endDate}
            className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[210px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplyingFilter ? (
              <div className="flex items-center gap-2">
                <Loader />
              </div>
            ) : (
              "Apply Filter"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
