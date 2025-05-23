// "use client";

// import { useState, forwardRef, useEffect } from "react";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import DatePicker from "react-datepicker";
// import { CalendarDays } from "lucide-react";
// import "react-datepicker/dist/react-datepicker.css";
// import "../shared/calendar.css";

// type VerificationPeriodPickerProps = {
//   value?: string;
//   onChange?: (value: string) => void;
//   onDateChange?: (date: Date | null) => void;
//   dateValue?: Date | null;
// };

// const CustomDateInput = forwardRef<HTMLInputElement, any>(
//   ({ value, onClick, placeholder }, ref) => (
//     <div
//       onClick={onClick}
//       ref={ref}
//       className="flex items-center justify-between w-full h-[44px] px-4 bg-[#2C2D2E] text-[#FFFFFF52] rounded-[6px] border border-white/10 cursor-pointer"
//     >
//       <span className={value ? "" : "text-[#FFFFFF52]"}>{value || placeholder}</span>
//       <CalendarDays size={18} className="text-[white]" />
//     </div>
//   )
// );
// CustomDateInput.displayName = "CustomDateInput";

// export default function VerificationPeriodPicker({
//   value = "",
//   onChange,
//   onDateChange,
//   dateValue = null,
// }: VerificationPeriodPickerProps) {
//   const [selectedPeriod, setSelectedPeriod] = useState(value);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(dateValue);

//   useEffect(() => {
//     if (dateValue) {
//       setSelectedDate(dateValue);
//     }
//   }, [dateValue]);

//   const handlePeriodChange = (value: string) => {
//     setSelectedPeriod(value);
//     onChange?.(value);

//     // Calculate the date based on the selected period
//     const today = new Date();
//     let newDate: Date | null = null;

//     switch (value) {
//       case "1week":
//         newDate = new Date(today.setDate(today.getDate() + 7));
//         break;
//       case "2week":
//         newDate = new Date(today.setDate(today.getDate() + 14));
//         break;
//       case "1month":
//         newDate = new Date(today.setMonth(today.getMonth() + 1));
//         break;
//       case "6months":
//         newDate = new Date(today.setMonth(today.getMonth() + 6));
//         break;
//       case "12months":
//         newDate = new Date(today.setFullYear(today.getFullYear() + 1));
//         break;
//       case "custom":
//         // Keep the existing custom date or set to null if none exists
//         newDate = selectedDate;
//         break;
//       default:
//         newDate = null;
//     }

//     setSelectedDate(newDate);
//     onDateChange?.(newDate);
//   };

//   const handleCustomDateChange = (date: Date | null) => {
//     setSelectedDate(date);
//     onDateChange?.(date);

//     // If the user selects a date that matches one of our predefined periods,
//     // automatically switch the select to that period
//     if (date) {
//       const today = new Date();
//       const diffTime = Math.abs(date.getTime() - today.getTime());
//       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//       let period = "custom";
//       if (diffDays === 7) {
//         period = "1week";
//       } else if (diffDays === 14) {
//         period = "2week";
//       } else if (
//         date.getMonth() === today.getMonth() + 1 &&
//         date.getFullYear() === today.getFullYear()
//       ) {
//         period = "1month";
//       } else if (
//         date.getMonth() === today.getMonth() + 6 &&
//         date.getFullYear() === today.getFullYear()
//       ) {
//         period = "6months";
//       } else if (
//         date.getFullYear() === today.getFullYear() + 1
//       ) {
//         period = "12months";
//       }

//       if (period !== "custom") {
//         setSelectedPeriod(period);
//         onChange?.(period);
//       }
//     }
//   };

//   return (
//     <div className="w-full">
//       <label
//         htmlFor="period-select"
//         className="font-urbanist font-normal text-base leading-6 align-middle"
//       >
//         Select Verification Period
//       </label>

//       <div className="mt-2">
//         <Select onValueChange={handlePeriodChange} value={selectedPeriod}>
//           <SelectTrigger
//             id="period-select"
//             className="w-full h-[44px] bg-[#2C2D2E] text-[#FFFFFF52] border border-white/10 rounded-[6px] px-4 py-3 justify-between"
//           >
//             <SelectValue placeholder="Select verification period">
//               {{
//                 "1week": "1 Week",
//                 "2week": "2 Weeks",
//                 "1month": "1 Month",
//                 "6months": "6 Months",
//                 "12months": "1 Year",
//                 custom: selectedDate ? "Custom Date" : "Custom Date",
//               }[selectedPeriod] ?? "Select verification period"}
//             </SelectValue>
//           </SelectTrigger>

//           <SelectContent className="bg-[#2D2D2E] border-none text-white">
//             <SelectItem value="1week">1 Week</SelectItem>
//             <SelectItem value="2week">2 Weeks</SelectItem>
//             <SelectItem value="1month">1 Month</SelectItem>
//             <SelectItem value="6months">6 Months</SelectItem>
//             <SelectItem value="12months">1 Year</SelectItem>
//             <SelectItem value="custom">Custom Date</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {selectedPeriod === "custom" && (
//         <div className="relative mt-2 w-full">
//           <DatePicker
//             selected={selectedDate}
//             onChange={handleCustomDateChange}
//             minDate={new Date(new Date().setHours(0, 0, 0, 0))}
//             dateFormat="MM/dd/yyyy"
//             customInput={<CustomDateInput placeholder="Select custom date" />}
//             calendarClassName="custom-datepicker"
//             popperClassName="!z-50"
//             wrapperClassName="w-full"
//           />
//           {selectedDate && (
//             <p className="text-xs text-gray-400 mt-1">
//               Selected date: {selectedDate.toLocaleDateString()}
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }