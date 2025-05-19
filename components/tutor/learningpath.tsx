"use client"

import { useEffect, useState } from "react"
import { MoreVertical, Eye, Star, Trash2, FileBadge, PlayIcon, Pen } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import Sessionstarted from "./sessionstarted"
// import SessionSummary from "./sessionsummary"
import { useRouter } from "next/navigation"
import FeedbackForm from "./sessionsummary/leave-feedback"
export default function LearningPaths() {
    const router = useRouter()
    const [showWelcome, setShowWelcome] = useState(true)
    const [sessionComplted, setSessionComplted] = useState(true)
    const [showLeaveFeedback, setShowLeaveFeedback] = useState(false)
    const courses = [
        { id: 1, name: "Internal Policy", department: "Policy", complete: "5/10", icon: "FileBadge" },
        { id: 2, name: "Summer Planning", department: "Marketing", complete: "2/10", icon: "FileBadge" },
        { id: 3, name: "Vacations Policy", department: "Human Resources", complete: "7/10", icon: "FileBadge" },
        { id: 4, name: "Appraisal Policy", department: "HR", complete: "2/10", icon: "FileBadge" },
    ]

    useEffect(() => {
        setSessionComplted(true)
    }, [])


    const startSession = () => {
        setShowWelcome(false)
    }

    return (
        <div className="flex   text-white">

            <div className="flex flex-col w-full">
                <h1 className="font-urbanist font-medium text-[32px] leading-[100% tracking-[0]  py-4  ">
                    Learning Paths
                </h1>

                <div className="flex flex-1 flex-col md:flex-row gap-4 p-0 just sm:flex-row">

                    {/* Left sidebar */}
                    <div className="relative w-fit">
                        {/* SVG background */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 334 773"
                            fill="none"
                            className="absolute inset-0 z-0 w-full h-full scale-x-100"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 40C0 17.9086 17.9086 0 40 0H244.15C260.023 0 272.89 12.8672 272.89 28.7397C272.89 44.6123 285.757 57.4795 301.63 57.4795H302.445C318.768 57.4795 332 70.7117 332 87.0344V733C332 755.091 314.091 773 292 773H40C17.9086 773 0 755.091 0 733V40Z"
                                fill="#191919"
                            />
                        </svg>


                        {/* Main card content */}
                        <div className="relative z-10 w-80 mb-5  rounded-lg overflow-y-auto no-scrollbar">

                            <div className="space-y-4 px-4 py-4 mb-10 text-white">
                                <div className="p-4 font-[Urbanist] font-semibold text-[20px] leading-[100%] tracking-[0] text-white pt-8">
                                    Enrolled Learning Paths
                                </div>

                                {courses.map((course) => (
                                    <div key={course.id} className="flex  h-[101px] p-2 items-start mx-3 gap-[17px] rounded-2xl bg-[#0E0F11]">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F9DB6F] flex items-center justify-center text-black font-medium">
                                            <FileBadge className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-urbanist font-medium text-[16px] leading-[100%]">{course.name}</div>
                                            {course.department && <div className="font-urbanist font-medium text-[12px] leading-[100%] text-[#828282] mt-1">{course.department}</div>}
                                            <div className={`w-[118px] h-[29px] mt-5 flex items-center gap-[10px] rounded-[8px] px-[10px] py-[6px] font-urbanist font-semibold text-[14px] leading-[100%] bg-[#707070] text-white ${sessionComplted ? "bg-[#707070]" : "bg-transparent border"}`}>
                                                Complete: {course.complete}
                                            </div>

                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            {sessionComplted ? (<DropdownMenuContent
                                                align="end"
                                                className="bg-[#222222] text-white border border-[#222222] rounded-md p-1"
                                            >
                                                <DropdownMenuItem
                                                    className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white  hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                                                >
                                                    <Eye className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">View</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white  hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                                                >
                                                    <Star className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">Star</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white  hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                                                >
                                                    <Trash2 className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                                    <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>) : (
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-[#222222] text-white border border-[#222222] rounded-md p-1"
                                                >
                                                    <DropdownMenuItem
                                                        className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-white  hover:bg-[#F9DB6F33] focus:bg-[#F9DB6F33]"
                                                        onClick={() => setShowLeaveFeedback(!showLeaveFeedback)}
                                                    >
                                                        <Pen className="h-4 w-4 text-white group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F]" />
                                                        <span className="group-hover:text-[#F9DB6F] group-focus:text-[#F9DB6F] font-urbanist font-normal text-[14px] leading-[24px]">Leave Feedback</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>)}
                                        </DropdownMenu>

                                    </div>
                                ))}
                            </div>


                            {/* Button section */}
                            <div>

                                <div className="flex flex-col items-center justify-center h-full p-4 space-y-2 ">
                                    <Button className="w-[200px] h-[48px]   border border-gray-600 hover:bg-transparent bg-transparent rounded-md text-sm text-white font-urbanist font-medium text-[14px] leading-[100%]"
                                        onClick={() => router.push('/tutor/explore-learning-path')}
                                    >
                                        Explore more learning paths
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>


                    {/* Main content */}
                    <div className="flex-1  bg-[#191919]  md:mx-5 rounded-[20px] p-8">
                        {showWelcome ? (
                            <div className="h-[446px] flex flex-col items-center justify-center text-center border border-dashed border-white rounded-[20px]">
                                <h2 className="font-urbanist font-medium text-[36px] leading-[100%] text-center mb-2">Hi Trent, Welcome back to Tutor</h2>
                                <p className="font-urbanist font-medium text-[20px] leading-[100%] text-center text-[#CDCDCD] mb-6">  {"Click start to begin the today's session."}</p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={startSession}
                                        className="py-2 px-4 bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-md font-urbanist font-medium text-[14px] leading-[100%] flex items-center gap-2"
                                    >
                                        <PlayIcon /> Start Session
                                    </button>
                                    <button className="py-2 px-4 bg-[#333435] border border-white hover:bg-[#333435] rounded-md font-urbanist font-medium text-[14px] leading-[100%]">
                                        Remind me Later
                                    </button>
                                </div>
                            </div>
                        ) : (

                            // <SessionSummary />
                            <div className="h-full w-full flex">
                                <Sessionstarted />
                            </div>
                        )}
                    </div>
                </div>

                {showLeaveFeedback && <FeedbackForm />}
            </div>
        </div>
    )
}
