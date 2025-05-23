// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Minus, Plus, X, ArrowLeft } from "lucide-react"
// import { useUser } from "@clerk/nextjs"
// import VerificationPeriodPicker from "@/components/learning-path/verification-period-picker"
// import { apiUrl } from "@/utils/constant"
// import { PlusIcon } from "@heroicons/react/24/solid"

// // Types
// type Question = {
//   id: string
//   question: string
//   answer: string
//   type: "Multiple Choice" | "Short Answer"
//   options?: string[]
// }

// type PathFormData = {
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

// export default function LearningPathPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const pathId = searchParams.get("id")
//   const isEditing = !!pathId

//   // State for selected cards
//   const [selectedCards, setSelectedCards] = useState<any[] | null>(null)

//   // State for teams and users data
//   const [teams, setTeams] = useState<any[]>([])
//   const [users, setUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [orgId, setOrgId] = useState<string>("")

//   // API data state for editing
//   const [apiData, setApiData] = useState<any>(null)

//   // Form data state
//   const [formData, setFormData] = useState<PathFormData>({
//     pathTitle: "",
//     owner: "",
//     ownerId: "",
//     category: "",
//     categoryId: "",
//     questionsPerCard: 5,
//     questionStyle: "Multiple Choice",
//     cardsSelected: 10,
//     totalQuestions: 50,
//     verificationPeriod: "",
//     customDate: null,
//   })

//   // Form validation
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({})

//   // Questions state
//   const [questions, setQuestions] = useState<Question[]>([])

//   // Question modal state
//   const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
//   const [currentQuestion, setCurrentQuestion] = useState<Question>({
//     id: "",
//     question: "",
//     answer: "",
//     type: "Multiple Choice",
//     options: ["", "", "", ""],
//   })

//   // UI-specific states
//   const [pathGenerated, setPathGenerated] = useState(false)
//   const [isPublishing, setIsPublishing] = useState(false)
//   const { user } = useUser()

//   // Fetch teams, users, and path data (if editing) on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user) return

//       try {
//         setLoading(true)

//         // Fetch user data to get organization ID
//         const userResponse = await fetch(`${apiUrl}/users/${user.id}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         })

//         if (!userResponse.ok) {
//           throw new Error("Failed to fetch user data")
//         }

//         const userData = await userResponse.json()
//         const userOrgId = userData.user.organizations?.id

//         if (!userOrgId) {
//           console.error("No organization ID found")
//           return
//         }

//         setOrgId(userOrgId)

//         // Fetch teams and users data
//         const [usersResponse, teamsResponse] = await Promise.all([
//           fetch(`${apiUrl}/users/organizations/${userOrgId}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           }),
//           fetch(`${apiUrl}/teams/organizations/${userOrgId}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           }),
//         ])

//         if (!usersResponse.ok || !teamsResponse.ok) {
//           throw new Error("Failed to fetch users or teams data")
//         }

//         const usersData = await usersResponse.json()
//         const teamsData = await teamsResponse.json()

//         setUsers(usersData.data)
//         setTeams(teamsData.teams)

//         // If editing, fetch the learning path data
//         if (pathId) {
//           try {
//             const pathResponse = await fetch(`${apiUrl}/learning-paths/${pathId}`, {
//               method: "GET",
//               headers: { "Content-Type": "application/json" },
//               credentials: "include",
//             })

//             if (!pathResponse.ok) {
//               throw new Error("Failed to fetch learning path data")
//             }

//             const pathData = await pathResponse.json()
//             const { learningPath, cardLearningPaths } = pathData.path

//             // Set API data for reference
//             setApiData(learningPath)

//             // Set form data from API response
//             setFormData({
//               pathTitle: learningPath.title || "",
//               owner: learningPath.path_owner?.first_name
//                 ? `${learningPath.path_owner.first_name} ${learningPath.path_owner.last_name}`
//                 : "",
//               ownerId: learningPath.path_owner?.id || "",
//               category: learningPath.category?.name || "",
//               categoryId: learningPath.category?.id || "",
//               questionsPerCard: learningPath.num_of_questions || 5,
//               questionStyle: learningPath.question_type || "Multiple Choice",
//               cardsSelected: cardLearningPaths?.length || 0,
//               totalQuestions: (learningPath.num_of_questions || 5) * (cardLearningPaths?.length || 0),
//               verificationPeriod: learningPath.verification_period ? "custom" : "",
//               customDate: learningPath.verification_period ? new Date(learningPath.verification_period) : null,
//             })

