"use client"
import * as Dialog from "@radix-ui/react-dialog"
import { Search, X } from "lucide-react"
import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Image from "next/image"

type User = {
    id: string
    name: string
    role: string
    team: string
    avatar: string
}

interface ReassignUserModalProps {
    isOpen: boolean
    onClose: () => void
    onAssign: (userId: string) => void
}

export function ReassignUser({ isOpen, onClose, onAssign }: ReassignUserModalProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const users: User[] = [
        {
            id: "1",
            name: "John Doe",
            role: "Designer",
            team: "Design Team",
            avatar: "/avatar.png",
        },
        {
            id: "2",
            name: "John Doe",
            role: "Designer",
            team: "Design Team",
            avatar: "/avatar.png",
        },
        {
            id: "3",
            name: "John Doe",
            role: "Designer",
            team: "Design Team",
            avatar: "/avatar.png",
        },
        {
            id: "4",
            name: "John Doe",
            role: "Designer",
            team: "Design Team",
            avatar: "/avatar.png",
        },
    ]

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.team.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm " />
                <Dialog.Content className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121212] text-white rounded-lg w-[90vw] max-w-[500px] max-h-[85vh] overflow-y-auto shadow-xl">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <Dialog.Title className="text-2xl font-medium">Reassign User</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="text-[#F9DB6F] hover:text-white">
                                    <X className="h-6 w-6" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-[#828282] rounded-full py-3 pl-12 pr-4 text-white focus:outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="border-b border-[#333] pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222] flex items-center justify-center">
                                                <Image
                                                    src="/pic1.png"
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    width={48}
                                                    height={48}
                                                    
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-[#F9DB6F]">{user.role}</div>
                                            </div>

                                                <div className="text-sm text-[#F9DB6F] ml-2 bg-[#F9DB6F33] p-2.5 rounded-[20px]">{user.team}</div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => onAssign(user.id)}
                                                className="bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                Assign User
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
