// "use client";

// import {PlusIcon} from "lucide-react";
// import {Button} from "../ui/button";
// import QuestionDisplay from "./question-display";
// import {Question} from "@/types/types";

// export type PathFormData = {
//   pathTitle: string;
//   category: string;
//   owner: string;
//   questionsPerCard: number;
//   cardsSelected: number;
//   totalQuestions: number;
//   questionStyle: string;
// };

// // Update the PathPreviewProps to include maxQuestions and apiData
// type PathPreviewProps = {
//   formData: PathFormData;
//   questions: Question[];
//   onAddQuestion: () => void;
//   onRemoveQuestion: (id: string) => void;
//   isPublishing?: boolean;
//   apiData: any;
// };

// export default function PathPreview({
//   formData,
//   questions,
//   onAddQuestion,
//   onRemoveQuestion,
//   isPublishing,
//   apiData,
// }: PathPreviewProps) {
//   // Use API data if available, otherwise use form data
//   const displayData: any = formData;
//   const displayQuestions = questions || questions;

//   const questionsNeeded =
//     displayData.questionsPerCard * displayData.cardsSelected;
//   const questionsRemaining = questionsNeeded - displayQuestions.length;
//   const hasEnoughQuestions =
//     displayQuestions.length >= displayData.questionsPerCard;
//   const hasReachedLimit = displayQuestions.length >= questionsNeeded;
// console.log(formData)
//   return (
//     <div className="w-full bg-[#1a1a1a] rounded-lg p-6 text-white min-h-[500px] font-urbanist">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-medium">
//           {/* {apiData ? "Edit Learning Path" : "Preview"} -{" "} */}
//           <span className="text-gray-400">
//             [ {displayData?.title || "Learning Path"} ]
//           </span>
//         </h2>
//         <Button
//           variant="outline"
//           className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-12 rounded-md flex items-center gap-2 cursor-pointer"
//           onClick={onAddQuestion}
//           disabled={hasReachedLimit}
//         >
//           <PlusIcon size={16} /> Add Questions
//         </Button>
//       </div>

//       <div className="font-medium text-[36px] text-[#7C7C7C] mb-4">
//         [ {displayData.category || "Select a category"} ]
//       </div>

//       <div className="mb-6">
//         <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
//           Requirements:
//         </h3>
//         <div className="space-y-1 text-gray-200">
//           {/* <p>&gt; Number of Cards selected : {displayData.cardsSelected.length}</p> */}
//           <p>&gt; Questions per card : {displayData.questionsPerCard}</p>
//           <p>&gt; Total Path Questions: {displayData.totalQuestions}</p>
//           <p>&gt; Questions Styles: {displayData.questionStyle}</p>
//           {displayData.owner && <p>&gt; Path Owner: {displayData.owner}</p>}
//           {apiData?.id && <p>&gt; Path ID: {apiData.id}</p>}
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="flex justify-between items-center">
//           <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">
//             Training Content:
//           </h3>
//           <div className="text-sm">
//             {hasReachedLimit ? (
//               <span className="text-green-500">
//                 All required questions added ({displayQuestions.length}/
//                 {questionsNeeded})
//               </span>
//             ) : (
//               <span
//                 className={
//                   isPublishing && !hasEnoughQuestions
//                     ? "text-red-500"
//                     : "text-yellow-500"
//                 }
//               >
//                 {questionsRemaining} more question
//                 {questionsRemaining !== 1 ? "s" : ""} needed
//               </span>
//             )}
//           </div>
//         </div>

//         {isPublishing && !hasEnoughQuestions && (
//           <div className="bg-red-500/20 border border-red-500 rounded-md p-3 mb-4 text-red-200">
//             <p>
//               You need to add at least {displayData.questionsPerCard} questions
//               before publishing.
//             </p>
//           </div>
//         )}

//         <QuestionDisplay
//           questions={displayQuestions}
//           onRemove={onRemoveQuestion}
//         />
//       </div>
//     </div>
//   );
// }
