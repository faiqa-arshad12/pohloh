"use client";

import {useState} from "react";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

interface DatePickerProps {
  selectedDate?: Date | null;
  onSelectDate: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal bg-[#2A2A2A] border-[#404040] text-white hover:bg-[#333333] hover:text-white cursor-pointer",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <span>
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
          <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-white cursor-pointer" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-[#2A2A2A] border-[#404040] date-picker-popover-content cursor-pointer"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => {
            onSelectDate(date || null);
          }}
          className="text-white"
        />
      </PopoverContent>
    </Popover>
  );
}
