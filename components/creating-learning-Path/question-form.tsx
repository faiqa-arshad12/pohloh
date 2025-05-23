// "use client";

// import type React from "react";

// import {useState} from "react";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Textarea} from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";

// // / Update the Question type to include the database question type
// export type Question = {
//   id: string
//   question: string
//   answer: string
//   source: string
//   type: "Multiple Choice" | "Short Answer"
//   type_db?: "multiple" | "short"
//   options?: string[]
// }

// type QuestionFormProps = {
//   isOpen: boolean
//   onClose: () => void
//   onAdd: (question: Question) => void
//   defaultType: "Multiple Choice" | "Short Answer"
//   defaultSource?: string
// }

// export default function QuestionForm({ isOpen, onClose, onAdd, defaultType, defaultSource = "" }: QuestionFormProps) {
//   const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
//     question: "",
//     answer: "",
//     source: defaultSource,
//     type: defaultType,
//     options: defaultType === "Multiple Choice" ? ["", "", "", ""] : undefined,
//   })

//   const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setNewQuestion((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleOptionChange = (index: number, value: string) => {
//     setNewQuestion((prev) => {
//       const updatedOptions = [...(prev.options || ["", "", "", ""])]
//       updatedOptions[index] = value
//       return {
//         ...prev,
//         options: updatedOptions,
//       }
//     })
//   }

//   const handleQuestionTypeChange = (type: "Multiple Choice" | "Short Answer") => {
//     setNewQuestion((prev) => ({
//       ...prev,
//       type,
//       options: type === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     }))
//   }

//   // In the addQuestion function, add the type_db field
//   const addQuestion = () => {
//     if (!newQuestion.question || !newQuestion.answer) return

//     const questionToAdd: Question = {
//       id: `question_${Date.now()}`,
//       question: newQuestion.question || "",
//       answer: newQuestion.answer || "",
//       source: newQuestion.source || "",
//       type: newQuestion.type as "Multiple Choice" | "Short Answer",
//       type_db: newQuestion.type === "Multiple Choice" ? "multiple" : "short",
//       options: newQuestion.type === "Multiple Choice" ? newQuestion.options : undefined,
//     }

//     onAdd(questionToAdd)
//     resetForm()
//     onClose()
//   }

//   const resetForm = () => {
//     setNewQuestion({
//       question: "",
//       answer: "",
//       source: defaultSource,
//       type: defaultType,
//       options: defaultType === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     })
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="bg-[#1a1a1a] text-white border-[#333] max-w-2xl font-urbanist">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-medium">Add New Question</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           <div className="space-y-2">
//             <label htmlFor="question" className="block text-sm font-medium">
//               Question <span className="text-red-500">*</span>
//             </label>
//             <Textarea
//               id="question"
//               name="question"
//               placeholder="Enter your question"
//               value={newQuestion.question}
//               onChange={handleQuestionInputChange}
//               className="bg-[#2a2a2a] border-[#333] text-white min-h-[100px]"
//             />
//             {!newQuestion.question && <p className="text-xs text-amber-500">Question is required</p>}
//           </div>

//           {newQuestion.type === "Multiple Choice" && (
//             <div className="space-y-3">
//               <label className="block text-sm font-medium">
//                 Options <span className="text-red-500">*</span>
//               </label>
//               {newQuestion.options?.map((option, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                   <Input
//                     value={option}
//                     onChange={(e) => handleOptionChange(index, e.target.value)}
//                     placeholder={`Option ${index + 1}`}
//                     className="bg-[#2a2a2a] border-[#333] text-white"
//                   />
//                 </div>
//               ))}
//               {newQuestion.options?.every((opt) => !opt) && (
//                 <p className="text-xs text-amber-500">At least one option is required</p>
//               )}
//             </div>
//           )}

//           <div className="space-y-2">
//             <label htmlFor="answer" className="block text-sm font-medium">
//               Correct Answer <span className="text-red-500">*</span>
//             </label>
//             <Input
//               id="answer"
//               name="answer"
//               placeholder="Enter the correct answer"
//               value={newQuestion.answer}
//               onChange={handleQuestionInputChange}
//               className="bg-[#2a2a2a] border-[#333] text-white"
//             />
//             {!newQuestion.answer && <p className="text-xs text-amber-500">Answer is required</p>}
//           </div>
//         </div>

//         <DialogFooter className="flex justify-end gap-2">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             className="border-gray-600 text-white hover:bg-[#333] hover:text-white"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={addQuestion}
//             className="bg-[#f0d568] text-black hover:bg-[#e0c558]"
//             disabled={
//               !newQuestion.question ||
//               !newQuestion.answer ||
//               (newQuestion.type === "Multiple Choice" && newQuestion.options?.every((opt) => !opt))
//             }
//           >
//             Add Question
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
