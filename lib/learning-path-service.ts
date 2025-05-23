
// export type Question = {
//   id: string
//   question: string
//   answer: string
//   type: "Multiple Choice" | "Short Answer"
//   options?: string[]
// }

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

// /**
//  * Prepares learning path data for submission to the API
//  */
// export const prepareLearningPathData = (
//   formData: PathFormData,
//   questions: Question[],
//   selectedCards: any[] | null,
//   status: "draft" | "generated" | "published",
//   orgId: string,
// ) => {
//   // Format the verification period date
//   let verificationPeriod = null
//   if (formData.verificationPeriod === "custom" && formData.customDate) {
//     verificationPeriod = formData.customDate.toISOString()
//   } else if (formData.verificationPeriod) {
//     const today = new Date()
//     switch (formData.verificationPeriod) {
//       case "1week":
//         verificationPeriod = new Date(today.setDate(today.getDate() + 7)).toISOString()
//         break
//       case "2week":
//         verificationPeriod = new Date(today.setDate(today.getDate() + 14)).toISOString()
//         break
//       case "1month":
//         verificationPeriod = new Date(today.setMonth(today.getMonth() + 1)).toISOString()
//         break
//       case "6months":
//         verificationPeriod = new Date(today.setMonth(today.getMonth() + 6)).toISOString()
//         break
//       case "12months":
//         verificationPeriod = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString()
//         break
//     }
//   }

//   // Prepare the learning path data
//   return {
//     title: formData.pathTitle,
//     path_owner: formData.ownerId,
//     category: formData.categoryId,
//     num_of_questions: formData.questionsPerCard,
//     question_type: formData.questionStyle,
//     verification_period: verificationPeriod,
//     status: status,
//     org_id: orgId,
//     questions: questions,
//     cards: selectedCards?.map((card) => card.id || card.card?.id) || [],
//   }
// }

// /**
//  * Submits a learning path to the API
//  */
// export const submitLearningPath = async (data: any, method: "POST" | "PUT" = "POST") => {
//   try {
//     const isUpdate = method === "PUT"
//     const endpoint = isUpdate ? `/learning-paths/${data.id}` : "/learning-paths"
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

//     const response = await fetch(`${apiUrl}${endpoint}`, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include",
//       body: JSON.stringify(data),
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.message || "Failed to submit learning path")
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error submitting learning path:", error)
//     throw error
//   }
// }

// /**
//  * Fetches a learning path by ID
//  */
// export const fetchLearningPathById = async (pathId: string) => {
//   try {
//     // Fetch the learning path
//     const { data: learningPath, error: learningPathError } = await supabase
//       .from("learning_paths")
//       .select("*, category(*), path_owner(*)")
//       .eq("id", pathId)
//       .single()

//     if (learningPathError) {
//       throw new Error(`Failed to fetch learning path: ${learningPathError.message}`)
//     }

//     // Fetch associated card_learning_paths with full card data
//     const { data: cardLearningPaths, error: cardLearningPathsError } = await supabase
//       .from("card_learning_paths")
//       .select("id, learning_path, org_id, card(*)")
//       .eq("learning_path", pathId)

//     if (cardLearningPathsError) {
//       throw new Error(`Failed to fetch associated cards: ${cardLearningPathsError.message}`)
//     }

//     return {
//       learningPath,
//       cardLearningPaths,
//     }
//   } catch (error) {
//     console.error("Error fetching learning path:", error)
//     throw error
//   }
// }

// /**
//  * Creates a new learning path
//  */
// export const createLearningPath = async (payload: any) => {
//   try {
//     const { cards, ...newData } = payload

//     // Insert into learning_paths
//     const { data: learningPath, error } = await supabase.from("learning_paths").insert([newData]).select().single()

//     if (error) {
//       console.error("Supabase insert error:", error)
//       throw new Error(error.message)
//     }

//     if (!learningPath) {
//       throw new Error("No data returned from insert.")
//     }

//     // Insert associated cards into card_learning_paths
//     if (Array.isArray(cards) && cards.length > 0) {
//       const cardLinks = cards.map((cardId: string) => ({
//         card: cardId,
//         learning_path: learningPath.id,
//         org_id: learningPath.org_id,
//       }))

//       const { error: linkError } = await supabase.from("card_learning_paths").insert(cardLinks)

//       if (linkError) {
//         console.error("Failed to insert card_learning_paths:", linkError)
//         throw new Error(linkError.message)
//       }
//     }

//     // Fetch the inserted card_learning_paths with full card data
//     const { data: cardLearningPaths, error: fetchError } = await supabase
//       .from("card_learning_paths")
//       .select("id, card(*), learning_path, org_id")
//       .eq("learning_path", learningPath.id)

//     if (fetchError) {
//       console.error("Failed to fetch card_learning_paths with card data:", fetchError)
//       throw new Error(fetchError.message)
//     }

//     return {
//       learningPath,
//       cardLearningPaths,
//     }
//   } catch (error) {
//     console.error("Error creating learning path:", error)
//     throw error
//   }
// }

// /**
//  * Updates an existing learning path
//  */
// export const updateLearningPath = async (pathId: string, payload: any) => {
//   try {
//     const { cards, questions, ...updateData } = payload

//     // Update the learning path
//     const { data: learningPath, error } = await supabase
//       .from("learning_paths")
//       .update(updateData)
//       .eq("id", pathId)
//       .select()
//       .single()

//     if (error) {
//       console.error("Supabase update error:", error)
//       throw new Error(error.message)
//     }

//     if (!learningPath) {
//       throw new Error("No data returned from update.")
//     }

//     // Handle card associations if provided
//     if (Array.isArray(cards)) {
//       // First, delete existing card associations
//       const { error: deleteError } = await supabase.from("card_learning_paths").delete().eq("learning_path", pathId)

//       if (deleteError) {
//         console.error("Failed to delete existing card associations:", deleteError)
//         throw new Error(deleteError.message)
//       }

//       // Then, insert new card associations
//       if (cards.length > 0) {
//         const cardLinks = cards.map((cardId: string) => ({
//           card: cardId,
//           learning_path: pathId,
//           org_id: learningPath.org_id,
//         }))

//         const { error: linkError } = await supabase.from("card_learning_paths").insert(cardLinks)

//         if (linkError) {
//           console.error("Failed to insert card_learning_paths:", linkError)
//           throw new Error(linkError.message)
//         }
//       }
//     }

//     // Handle questions if provided
//     if (Array.isArray(questions)) {
//       // Update questions logic would go here
//       // This depends on how questions are stored in your database
//     }

//     // Fetch the updated card_learning_paths with full card data
//     const { data: cardLearningPaths, error: fetchError } = await supabase
//       .from("card_learning_paths")
//       .select("id, card(*), learning_path, org_id")
//       .eq("learning_path", pathId)

//     if (fetchError) {
//       console.error("Failed to fetch card_learning_paths with card data:", fetchError)
//       throw new Error(fetchError.message)
//     }

//     return {
//       learningPath,
//       cardLearningPaths,
//     }
//   } catch (error) {
//     console.error("Error updating learning path:", error)
//     throw error
//   }
// }
