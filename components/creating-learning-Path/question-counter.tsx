// "use client"

// import { Progress } from "@/components/ui/progress"

// type QuestionCounterProps = {
//   current: number
//   required: number
//   total: number
// }

// export default function QuestionCounter({ current, required, total }: QuestionCounterProps) {
//   const percentage = Math.min(100, (current / total) * 100)
//   const isComplete = current >= required
//   const isMinimumMet = current >= required

//   return (
//     <div className="w-full space-y-2 font-urbanist">
//       <div className="flex justify-between items-center">
//         <span className="text-sm font-medium">
//           Questions Added: {current}/{total}
//         </span>
//         <span className={`text-sm font-medium ${isMinimumMet ? "text-green-500" : "text-amber-500"}`}>
//           {isComplete
//             ? "All questions added!"
//             : isMinimumMet
//               ? `Minimum requirement met (${required})`
//               : `At least ${required - current} more needed`}
//         </span>
//       </div>
//       {/* <Progress
//         value={percentage}
//         className="h-2 bg-gray-700"
//         // indicatorClassName={isMinimumMet ? "bg-green-500" : "bg-amber-500"}
//       /> */}
//     </div>
//   )
// }
