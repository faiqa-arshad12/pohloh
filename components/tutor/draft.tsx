"use client"

import { useState } from "react"
import { ArrowLeft, MoreVertical,  SlidersHorizontal } from "lucide-react"
import Table from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SearchInput from "../shared/search-input"
import { Upload, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from "next/navigation"


// Define the type for our learning path data
interface Drafts {
    courseName: string
    verificationPeriod: string
    totalQuestions: string
}

export default function Drafts() {
    const router = useRouter()
    const [filterdata, setFilterData] = useState("")
    // Sample data for the table
    const [data, setData] = useState<Drafts[]>([
        { courseName: "Internal Policies", verificationPeriod: "8/21/15", totalQuestions: "10" },
        { courseName: "Summer Promotions", verificationPeriod: "8/30/14", totalQuestions: "05" },
        { courseName: "Office Policy", verificationPeriod: "1/28/17", totalQuestions: "20" },
        { courseName: "Marketing Campaigns", verificationPeriod: "2/11/12", totalQuestions: "08" },
        { courseName: "Customer Support", verificationPeriod: "12/10/13", totalQuestions: "10" },
        { courseName: "Vacation Policy", verificationPeriod: "10/28/12", totalQuestions: "15" },
    ])

    // Define columns for the table
    const columns = [
        { Header: "Course Name", accessor: "courseName" },
        { Header: "Verification Period", accessor: "verificationPeriod" },
        { Header: "Total Questions Per Card", accessor: "totalQuestions" },
    ]

    // Function to handle publishing a learning path
    const handlePublish = (row: Drafts) => {
        console.log(`Publishing: ${row.courseName}`)
        // Add your publish logic here
    }

    // Function to handle editing a learning path
    const handleEdit = (row: Drafts) => {
        console.log(`Editing: ${row.courseName}`)
        // Add your edit logic here
    }

    // Function to handle deleting a learning path
    const handleDelete = (row: Drafts) => {
        console.log(`Deleting: ${row.courseName}`)
        // Add your delete logic here
        setData(data.filter((item) => item.courseName !== row.courseName))
    }

    // Custom render function for the actions column
    const renderActions = (row: Drafts) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-transparent hover:text-white">
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
              onClick={() => handleEdit(row)}
              className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
            >
              <Pencil size={16} className="text-white group-hover:text-[#F9DB6F]" />
              <span className="group-hover:text-[#F9DB6F]">Edit</span>
            </DropdownMenuItem>
      
            <DropdownMenuItem
              onClick={() => handleDelete(row)}
              className="group flex items-center gap-2 bg-transparent hover:!bg-[#F9DB6F33] cursor-pointer"
            >
              <Trash2 size={16} className="text-white group-hover:text-[#F9DB6F]" />
              <span className="text-white group-hover:text-[#F9DB6F]">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      

    return (
        <div className="min-h-screen  text-white p-4">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-white"
                        onClick={() => router.push('/tutor')}
                        >
                            <ArrowLeft className="w-[16px] h-[16px]" />
                        </Button>
                        <h1 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0]">Learning Path Drafts</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <SearchInput onChange={(value) => setFilterData(value)}  />
                        </div>
                        <Button variant="outline" size="icon" className="bg-[#f0d568] hover:bg-[#e0c558] text-black rounded-md">
                            <SlidersHorizontal size={16} />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden ">
                    <Table
                        columns={columns}
                        data={data}
                        filterValue={filterdata}
                        renderActions={renderActions}
                        tableClassName="w-full border-collapse"
                        headerClassName="bg-[#f0d568] text-black justify-between text-left text-sm font-medium px-4 py-3 border-b border-gray-800"
                        cellClassName="px-4 py-3 border-t border-[#E0EAF5] text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] h-[68px]"
                        bodyClassName="divide-y divide-gray-800 justify-between text-sm font-normal "
                    />
                </div>
            </div>
        </div>
    )
}
