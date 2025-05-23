// "use client"

// import { X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import type { Question } from "@/types/types"

// type QuestionDisplayProps = {
//   questions: Question[]
//   onRemove: (id: string) => void
// }

// export default function QuestionDisplay({ questions, onRemove }: QuestionDisplayProps) {
//   if (questions.length === 0) {
//     return (
//       <div className="bg-[#222222] rounded-lg p-5 text-center">
//         <p className="text-gray-400">No questions added yet. Click "Add Questions" to get started.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       {questions.map((q, index) => (
//         <div key={q.id} className="bg-[#222222] rounded-lg p-5 space-y-4 relative">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
//             onClick={() => onRemove(q.id)}
//           >
//             <X size={16} />
//           </Button>
//           <div>
//             <h4 className="font-medium mb-2">Question {index + 1}:</h4>
//             <p className="mb-1">{q.question}</p>
//             {q.type === "Multiple Choice" && q.options && (
//               <div className="mt-2 space-y-2">
//                 {q.options.map((option, i) => (
//                   <div key={i} className="flex items-center gap-2">
//                     <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                     <span>{option}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div>
//             <p className="font-medium">
//               Answer: <span className="font-normal">{q.answer}</span>
//             </p>
//           </div>

//           <div>
//             <p className="font-medium">
//               Type: <span className="font-normal">{q.type}</span>
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
