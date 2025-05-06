"use client"
import { useState } from "react"
import { ArrowUpToLine, Edit, Ellipsis, Funnel, MoveLeft, Trash2 } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button } from "../ui/button"
import Table from "../ui/table"
import { useRouter } from "next/navigation"
import SearchInput from "../shared/search-input"

type Draft = {
  id: string
  name: string
  category: string
  folder: string
}

export function KnowledgeBaseDraft() {
  const router = useRouter()
  const [filter, setFilter] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([
    { id: "1", name: "Warranty Card", category: "Analytics", folder: "Policies" },
    { id: "2", name: "Warranty Card", category: "Sales", folder: "Policies" },
    { id: "3", name: "Warranty Card", category: "HR", folder: "Troubleshoot" },
    { id: "4", name: "Warranty Card", category: "Sales", folder: "Training" },
    { id: "5", name: "Warranty Card", category: "Sales", folder: "Training" },
    { id: "6", name: "Warranty Card", category: "Analytics", folder: "Policies" },
  ])

  const columns = [
    { Header: "Card", accessor: "name" },
    { Header: "Category", accessor: "category" },
    { Header: "Folder", accessor: "folder" },
  ]

  // const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDrafts(drafts.filter((draft) => draft.id !== id))
    // setOpenMenuId(null)
  }


  const handleSearchChange = (value: string) => {
    setFilter(value);
    console.log("Search Term:", value);
  };

  return (
    <div className=" text-white ">
      <div className=" mx-auto">
        {/* Header */}
        <header className="py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7">
            <MoveLeft className="h-[24px] w-[36px] cursor-pointer" onClick={() => router.push('/knowledge-base')} />
            <h1 className="font-urbanist font-medium text-[32px] leading-[100%] sm:text-3xl ">
              Explore Card Drafts
            </h1>
          </div>

          <div className="flex items-center gap-2 mr-2">
            <SearchInput onChange={handleSearchChange} />
            <Button className="bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black p-2 rounded-md">
              <Funnel className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Table */}
        <div className="mt-4 overflow-x-auto  ">
          <Table
            columns={columns}
            data={drafts}
            tableClassName="min-w-full text-sm sm:text-base shadow rounded-lg border-collapse"
            headerClassName="bg-[#F9DB6F] font-urbanist font-medium text-[16px] leading-[21.9px]  text-black text-left"
            bodyClassName="py-3 px-4"
            cellClassName="border-t border-[#E0EAF5] py-3 px-4 align-middle whitespace-nowrap font-urbanist font-medium text-[16px] leading-[21.9px]  h-[68px]"
            filterValue={filter}
            onFilterChange={setFilter}
            renderActions={(row) => (
              <div className="flex justify-start">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded">
                      <Ellipsis className="h-5 w-5 text-white" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content className="min-w-[160px] bg-[#222] border-none rounded-md shadow-lg py-2 p-2 z-50">
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] border-none hover:border-none focus:outline-none focus:ring-0 focus:border-none">
                      <ArrowUpToLine className="h-4 w-4" />
                      <span>Publish</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] border-none hover:border-none focus:outline-none focus:ring-0 focus:border-none">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white cursor-pointer hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] border-none hover:border-none focus:outline-none focus:ring-0 focus:border-none"
                      onSelect={() => handleDelete(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  )
}
