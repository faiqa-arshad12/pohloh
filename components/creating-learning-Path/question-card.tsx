
// "use client"
// import { Button } from "@/components/ui/button"
// import { X } from "lucide-react"

// type Question = {
//   id: string
//   question: string
//   answer: string
//   type: "multiple" | "short"
//   options?: string[]
// }

// interface QuestionCardProps {
//   question: Question
//   index: number
//   onRemove: (id: string) => void
// }

// export default function QuestionCard({ question, index, onRemove }: QuestionCardProps) {
//   const displayQuestionType = (type: "multiple" | "short") => {
//     return type === "multiple" ? "Multiple Choice" : "Short Answer"
//   }

//   return (
//     <div className="bg-[#222222] rounded-lg p-5 space-y-4 relative">
//       <Button
//         variant="ghost"
//         size="icon"
//         className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
//         onClick={() => onRemove(question.id)}
//       >
//         <X size={16} />
//       </Button>
//       <div>
//         <h4 className="font-medium mb-2">Question {index + 1}:</h4>
//         <p className="mb-1">{question.question}</p>
//         {question.type === "multiple" && question.options && (
//           <div className="mt-2 space-y-2">
//             {question.options.map((option, i) => (
//               <div key={i} className="flex items-center gap-2">
//                 <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                 <span>{option}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div>
//         <p className="font-medium">
//           Answer: <span className="font-normal">{question.answer}</span>
//         </p>
//       </div>

//       <div>
//         <p className="font-medium">
//           Type: <span className="font-normal">{displayQuestionType(question.type)}</span>
//         </p>
//       </div>
//     </div>
//   )
// }
