// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Minus, Plus } from "lucide-react"
// import { useRouter } from "next/navigation"
// import VerificationPeriodPicker from "./verification-picker"

// type Team = {
//   id: string
//   name: string
//   org_id: string
//   lead_id: string | null
//   user_id: string | null
//   created_at: string
//   icon: string | null
// }

// type User = {
//   id: string
//   created_at: string
//   user_name: string
//   first_name: string
//   last_name: string
//   email: string
//   user_id: string
//   org_id: string
//   role: string
//   user_role: string
//   location: string
//   status: string
//   profile_picture: string
//   num_of_days: any[]
//   num_of_questions: number
//   num_of_card: number
//   week_days: string[] | null
//   team_id: string | null
//   users_team: any | null
// }

// // Update the PathFormData type to include a validation method
// export type PathFormData = {
//   pathTitle: string
//   owner: string
//   ownerId: string
//   category: string
//   categoryId: string
//   questionsPerCard: number
//   questionStyle: "Multiple Choice" | "Short Answer"
//   cardsSelected: number
//   totalQuestions: number
//   verificationPeriod: string
//   customDate: Date | null
// }

// type PathFormProps = {
//   teams: Team[]
//   users: User[]
//   onSubmit: (formData: PathFormData) => void
//   onSaveAsDraft: () => void
//   selectedCards:any[] |null
//   id?:string,
//   data?:any
// }

// export default function PathForm({ teams, users, onSubmit, onSaveAsDraft, selectedCards , id, data}: PathFormProps) {
//   const router = useRouter()
//   const [formData, setFormData] = useState<PathFormData>({
//     pathTitle: "",
//     owner: "",
//     ownerId: "",
//     category: teams.length > 0 ? teams[0].name : "",
//     categoryId: teams.length > 0 ? teams[0].id : "",
//     questionsPerCard: 5,
//     questionStyle: "Multiple Choice",
//     cardsSelected: 10,
//     totalQuestions: 50,
//     verificationPeriod: "",
//     customDate: null,
//   })
//   useEffect(()=>{
//     if(id)
//       setFormData

//   },[data, id])

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})

//   useEffect(() => {
//     // Initialize with first team if available
//     if (teams.length > 0 && !formData.categoryId) {
//       setFormData((prev) => ({
//         ...prev,
//         category: teams[0].name,
//         categoryId: teams[0].id,
//       }))
//     }
//   }, [teams])
//   useEffect(()=>{
// if(id){
//   setFormData((prev) => ({
//     ...prev,
//     category: teams[0].name,
//     categoryId: teams[0].id,
//   }))
// }
//   },[id])

//   // Update total questions when relevant values change
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       totalQuestions: prev.cardsSelected * prev.questionsPerCard,
//     }))
//   }, [formData.cardsSelected, formData.questionsPerCard])

//   // Add a useEffect to update cardsSelected when a card is selected
//   useEffect(() => {
//     if (selectedCards) {
//       setFormData((prev) => ({
//         ...prev,
//         cardsSelected: 1, // Update this if you support multiple cards
//       }))
//     }
//   }, [selectedCards])

//   const validateForm = () => {
//     const errors: Record<string, string> = {}

//     if (!formData.pathTitle.trim()) {
//       errors.pathTitle = "Learning Path Title is required"
//     } else if (formData.pathTitle.trim().length < 4) {
//       errors.pathTitle = "Title must be at least 4 characters long"
//     } else if (formData.pathTitle.trim().length > 50) {
//       errors.pathTitle = "Title must be no more than 50 characters long"
//     }

//     if (!formData.ownerId) {
//       errors.owner = "Path Owner is required"
//     }

//     if (!formData.categoryId) {
//       errors.category = "Category is required"
//     }

//     if (!formData.verificationPeriod) {
//       errors.verificationPeriod = "Verification Period is required"
//     }

//     if (!selectedCards) {
//       errors.trainingContent = "Please select at least one training card"
//     }