//             // Set questions from API data
//             if (learningPath.questions) {
//               setQuestions(learningPath.questions)
//             }

//             // Set selected cards from API data
//             if (cardLearningPaths) {
//               setSelectedCards(cardLearningPaths)
//             }

//             // Set path as generated since we're editing
//             setPathGenerated(true)
//           } catch (error) {
//             console.error("Error fetching learning path:", error)
//             showToast(error instanceof Error ? error.message : "Failed to fetch learning path", "error")
//           }
//         } else {
//           // Check for selected cards in localStorage for new paths
//           const savedCards = localStorage.getItem("selectedLearningPathCards")
//           if (savedCards) {
//             setSelectedCards(JSON.parse(savedCards))
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching initial data:", error)
//         showToast(error instanceof Error ? error.message : "Failed to load initial data", "error")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [user, pathId])

//   // Update total questions when relevant values change
//   useEffect(() => {
//     setFormData((prev) => ({
//       ...prev,
//       totalQuestions: prev.cardsSelected * prev.questionsPerCard,
//     }))
//   }, [formData.cardsSelected, formData.questionsPerCard])

//   // Update cardsSelected when cards are selected
//   useEffect(() => {
//     if (selectedCards) {
//       setFormData((prev) => ({
//         ...prev,
//         cardsSelected: selectedCards.length,
//       }))
//     }
//   }, [selectedCards])

//   // Simple toast function
//   const showToast = (message: string, type: "success" | "error") => {
//     // You can replace this with your actual toast implementation
//     console.log(`[${type}] ${message}`)
//     alert(`${message}`)
//   }

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

//     if (!selectedCards || selectedCards.length === 0) {
//       errors.trainingContent = "Please select at least one training card"
//     }

//     setFormErrors(errors)
//     return Object.keys(errors).length === 0
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
//       } else if (value.trim().length > 50) {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "Title must be no more than 50 characters long" }))
//       } else {
//         setFormErrors((prev) => ({ ...prev, pathTitle: "" }))
//       }
//     }
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

//   const incrementQuestions = () => {
//     if (formData.questionsPerCard < 20) {
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

//   const prepareLearningPathData = (status: "draft" | "generated" | "published") => {
//     // Format the verification period date
//     let verificationPeriod = null
//     if (formData.verificationPeriod === "custom" && formData.customDate) {
//       verificationPeriod = formData.customDate.toISOString()
//     } else if (formData.verificationPeriod) {
//       const today = new Date()
//       switch (formData.verificationPeriod) {
//         case "1week":
//           verificationPeriod = new Date(today.setDate(today.getDate() + 7)).toISOString()
//           break
//         case "2week":
//           verificationPeriod = new Date(today.setDate(today.getDate() + 14)).toISOString()
//           break
//         case "1month":
//           verificationPeriod = new Date(today.setMonth(today.getMonth() + 1)).toISOString()
//           break
//         case "6months":
//           verificationPeriod = new Date(today.setMonth(today.getMonth() + 6)).toISOString()
//           break
//         case "12months":
//           verificationPeriod = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString()
//           break
//       }
//     }

//     // Prepare the learning path data
//     return {
//       title: formData.pathTitle,
//       path_owner: formData.ownerId,
//       category: formData.categoryId,
//       num_of_questions: formData.questionsPerCard,
//       question_type: formData.questionStyle,
//       verification_period: verificationPeriod,
//       status: status,
//       org_id: orgId,
//       questions: questions,
//       cards: selectedCards?.map((card) => card.id || card.card?.id) || [],
//     }
//   }

//   const handleGeneratePath = async () => {
//     if (!validateForm()) {
//       showToast("Please fix the errors in the form", "error")
//       return
//     }

//     try {
//       setLoading(true)

//       // For editing, we don't need to generate a new path
//       if (isEditing) {
//         setPathGenerated(true)
//         showToast("Path ready for editing", "success")
//         return
//       }

//       // Prepare data for submission
//       const learningPathData = prepareLearningPathData("generated")

//       // Submit to API
//       const response = await fetch(`${apiUrl}/learning-paths`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(learningPathData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to generate path")
//       }

//       const result = await response.json()

//       // If we get a path ID back, update the URL
//       if (result && result.id) {
//         router.push(`/learning-path?id=${result.id}`)
//       }

