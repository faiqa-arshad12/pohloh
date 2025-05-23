// "use client";

// import { useState } from "react";
// import { PlusIcon, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";

// interface QuestionModalProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   onAddQuestion: (question: {
//     question: string;
//     answer: string;
//     source: string;
//     type: "Multiple Choice" | "Short Answer";
//     options?: string[];
//   }) => void;
//   defaultSource: string;
//   defaultQuestionStyle: "Multiple Choice" | "Short Answer";
// }

// export default function QuestionModal({
//   isOpen,
//   onOpenChange,
//   onAddQuestion,
//   defaultSource,
//   defaultQuestionStyle,
// }: QuestionModalProps) {
//   const [newQuestion, setNewQuestion] = useState({
//     question: "",
//     answer: "",
//     source: defaultSource,
//     type: defaultQuestionStyle,
//     options: defaultQuestionStyle === "Multiple Choice" ? ["", "", "", ""] : undefined,
//   });

//   const handleQuestionInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setNewQuestion((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleOptionChange = (index: number, value: string) => {
//     setNewQuestion((prev) => {
//       if (!prev.options) return prev;
//       const updatedOptions = [...prev.options];
//       updatedOptions[index] = value;
//       return {
//         ...prev,
//         options: updatedOptions,
//       };
//     });
//   };

//   const handleQuestionTypeChange = (
//     type: "Multiple Choice" | "Short Answer"
//   ) => {
//     setNewQuestion((prev) => ({
//       ...prev,
//       type,
//       options: type === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     }));
//   };

//   const handleAddQuestion = () => {
//     if (!newQuestion.question || !newQuestion.answer) return;

//     onAddQuestion({
//       question: newQuestion.question,
//       answer: newQuestion.answer,
//       source: newQuestion.source,
//       type: newQuestion.type,
//       options: newQuestion.options,
//     });

//     // Reset form
//     setNewQuestion({
//       question: "",
//       answer: "",
//       source: defaultSource,
//       type: defaultQuestionStyle,
//       options: defaultQuestionStyle === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     });

//     onOpenChange(false);
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="bg-[#1a1a1a] text-white border-[#333] max-w-2xl font-urbanist">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-medium">
//             Add New Question
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           <div className="space-y-2">
//             <label htmlFor="question" className="block text-sm font-medium">
//               Question
//             </label>
//             <Textarea
//               id="question"
//               name="question"
//               placeholder="Enter your question"
//               value={newQuestion.question}
//               onChange={handleQuestionInputChange}
//               className="bg-[#2a2a2a] border-[#333] text-white min-h-[100px]"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium">
//               Question Type
//             </label>
//             <div className="flex gap-2">
//               <Button
//                 variant={
//                   newQuestion.type === "Multiple Choice"
//                     ? "default"
//                     : "outline"
//                 }
//                 className={
//                   newQuestion.type === "Multiple Choice"
//                     ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
//                     : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                 }
//                 onClick={() => handleQuestionTypeChange("Multiple Choice")}
//               >
//                 Multiple Choice
//               </Button>
//               <Button
//                 variant={
//                   newQuestion.type === "Short Answer"
//                     ? "default"
//                     : "outline"
//                 }
//                 className={
//                   newQuestion.type === "Short Answer"
//                     ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
//                     : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                 }
//                 onClick={() => handleQuestionTypeChange("Short Answer")}
//               >
//                 Short Answer
//               </Button>
//             </div>
//           </div>

//           {newQuestion.type === "Multiple Choice" && newQuestion.options && (
//             <div className="space-y-3">
//               <label className="block text-sm font-medium">Options</label>
//               {newQuestion.options.map((option, index) => (
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
//             </div>
//           )}

//           <div className="space-y-2">
//             <label htmlFor="answer" className="block text-sm font-medium">
//               Correct Answer
//             </label>
//             <Input
//               id="answer"
//               name="answer"
//               placeholder="Enter the correct answer"
//               value={newQuestion.answer}
//               onChange={handleQuestionInputChange}
//               className="bg-[#2a2a2a] border-[#333] text-white"
//             />
//           </div>
//         </div>

//         <DialogFooter className="flex justify-end gap-2">
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//             className="border-gray-600 text-white hover:bg-[#333] hover:text-white"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleAddQuestion}
//             className="bg-[#f0d568] text-black hover:bg-[#e0c558]"
//             disabled={!newQuestion.question || !newQuestion.answer}
//           >
//             Add Question
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }