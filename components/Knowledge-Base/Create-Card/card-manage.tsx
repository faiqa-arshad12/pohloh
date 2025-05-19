"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, ChevronRight, Plus, MoreHorizontal, BarChart2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Types based on the provided JSON structure
interface CardOwner {
  id: string
  role: string
  email: string
  first_name: string
  last_name: string
  profile_picture: string
  // Other fields omitted for brevity
}

interface KnowledgeCard {
  id: string
  tags: string[]
  type: string
  title: string
  content: string
  card_status: string
  card_owner_id: CardOwner
  // Other fields omitted for brevity
}

interface Subcategory {
  id: string
  name: string
  knowledge_card: KnowledgeCard[]
}

interface Team {
  id: string
  name: string
  subcategories: Subcategory[]
}

interface TeamsData {
  success: boolean
  teams: Team[]
}

export default function KnowledgeManagement() {
  const [isOpen, setIsOpen] = useState(true)
  const [data, setData] = useState<TeamsData | null>(null)
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({})
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({})
  const [newCategoryName, setNewCategoryName] = useState("")

  // In a real application, you would fetch this data from an API
  useEffect(() => {
    // Simulating data fetch
    const mockData: TeamsData = {
      success: true,
      teams: [
        {
          id: "b03cb15d-42c2-4a09-a1d8-f6e99e16a3f5",
          name: "Sales",
          subcategories: [
            {
              id: "policies-id",
              name: "Policies",
              knowledge_card: [
                {
                  id: "warranty-id",
                  tags: ["policy"],
                  type: "card",
                  title: "Warranty",
                  content: "",
                  card_status: "draft",
                  card_owner_id: {
                    id: "user-id",
                    role: "admin",
                    email: "admin@example.com",
                    first_name: "Admin",
                    last_name: "User",
                    profile_picture: "",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "1df058c0-d9a2-4568-9cc1-4f8ee3cbac4b",
          name: "HR",
          subcategories: [],
        },
        {
          id: "3ec7b0fb-304d-4ac8-90eb-aa4d3948f197",
          name: "Security",
          subcategories: [],
        },
      ],
    }

    setData(mockData)

    // Set Sales expanded by default to match the Figma
    setExpandedTeams({
      "b03cb15d-42c2-4a09-a1d8-f6e99e16a3f5": true,
    })

    // Set Policies expanded by default to match the Figma
    setExpandedSubcategories({
      "policies-id": true,
    })
  }, [])

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId],
    }))
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    // In a real application, you would make an API call to add the category
    console.log("Adding category:", newCategoryName)
    setNewCategoryName("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col p-4 z-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Manage Categories</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-gray-800">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Add Categories</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm mb-2">
              Add Category
            </label>
            <Input
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter category name"
            />
          </div>
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full"
            onClick={handleAddCategory}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 rounded-full">
            <Plus className="h-4 w-4 mr-2" /> Add Subcategory
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-yellow-400 mb-4">Manage Existing Categories</h2>
        <div className="space-y-1">
          {data?.teams.map((team) => (
            <div key={team.id} className="border-b border-gray-800">
              <div
                className="flex items-center justify-between py-3 cursor-pointer"
                onClick={() => toggleTeam(team.id)}
              >
                <div className="flex items-center">
                  {expandedTeams[team.id] ? (
                    <ChevronDown className="h-4 w-4 mr-2 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                  )}
                  <BarChart2 className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{team.name}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                    <DropdownMenuItem className="hover:bg-gray-700">Edit</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-gray-700">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {expandedTeams[team.id] &&
                team.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="ml-6 border-t border-gray-800">
                    <div
                      className="flex items-center justify-between py-3 cursor-pointer"
                      onClick={() => toggleSubcategory(subcategory.id)}
                    >
                      <div className="flex items-center">
                        {expandedSubcategories[subcategory.id] ? (
                          <ChevronDown className="h-4 w-4 mr-2 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{subcategory.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                          <DropdownMenuItem className="hover:bg-gray-700">Edit</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-gray-700">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {expandedSubcategories[subcategory.id] &&
                      subcategory.knowledge_card.map((card) => (
                        <div key={card.id} className="ml-6 border-t border-gray-800 py-3 pl-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{card.title}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                                <DropdownMenuItem className="hover:bg-gray-700">View</DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-gray-700">Edit</DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-gray-700">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