//       setPathGenerated(true)
//       showToast("Path Generated Successfully", "success")
//     } catch (error) {
//       console.error("Error generating path:", error)
//       showToast(error instanceof Error ? error.message : "Failed to generate path", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handlePublish = async () => {
//     setIsPublishing(true)

//     if (questions.length < formData.questionsPerCard) {
//       showToast(`Please add at least ${formData.questionsPerCard} questions before publishing`, "error")
//       setIsPublishing(false)
//       return
//     }

//     try {
//       setLoading(true)

//       // Prepare data for submission
//       const learningPathData = prepareLearningPathData("published")

//       // If we're updating an existing path, include the ID
//       if (pathId) {
//         learningPathData.id = pathId
//       }

//       // Submit to API
//       const response = await fetch(`${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`, {
//         method: pathId ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(learningPathData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to publish path")
//       }

//       showToast(pathId ? "Learning path updated successfully!" : "Learning path published successfully!", "success")

//       // Redirect to the learning paths page
//       router.push("/tutor/explore-learning-paths")
//     } catch (error) {
//       console.error("Error publishing path:", error)
//       showToast(error instanceof Error ? error.message : "Failed to publish path", "error")
//     } finally {
//       setLoading(false)
//       setIsPublishing(false)
//     }
//   }

//   const handleSaveAsDraft = async () => {
//     if (!validateForm()) {
//       showToast("Please fix the errors in the form", "error")
//       return
//     }

//     try {
//       setLoading(true)

//       // Prepare data for submission
//       const learningPathData = prepareLearningPathData("draft")

//       // If we're updating an existing path, include the ID
//       if (pathId) {
//         learningPathData.id = pathId
//       }

//       // Submit to API
//       const response = await fetch(`${apiUrl}/learning-paths${pathId ? `/${pathId}` : ""}`, {
//         method: pathId ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify(learningPathData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.message || "Failed to save draft")
//       }

//       showToast("Learning path saved as draft", "success")
//       router.push("/tutor/drafts")
//     } catch (error) {
//       console.error("Error saving draft:", error)
//       showToast(error instanceof Error ? error.message : "Failed to save draft", "error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Question management
//   const openQuestionModal = () => {
//     const questionsNeeded = formData.questionsPerCard * formData.cardsSelected
//     if (questions.length >= questionsNeeded) {
//       showToast(`You've reached the maximum number of questions (${questionsNeeded})`, "error")
//       return
//     }
//     setCurrentQuestion({
//       id: crypto.randomUUID(),
//       question: "",
//       answer: "",
//       type: formData.questionStyle,
//       options: formData.questionStyle === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     })
//     setIsQuestionModalOpen(true)
//   }

//   const closeQuestionModal = () => {
//     setIsQuestionModalOpen(false)
//   }

//   const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setCurrentQuestion((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleOptionChange = (index: number, value: string) => {
//     setCurrentQuestion((prev) => {
//       const newOptions = [...(prev.options || [])]
//       newOptions[index] = value
//       return {
//         ...prev,
//         options: newOptions,
//       }
//     })
//   }

//   const handleQuestionTypeChange = (type: "Multiple Choice" | "Short Answer") => {
//     setCurrentQuestion((prev) => ({
//       ...prev,
//       type,
//       options: type === "Multiple Choice" ? ["", "", "", ""] : undefined,
//     }))
//   }

//   const addQuestion = () => {
//     if (!currentQuestion.question.trim()) {
//       showToast("Question text is required", "error")
//       return
//     }

//     if (!currentQuestion.answer.trim()) {
//       showToast("Answer is required", "error")
//       return
//     }

//     if (
//       currentQuestion.type === "Multiple Choice" &&
//       (!currentQuestion.options || currentQuestion.options.filter((o) => o.trim()).length < 2)
//     ) {
//       showToast("At least two options are required for multiple choice questions", "error")
//       return
//     }

//     const questionsNeeded = formData.questionsPerCard * formData.cardsSelected
//     if (questions.length >= questionsNeeded) {
//       showToast(`You've reached the maximum number of questions (${questionsNeeded})`, "error")
//       return
//     }

//     setQuestions((prev) => [...prev, currentQuestion])
//     closeQuestionModal()
//   }