//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     if (name === "category") {
//       const selectedTeam = teams.find((team) => team.name === value)
//       if (selectedTeam) {
//         setFormData((prev) => ({
//           ...prev,
//           category: value,
//           categoryId: selectedTeam.id,
//         }))
//         setFormErrors((prev) => ({ ...prev, category: "" }))
//       }
//     } else if (name === "owner") {
//       const selectedUser = users.find((user) => `${user.first_name} ${user.last_name}` === value)
//       if (selectedUser) {
//         setFormData((prev) => ({
//           ...prev,
//           owner: value,
//           ownerId: selectedUser.id,
//         }))
//         setFormErrors((prev) => ({ ...prev, owner: "" }))
//       }
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }))
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData({
//       ...formData,
//       [name]: value,
//     })

//     if (name === "pathTitle") {
//       if (!value.trim()) {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "Learning Path Title is required" }))
//       } else if (value.trim().length < 4) {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "Title must be at least 4 characters long" }))
//       } else if (value.trim().length > 10) {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "Title must be no more than 10 characters long" }))
//       } else {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "" }))
//       }
//     }
//   }

//   // Update the incrementQuestions and decrementQuestions functions to have a reasonable limit
//   const incrementQuestions = () => {
//     if (formData.questionsPerCard < 20) {
//       // Set a reasonable upper limit
//       setFormData((prev) => ({
//         ...prev,
//         questionsPerCard: prev.questionsPerCard + 1,
//       }))
//     }
//   }

//   const decrementQuestions = () => {
//     if (formData.questionsPerCard > 1) {
//       setFormData((prev) => ({
//         ...prev,
//         questionsPerCard: Math.max(1, prev.questionsPerCard - 1),
//       }))
//     }
//   }

//   const handleQuestionStyleChange = (style: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       questionStyle: style as "Multiple Choice" | "Short Answer",
//     }))
//   }

//   const handleSubmit = () => {
//     if (validateForm()) {
//       onSubmit(formData)
//     }
//   }

//   return (
//     <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 font-urbanist">
//       <div className="space-y-2">
//         <label htmlFor="pathTitle" className="block text-sm">
//           Learning Path Title
//         </label>
//         <Input
//           id="pathTitle"
//           name="pathTitle"
//           placeholder="Insert Title"
//           value={formData.pathTitle}
//           onChange={handleInputChange}
//           className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
//         />
//         {formErrors.pathTitle && <p className="text-red-500 text-xs">{formErrors.pathTitle}</p>}
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="owner" className="block text-sm">
//           Enter Path Owner
//         </label>
//         <Select
//           value={formData.ownerId}
//           onValueChange={(value) => {
//             const selectedUser = users.find((user) => user.id === value)
//             if (selectedUser) {
//               setFormData((prev) => ({
//                 ...prev,
//                 owner: `${selectedUser.first_name} ${selectedUser.last_name}`,
//                 ownerId: selectedUser.id,
//               }))
//               setFormErrors((prev) => ({ ...prev, owner: "" }))
//             }
//           }}
//         >
//           <SelectTrigger
//             className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
//             style={{ height: "44px" }}
//           >
//             <SelectValue placeholder="Select path owner" />
//           </SelectTrigger>
//           <SelectContent className="bg-[#2C2D2E] border-none text-white">
//             {users.map((user) => (
//               <SelectItem
//                 key={user.id}
//                 value={user.id}
//                 className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
//               >
//                 {`${user.first_name} ${user.last_name}`}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {formErrors.owner && <p className="text-red-500 text-xs">{formErrors.owner}</p>}
//       </div>

//       <div className="space-y-2">
//         <label htmlFor="category" className="block text-sm">
//           Select Category
//         </label>
//         <div className="relative">
//           <Select
//             value={formData.category}
//             onValueChange={(value) => {
//               handleSelectChange("category", value)
//               setFormErrors((prev) => ({ ...prev, category: "" }))
//             }}
//           >
//             <SelectTrigger
//               className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
//               style={{ height: "44px" }}
//             >
//               <SelectValue placeholder="Select category" />
//             </SelectTrigger>
//             <SelectContent className="bg-[#2C2D2E] border-none text-white">
//               {teams.map((team) => (
//                 <SelectItem key={team.id} value={team.name} className="">
//                   {team.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
//       </div>

//       <div className="space-y-2">
//         <VerificationPeriodPicker
//           value={formData.verificationPeriod}
//           onChange={(value) => {
//             setFormData((prev) => ({ ...prev, verificationPeriod: value }))
//             setFormErrors((prev) => ({ ...prev, verificationPeriod: "" }))
//           }}
//           dateValue={formData.customDate}
//           onDateChange={(date) => setFormData((prev) => ({ ...prev, customDate: date }))}
//           error={formErrors.verificationPeriod}
//         />
//       </div>

//       <div className="space-y-2">
//         <label className="block text-sm">Choose Training Content</label>
//         <Button
//           variant="outline"
//           className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
//           onClick={() => {
//             router.push("/knowledge-base?selectForLearningPath=true")
//           }}
//         >
//           Select Cards
//         </Button>
//         {selectedCards && (
//           <p className="text-green-500 text-xs">Card selected: {selectedCards?.length||0}</p>
//         )}
//         {formErrors.trainingContent && <p className="text-red-500 text-xs">{formErrors.trainingContent}</p>}
//       </div>

//       <div className="space-y-2">
//         <label className="block text-sm">Number of Questions per card</label>
//         <div className="flex items-center bg-[#FFFFFF14] rounded-[6px] w-[130px] border border-[#F9DB6F]">
//           <Button
//             variant="outline"
//             size="icon"
//             className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
//             onClick={incrementQuestions}
//           >
//             <Plus size={16} />
//           </Button>
//           <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568] hover:text-[#f0d568] cursor-pointer">
//             {formData.questionsPerCard}
//           </div>
//           <Button
//             variant="outline"
//             size="icon"
//             disabled={formData.questionsPerCard <= 5}
//             className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
//             onClick={decrementQuestions}
//           >
//             <Minus size={16} />
//           </Button>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label className="block text-sm">Choose Questions per style</label>
//         <div className="flex gap-2">
//           <Button
//             variant={formData.questionStyle === "Multiple Choice" ? "default" : "outline"}
//             className={
//               formData.questionStyle === "Multiple Choice"
//                 ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
//                 : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//             }
//             onClick={() => handleQuestionStyleChange("Multiple Choice")}
//           >
//             Multiple Choice
//           </Button>
//           <Button
//             variant={formData.questionStyle === "Short Answer" ? "default" : "outline"}
//             className={
//               formData.questionStyle === "Short Answer"
//                 ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
//                 : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//             }
//             onClick={() => handleQuestionStyleChange("Short Answer")}
//           >
//             Short Answer
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col pt-4 space-y-3 justify-center items-center">
//         <Button
//           className="w-full bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium h-12 rounded-md cursor-pointer"
//           onClick={handleSubmit}
//         >
//           Generate Path
//         </Button>
//         <Button
//           variant="outline"
//           className="w-full border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer"
//           onClick={onSaveAsDraft}
//         >
//           Save as Draft
//         </Button>
//       </div>
//     </div>
//   )
// }
