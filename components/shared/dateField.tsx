import {useForm, Controller} from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import {CalendarDays} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import './calendar.css'
type VerificationFormValues = {
  verificationperiod: string;
  customDate: Date | null;
};
import {forwardRef} from "react";
// import DatePicker from "react-datepicker";
// import { CalendarDays } from "lucide-react";
// import "react-datepicker/dist/react-datepicker.css";

// Custom Input for react-datepicker
const CustomDateInput = forwardRef<HTMLInputElement, any>(
  ({value, onClick, placeholder}, ref) => (
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
export default function VerificationPeriodPickerForm() {
  const form = useForm<VerificationFormValues>({
    defaultValues: {
      verificationperiod: "",
    },
  });



// ... other imports

type VerificationFormValues = {
  verificationperiod: string | Date; // Can be either a string code or Date object
};



  const { watch, setValue } = form;
  const selectedPeriod = watch("verificationperiod");

  // Calculate date based on period selection
  const calculateDateFromPeriod = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case "2week":
        return new Date(now.setDate(now.getDate() + 14));
      case "1month":
        return new Date(now.setMonth(now.getMonth() + 1));
      case "6months":
        return new Date(now.setMonth(now.getMonth() + 6));
      case "12months":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date();
    }
  };

  return (
    <div className="w-full">
      <label className="font-urbanist font-normal text-base leading-6 align-middle">
        Select Verification Period
      </label>

      <FormField
        control={form.control}
        name="verificationperiod"
        render={({ field }) => (
          <FormItem>
            <Select
              onValueChange={(value) => {
                if (value === "custom") {
                  // For custom, set tomorrow's date as default
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setValue("verificationperiod", tomorrow);
                } else {
                  // For predefined periods, calculate the date
                  setValue("verificationperiod", calculateDateFromPeriod(value));
                }
              }}
              value={
                typeof field.value === "string" ? field.value : "custom"
              }
            >
              <FormControl>
                <SelectTrigger className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between mt-2">
                  <SelectValue placeholder="Select verification period">
                    {typeof field.value === "string" ? (
                      {
                        "2week": "2 Weeks",
                        "1month": "1 Month",
                        "6months": "6 Months",
                        "12months": "1 Year",
                      }[field.value] || "Select period"
                    ) : (
                      field.value.toLocaleDateString()
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>

              <SelectContent className="bg-[#2D2D2E] border-none text-white">
                <SelectItem value="2week">2 Weeks</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">1 Year</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {typeof selectedPeriod !== "string" && (
        <div className="relative mt-2 w-full">
          <DatePicker
            selected={selectedPeriod}
            onChange={(date) => {
              if (date) {
                setValue("verificationperiod", date);
              }
            }}
            minDate={new Date(new Date().setHours(0, 0, 0, 0))}
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