//   const removeQuestion = (id: string) => {
//     setQuestions((prev) => prev.filter((q) => q.id !== id))
//     setIsPublishing(false) // Reset publishing state when questions change
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white">
//         <p>Loading...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen text-white">
//       <div className="mx-auto py-4">
//         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
//           <div className="flex flex-wrap items-center gap-4 sm:gap-7 cursor-pointer">
//             <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => router.push("/tutor")}>
//               <ArrowLeft className="h-6 w-6" />
//             </Button>
//             <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight mb-3">
//               {isEditing ? "Edit Learning Path" : "Create Learning Path"}
//             </h1>
//           </div>

//           {pathGenerated && (
//             <Button
//               variant="outline"
//               className="h-[41px] w-[242px] border border-[#F9DB6F] text-black bg-[#F9DB6F] hover:bg-[#F9DB6F] hover:text-black rounded-md font-medium transition-colors duration-200 cursor-pointer"
//               onClick={handlePublish}
//             >
//               {isEditing ? "Update & Publish" : "Publish"}
//             </Button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-[450px_1fr] gap-6 w-full">
//           {/* Form Section */}
//           <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 font-urbanist">
//             <div className="space-y-2">
//               <label htmlFor="pathTitle" className="block text-sm">
//                 Learning Path Title
//               </label>
//               <Input
//                 id="pathTitle"
//                 name="pathTitle"
//                 placeholder="Insert Title"
//                 value={formData.pathTitle}
//                 onChange={handleInputChange}
//                 className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
//               />
//               {formErrors.pathTitle && <p className="text-red-500 text-xs">{formErrors.pathTitle}</p>}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="owner" className="block text-sm">
//                 Enter Path Owner
//               </label>
//               <Select
//                 value={formData.ownerId}
//                 onValueChange={(value) => {
//                   const selectedUser = users.find((user) => user.id === value)
//                   if (selectedUser) {
//                     setFormData((prev) => ({
//                       ...prev,
//                       owner: `${selectedUser.first_name} ${selectedUser.last_name}`,
//                       ownerId: selectedUser.id,
//                     }))
//                     setFormErrors((prev) => ({ ...prev, owner: "" }))
//                   }
//                 }}
//               >
//                 <SelectTrigger
//                   className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
//                   style={{ height: "44px" }}
//                 >
//                   <SelectValue placeholder="Select path owner" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-[#2C2D2E] border-none text-white">
//                   {users.map((user) => (
//                     <SelectItem
//                       key={user.id}
//                       value={user.id}
//                       className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
//                     >
//                       {`${user.first_name} ${user.last_name}`}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {formErrors.owner && <p className="text-red-500 text-xs">{formErrors.owner}</p>}
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="category" className="block text-sm">
//                 Select Category
//               </label>
//               <div className="relative">
//                 <Select
//                   value={formData.category}
//                   onValueChange={(value) => {
//                     handleSelectChange("category", value)
//                     setFormErrors((prev) => ({ ...prev, category: "" }))
//                   }}
//                 >
//                   <SelectTrigger
//                     className="w-full text-white border-none bg-[#2C2D2E] text-[#FFFFFF52]"
//                     style={{ height: "44px" }}
//                   >
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-[#2C2D2E] border-none text-white">
//                     {teams.map((team) => (
//                       <SelectItem key={team.id} value={team.name} className="">
//                         {team.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
//             </div>

//             <div className="space-y-2">
//               <VerificationPeriodPicker
//                 value={formData.verificationPeriod}
//                 onChange={(value) => {
//                   setFormData((prev) => ({ ...prev, verificationPeriod: value }))
//                   setFormErrors((prev) => ({ ...prev, verificationPeriod: "" }))
//                 }}
//                 dateValue={formData.customDate}
//                 onDateChange={(date) => setFormData((prev) => ({ ...prev, customDate: date }))}
//                 error={formErrors.verificationPeriod}
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm">Choose Training Content</label>
//               <Button
//                 variant="outline"
//                 className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
//                 onClick={() => {
//                   // Pass the current path ID if editing
//                   const url = pathId
//                     ? `/knowledge-base?selectForLearningPath=true&pathId=${pathId}`
//                     : "/knowledge-base?selectForLearningPath=true"
//                   router.push(url)
//                 }}
//               >
//                 Select Cards
//               </Button>
//               {selectedCards && selectedCards.length > 0 && (
//                 <p className="text-green-500 text-xs">Cards selected: {selectedCards.length}</p>
//               )}
//               {formErrors.trainingContent && <p className="text-red-500 text-xs">{formErrors.trainingContent}</p>}
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm">Number of Questions per card</label>
//               <div className="flex items-center bg-[#FFFFFF14] rounded-[6px] w-[130px] border border-[#F9DB6F]">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
//                   onClick={incrementQuestions}
//                 >
//                   <Plus size={16} />
//                 </Button>
//                 <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568] hover:text-[#f0d568] cursor-pointer">
//                   {formData.questionsPerCard}
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   disabled={formData.questionsPerCard <= 1}
//                   className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
//                   onClick={decrementQuestions}
//                 >
//                   <Minus size={16} />
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm">Choose Questions style</label>
//               <div className="flex gap-2">
//                 <Button
//                   variant={formData.questionStyle === "Multiple Choice" ? "default" : "outline"}
//                   className={
//                     formData.questionStyle === "Multiple Choice"
//                       ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
//                       : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                   }
//                   onClick={() => handleQuestionStyleChange("Multiple Choice")}
//                 >
//                   Multiple Choice
//                 </Button>
//                 <Button
//                   variant={formData.questionStyle === "Short Answer" ? "default" : "outline"}
//                   className={
//                     formData.questionStyle === "Short Answer"
//                       ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
//                       : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                   }
//                   onClick={() => handleQuestionStyleChange("Short Answer")}
//                 >
//                   Short Answer
//                 </Button>
//               </div>
//             </div>

//             <div className="flex flex-col pt-4 space-y-3 justify-center items-center">
//               <Button
//                 className="w-full bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium h-12 rounded-md cursor-pointer"
//                 onClick={handleGeneratePath}
//               >
//                 {isEditing ? "Update Path" : "Generate Path"}
//               </Button>
//               {!isEditing && (
//                 <Button
//                   variant="outline"
//                   className="w-full border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer"
//                   onClick={handleSaveAsDraft}
//                 >
//                   Save as Draft
//                 </Button>
//               )}
//             </div>
//           </div>

//           {/* Preview Section */}
//           <div className="h-full w-full">
//             <div className="w-full bg-[#1a1a1a] rounded-lg p-6 relative h-full min-h-[400px]">
//               {pathGenerated ? (
//                 <div className="space-y-6">
//                   {/* Question Counter */}
//                   <div className="flex justify-between items-center">
//                     <div className="text-sm">
//                       <span className="text-gray-400">Questions: </span>
//                       <span className="text-white">{questions.length}</span>
//                       <span className="text-gray-400"> / Required: </span>
//                       <span className="text-white">{formData.questionsPerCard}</span>
//                       <span className="text-gray-400"> / Total: </span>
//                       <span className="text-white">{formData.totalQuestions}</span>
//                     </div>
//                     <Button
//                       variant="outline"
//                       className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-10 rounded-md flex items-center gap-2 cursor-pointer"
//                       onClick={openQuestionModal}
//                       disabled={questions.length >= formData.totalQuestions}
//                     >
//                       <PlusIcon size={16} /> Add Questions
//                     </Button>
//                   </div>

//                   {/* Path Preview */}
//                   <div className="space-y-4">
//                     <div className="flex justify-between items-center">
//                       <h2 className="text-2xl font-medium">
//                         {isEditing ? "Edit Learning Path" : "Preview"} -{" "}
//                         <span className="text-gray-400">[ {formData.pathTitle || "Learning Path"} ]</span>
//                       </h2>
//                     </div>

//                     <div className="font-medium text-[36px] text-[#7C7C7C] mb-4">
//                       [ {formData.category || "Select a category"} ]
//                     </div>

//                     <div className="mb-6">
//                       <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">Requirements:</h3>
//                       <div className="space-y-1 text-gray-200">
//                         <p>&gt; Number of Cards selected: {formData.cardsSelected}</p>
//                         <p>&gt; Questions per card: {formData.questionsPerCard}</p>
//                         <p>&gt; Total Path Questions: {formData.totalQuestions}</p>
//                         <p>&gt; Questions Style: {formData.questionStyle}</p>
//                         {formData.owner && <p>&gt; Path Owner: {formData.owner}</p>}
//                         {apiData?.id && <p>&gt; Path ID: {apiData.id}</p>}
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <div className="flex justify-between items-center">
//                         <h3 className="font-medium text-[32px] text-[#f0d568] mb-4">Training Content:</h3>
//                         <div className="text-sm">
//                           {questions.length >= formData.totalQuestions ? (
//                             <span className="text-green-500">
//                               All required questions added ({questions.length}/{formData.totalQuestions})
//                             </span>
//                           ) : (
//                             <span
//                               className={
//                                 isPublishing && questions.length < formData.questionsPerCard
//                                   ? "text-red-500"
//                                   : "text-yellow-500"
//                               }
//                             >
//                               {formData.totalQuestions - questions.length} more question
//                               {formData.totalQuestions - questions.length !== 1 ? "s" : ""} needed
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {isPublishing && questions.length < formData.questionsPerCard && (
//                         <div className="bg-red-500/20 border border-red-500 rounded-md p-3 mb-4 text-red-200">
//                           <p>You need to add at least {formData.questionsPerCard} questions before publishing.</p>
//                         </div>
//                       )}

//                       {/* Questions Display */}
//                       <div className="space-y-4">
//                         {questions.length === 0 ? (
//                           <div className="bg-[#222222] rounded-lg p-5 text-center">
//                             <p className="text-gray-400">
//                               No questions added yet. Click "Add Questions" to get started.
//                             </p>
//                           </div>
//                         ) : (
//                           questions.map((q, index) => (
//                             <div key={q.id} className="bg-[#222222] rounded-lg p-5 space-y-4 relative">
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
//                                 onClick={() => removeQuestion(q.id)}
//                               >
//                                 <X size={16} />
//                               </Button>
//                               <div>
//                                 <h4 className="font-medium mb-2">Question {index + 1}:</h4>
//                                 <p className="mb-1">{q.question}</p>
//                                 {q.type === "Multiple Choice" && q.options && (
//                                   <div className="mt-2 space-y-2">
//                                     {q.options.map((option, i) => (
//                                       <div key={i} className="flex items-center gap-2">
//                                         <div className="w-4 h-4 rounded-full border border-gray-400"></div>
//                                         <span>{option}</span>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </div>

//                               <div>
//                                 <p className="font-medium">
//                                   Answer: <span className="font-normal">{q.answer}</span>
//                                 </p>
//                               </div>

//                               <div>
//                                 <p className="font-medium">
//                                   Type: <span className="font-normal">{q.type}</span>
//                                 </p>
//                               </div>
//                             </div>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-white text-lg p-6">A preview will appear once path is generated.</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Question Modal */}
//         {isQuestionModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md">
//               <h2 className="text-xl font-medium mb-4">Add Question</h2>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm mb-1">Question Type</label>
//                   <div className="flex gap-2">
//                     <Button
//                       variant={currentQuestion.type === "Multiple Choice" ? "default" : "outline"}
//                       className={
//                         currentQuestion.type === "Multiple Choice"
//                           ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
//                           : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                       }
//                       onClick={() => handleQuestionTypeChange("Multiple Choice")}
//                     >
//                       Multiple Choice
//                     </Button>
//                     <Button
//                       variant={currentQuestion.type === "Short Answer" ? "default" : "outline"}
//                       className={
//                         currentQuestion.type === "Short Answer"
//                           ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
//                           : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                       }
//                       onClick={() => handleQuestionTypeChange("Short Answer")}
//                     >
//                       Short Answer
//                     </Button>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="question" className="block text-sm mb-1">
//                     Question
//                   </label>
//                   <textarea
//                     id="question"
//                     name="question"
//                     value={currentQuestion.question}
//                     onChange={handleQuestionChange}
//                     className="w-full bg-[#2a2a2a] border-0 text-white rounded-md p-2 min-h-[100px]"
//                     placeholder="Enter your question here"
//                   />
//                 </div>

//                 {currentQuestion.type === "Multiple Choice" && (
//                   <div>
//                     <label className="block text-sm mb-1">Options</label>
//                     <div className="space-y-2">
//                       {currentQuestion.options?.map((option, index) => (
//                         <Input
//                           key={index}
//                           value={option}
//                           onChange={(e) => handleOptionChange(index, e.target.value)}
//                           className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
//                           placeholder={`Option ${index + 1}`}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <label htmlFor="answer" className="block text-sm mb-1">
//                     Answer
//                   </label>
//                   <Input
//                     id="answer"
//                     name="answer"
//                     value={currentQuestion.answer}
//                     onChange={handleQuestionChange}
//                     className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
//                     placeholder="Enter the correct answer"
//                   />
//                 </div>

//                 <div className="flex justify-end gap-2 pt-4">
//                   <Button
//                     variant="outline"
//                     className="border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
//                     onClick={closeQuestionModal}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md cursor-pointer"
//                     onClick={addQuestion}
//                   >
//                     Add Question
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
