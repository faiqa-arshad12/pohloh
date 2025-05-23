// "use client";

// import {PlusIcon, X} from "lucide-react";
// import {Button} from "@/components/ui/button";
// import {Question} from "@/types/types";

// interface PathPreviewProps {
//   pathTitle: string;
//   category: string;
//   cardsSelected: number;
//   questionsPerCard: number;
//   totalQuestions: number;
//   questionStyle: string;
//   owner?: string;
//   questions: Question[];
//   onAddQuestion: () => void;
//   onRemoveQuestion: (id: string) => void;
// }

// export default function PathPreview({
//   pathTitle,
//   category,
//   cardsSelected,
//   questionsPerCard,
//   totalQuestions,
//   questionStyle,
//   owner,
//   questions,
//   onAddQuestion,
//   onRemoveQuestion,
// }: PathPreviewProps) {
//   return (
//     <div className="h-[auto] w-full font-urbanist ">
//       <div className="w-full bg-[#1a1a1a] rounded-lg   relative h-full min-h-[400px]">
//         <h2 className="text-2xl font-medium">
//           Preview -{" "}
//           <span className="text-gray-400">
//             [ {pathTitle || "Learning Path"} ]
//           </span>
//         </h2>
//         <Button
//           variant="outline"
//           className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-12 rounded-md flex items-center gap-2 cursor-pointer"
//           onClick={onAddQuestion}
//         >
//           <PlusIcon size={16} /> Add Questions
//         </Button>
//       </div>

//       <div className="font-medium text-[36px] text-[#7C7C7C] mb-4">
//         [ {category || "Select a category"} ]
//       </div>

//       <div className="mb-6">
//         <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
//           Requirements:
//         </h3>
//         <div className="space-y-1 text-gray-200">
//           <p>&gt; Number of Cards selected : {cardsSelected}</p>
//           <p>&gt; Questions per card : {questionsPerCard}</p>
//           <p>&gt; Total Path Questions: {totalQuestions}</p>
//           <p>&gt; Questions Styles: {questionStyle}</p>
//           {owner && <p>&gt; Path Owner: {owner}</p>}
//         </div>
//       </div>

//       <div>
//         <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
//           Training Content:
//         </h3>
//         <div className="space-y-4">
//           {questions.map((q, index) => (
//             <div
//               key={q.id}
//               className="bg-[#222222] rounded-lg p-5 space-y-4 relative"
//             >
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
//                 onClick={() => onRemoveQuestion(q.id)}
//               >
//                 <X size={16} />
//               </Button>
//               <div>
//                 <h4 className="font-medium mb-2">Question {index + 1}:</h4>
//                 <p className="mb-1">{q.question}</p>
//                 {q.type === "Multiple Choice" && q.options && (
//                   <div className="mt-2 space-y-2">
//                     {q.options.map((option, i) => (
//                       <div key={i} className="flex items-center gap-2">
//                         <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                         <span>{option}</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <p className="font-medium">
//                   Answer: <span className="font-normal">{q.answer}</span>
//                 </p>
//               </div>

//               <div>
//                 <p className="font-medium">
//                   Type: <span className="font-normal">{q.type}</span>
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
