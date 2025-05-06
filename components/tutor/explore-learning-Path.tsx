"use client"

import { useState } from "react"
import { ArrowLeft,  MoreVertical, Pencil,  SlidersHorizontal, SquarePen, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SearchInput from "../shared/search-input"
import DeleteLearningPath from "./explore-learning-path/delete-learning-path"
import { useRouter } from "next/navigation"

// Define the type for our learning path data
interface ExploreLearningPath {
    id:number,
    courseName: string
    verificationDate: string
    owner: string
    totalQuestions: string
    enrolledUsers: number
    enrolled: boolean
}

// Sample avatar data
const avatars = [
    "/file.png",
    "/pic1.png",
    "/file.png",
    "/pic1.png",
    "/pic1.png",
]

export default function ExploreLearningPath() {
    const router = useRouter()
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [filterdata, setFilterData] = useState("")
    // Sample data for the table
    const [data, setData] = useState<ExploreLearningPath[]>([
        {
            id:1,
            courseName: "Internal Policies",
            verificationDate: "8/21/15",
            owner: "You",
            totalQuestions: "10",
            enrolledUsers: 5,
            enrolled: true,
        },
        {
            id:2,
            courseName: "Summer Promotions",
            verificationDate: "8/30/14",
            owner: "You",
            totalQuestions: "05",
            enrolledUsers: 4,
            enrolled: false,
        },
        {
            id:2,
            courseName: "Office Policy",
            verificationDate: "1/28/17",
            owner: "Charles",
            totalQuestions: "20",
            enrolledUsers: 2,
            enrolled: true,
        },
        {
            id:3,
            courseName: "Marketing Campaigns",
            verificationDate: "2/11/12",
            owner: "James",
            totalQuestions: "08",
            enrolledUsers: 3,
            enrolled: false,
        },
        {
            id:4,
            courseName: "Customer Support",
            verificationDate: "12/10/13",
            owner: "Trent",
            totalQuestions: "10",
            enrolledUsers: 7,
            enrolled: false,
        },
        {
            id:5,
            courseName: "Vacation Policy",
            verificationDate: "10/28/12",
            owner: "James",
            totalQuestions: "15",
            enrolledUsers: 2,
            enrolled: false,
        },
    ])

    const [activeDropdown, setActiveDropdown] = useState<number | null>(null)


    // Function to handle enrolling in a learning path
    const handleEnroll = (index: number) => {
        console.log(`Enrolling in: ${data[index].courseName}`)
        const newData = [...data]
        newData[index].enrolled = true
        setData(newData)
        setActiveDropdown(null)
    }

    // Function to handle publishing a learning path
    const handlePublish = (row: ExploreLearningPath) => {
        console.log(`Publishing: ${row.courseName}`)
        // Add your publish logic here
    }

    // Function to handle editing a learning path
    const handleEdit = (row: ExploreLearningPath) => {
        console.log(`Editing: ${row.courseName}`)
        // Add your edit logic here
    }

    // Function to handle deleting a learning path
    // const handleDelete = (row: ExploreLearningPath , id:number) => {
    //     console.log(`Deleting: ${row.courseName}`)
    //     // Add your delete logic here
    //     setData(data.filter((item) => item.courseName !== row.courseName))
    //     openDeleteModal(id)
    // }

    const openDeleteModal = (index: number) => {
        setItemToDelete(index)
        setDeleteModalOpen(true)
        setActiveDropdown(null)
      }
    
      // Function to handle confirming deletion
      const confirmDelete = () => {
        if (itemToDelete !== null) {
          console.log(`Deleting: ${data[itemToDelete].courseName}`)
          const newData = data.filter((_, i) => i !== itemToDelete)
          setData(newData)
          setDeleteModalOpen(false)
          setItemToDelete(null)
        }
      }


      const filteredData = data.filter((row) =>
        row.courseName.toLowerCase().includes(filterdata.toLowerCase())
      );

    return (
        <div className="min-h-screen  text-white">

            {/* Main content */}
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white bg-transparent hover:bg-transparent hover:text-white"   onClick={() => router.push('/tutor')}>
                            <ArrowLeft size={20}   />
                        </Button>
                        <h1 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">Explore Learning Path</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <SearchInput onChange={(value) => setFilterData(value)} />
                        </div>
                        <Button variant="outline" size="icon" className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md">
                            <SlidersHorizontal size={16} />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden ">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#f0d568] text-black">
                                <th className="px-4 py-3 text-left font-medium">Course Name</th>
                                <th className="px-4 py-3 text-left font-medium">Verification Date</th>
                                <th className="px-4 py-3 text-left font-medium">Owner</th>
                                <th className="px-4 py-3 text-left font-medium">{"Total Questions"}</th>
                                <th className="px-4 py-3 text-left font-medium">Enrolled Users</th>
                                <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((row: ExploreLearningPath, index) => (
                                <tr key={index} className="border-t border-[#E0EAF5]">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {row.courseName}
                                            {row.enrolled && (
                                                <span className="bg-[#3a3a1a] text-[#f0d568] text-xs px-2 py-0.5 rounded-full">Enrolled</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">{row.verificationDate}</td>
                                    <td className="px-4 py-4">{row.owner}</td>
                                    <td className="px-4 py-4">{row.totalQuestions}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div className="flex -space-x-2">
                                                {avatars.slice(0, Math.min(5, row.enrolledUsers)).map((avatar, i) => (
                                                    <Avatar key={i} className="h-8 w-8 border-2 border-[#121212]">
                                                        <AvatarImage src={avatar} />
                                                        <AvatarFallback className="bg-gray-500 text-xs">
                                                            {String.fromCharCode(65 + i)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                            <span className="ml-1 text-gray-400">+{row.enrolledUsers}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right relative">
                                        <DropdownMenu
                                            open={activeDropdown === index}
                                            onOpenChange={(open) => {
                                                if (open) setActiveDropdown(index)
                                                else if (activeDropdown === index) setActiveDropdown(null)
                                            }}
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white bg-transparent hover:bg-transparent ">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-[#2a2a2a] border border-gray-700 text-white"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => handlePublish(row)}
                                                    className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                                                >
                                                    <Upload size={16} className="text-white group-hover:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F]">Publish</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                  onClick={() => handleEnroll(index)} 
                                                    className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                                                >
                                                    <SquarePen size={16} className="text-white group-hover:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F]">Enroll</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(row)}
                                                    className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                                                >
                                                    <Pencil size={16} className="text-white group-hover:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F]">Edit</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => openDeleteModal(index)}
                                                    className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
                                                >
                                                    <Trash2 size={16} className="text-white group-hover:text-[#F9DB6F]" />
                                                    <span className="text-white group-hover:text-[#F9DB6F]">Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating action button */}
            <div className="fixed bottom-6 right-6">
                <Button className="h-14 w-14 rounded-full bg-[#f0d568] hover:bg-[#e0c558] text-black">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="black"
                        />
                    </svg>
                </Button>
            </div>


            <DeleteLearningPath
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
        </div>
    )
}
