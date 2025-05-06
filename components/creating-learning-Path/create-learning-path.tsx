"use client"

import { forwardRef, useState, useEffect } from "react"
import { Minus, Plus, ArrowLeft, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { useRouter } from "next/navigation"

export default function CreateLearningPath() {
    const router = useRouter()

    // Form data state
    const [formData, setFormData] = useState({
        pathTitle: "Sample Path Title",
        pathOwner: "",
        category: "Product Knowledge",
        questionsPerCard: 5,
        questionStyle: "Multiple Choice",
        cardsSelected: 10,
        totalQuestions: 50
    })

    // UI-specific states
    const [questionCount, setQuestionCount] = useState(1)
    const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'custom' | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    // Update total questions when relevant values change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            totalQuestions: prev.cardsSelected * prev.questionsPerCard
        }));
    }, [formData.cardsSelected, formData.questionsPerCard]);

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const incrementQuestions = () => {
        setQuestionCount((prev) => prev + 1)
        setFormData(prev => ({
            ...prev,
            questionsPerCard: prev.questionsPerCard + 1
        }))
    }

    const decrementQuestions = () => {
        if (questionCount > 1) {
            setQuestionCount((prev) => prev - 1)
            setFormData(prev => ({
                ...prev,
                questionsPerCard: Math.max(1, prev.questionsPerCard - 1)
            }))
        }
    }

    const handlePeriodChange = (value: 'current' | 'custom') => {
        setSelectedPeriod(value)
        if (value === 'current') {
            // Default to 1 week when selecting current period
        } else if (value === 'custom') {
            // Initialize with current date
            setSelectedDate(new Date())
        }
    }

    const handleQuestionStyleChange = (style: string) => {
        setFormData(prev => ({
            ...prev,
            questionStyle: style
        }))
    }

    const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
        ({ value, onClick }, ref) => (
            <input
                className="w-full p-2 bg-[#2C2D2E] border-none text-white rounded-md focus:ring-0"
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
                placeholder="Select date"
            />
        )
    );

    CustomInput.displayName = "CustomInput";

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    {/* Back button and title */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-white hover:bg-transparent cursor-pointer"
                            onClick={() => { router.push("/tutor") }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%]">
                            Create Learning Path
                        </h1>
                    </div>

                    {/* Publish button */}
                    {!isOpen && <Button
                        variant="outline"
                        className="h-[41px] w-[242px] border border-[#F9DB6F] text-black bg-[#F9DB6F] hover:bg-[#F9DB6F] hover:text-black rounded-md font-medium transition-colors duration-200 cursor-pointer"
                        onClick={() => {/* Add publish logic */ }}
                    >
                        Publish
                    </Button>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 w-full">
                    {/* Form Section */}
                    <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-5 w-full md:w-[450px]">
                        <div className="space-y-2">
                            <label htmlFor="pathTitle" className="block text-sm">
                                Learning Path Title
                            </label>
                            <Input
                                id="pathTitle"
                                name="pathTitle"
                                placeholder="Insert Title"
                                value={formData.pathTitle}
                                onChange={handleInputChange}
                                className="bg-[#2a2a2a] h-[44px] border-0 text-[#FFFFFF5]  rounded-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="pathOwner" className="block text-sm">
                                Assign Path Owner
                            </label>
                            <Input
                                id="pathOwner"
                                name="pathOwner"
                                value={formData.pathOwner}
                                onChange={handleInputChange}
                                placeholder="Insert Path Owner"
                                className="bg-[#2a2a2a] border-0 text-[#FFFFFF5] h-[44px] rounded-md"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category" className="block text-sm">
                                Select Category
                            </label>
                            <div className="relative">
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleSelectChange('category', value)}
                                >
                                    <SelectTrigger className="bg-[#2a2a2a] w-full  text-[#FFFFFF52] border-none " style={{ height: '44px' }}>
                                        <SelectValue placeholder="Product Knowledge" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#2a2a2a] hover:bg-[#2a2a2a] text-white border-none">
                                        <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" value="Product Knowledge">Product Knowledge</SelectItem>
                                        <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" value="Marketing">Marketing</SelectItem>
                                        <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" value="Sales">Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Select Verification Period
                            </label>
                            <div className="space-y-2">
                                {!selectedPeriod ? (
                                    <Select onValueChange={handlePeriodChange}>
                                        <SelectTrigger className="bg-[#2a2a2a] w-full border-none text-[#FFFFFF5]" style={{ height: '44px' }}>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#2a2a2a] w-full border-none text-white">
                                            <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" value="current">Current Period</SelectItem>
                                            <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" value="custom">Custom Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-full flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPeriod(null)}
                                                className="text-gray-400 hover:text-white hover:bg-transparent"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm text-gray-300">
                                                {selectedPeriod === 'current' ? 'Current Period' : 'Custom Date'}
                                            </span>
                                        </div>

                                        {selectedPeriod === 'current' && (
                                            <Select defaultValue="1">
                                                <SelectTrigger className="bg-[#2a2a2a] w-full border-none text-[#FFFFFF5] h-12">
                                                    <SelectValue placeholder="Select weeks" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#2a2a2a] w-full border-none text-white">
                                                    {[1, 2, 3, 4].map(week => (
                                                        <SelectItem className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]" key={week} value={week.toString()}>
                                                            {week} Week{week !== 1 ? 's' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {selectedPeriod === 'custom' && (
                                            <div className="w-full">
                                                <DatePicker
                                                    selected={selectedDate as Date}
                                                    onChange={(date) => date && setSelectedDate(date)}
                                                    className="w-full"
                                                    wrapperClassName="w-full"
                                                    customInput={<CustomInput />}
                                                    popperClassName="bg-[#2C2D2E] border-none text-white"
                                                    calendarClassName="bg-[#2C2D2E] border-none text-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm">Choose Training Content</label>
                            <Button
                                variant="outline"
                                className="border bg-[#FFFFFF14] border-[#f0d568] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#F9DB6F]/10 h-10 rounded-md cursor-pointer"
                                onClick={() => {
                                    // Store current selection to return to
                                    router.push("/knowledge-base");
                                }}
                            >
                                Select Cards
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm">Number of Questions per card</label>
                            <div className="flex items-center bg-[#FFFFFF14] rounded-[6px] w-[130px] border border-[#F9DB6F]">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                                    onClick={incrementQuestions}
                                >
                                    <Plus size={16} />
                                </Button>
                                <div className="h-6 w-8 m-3 flex items-center justify-center text-[#f0d568] hover:text-[#f0d568] cursor-pointer">
                                    {formData.questionsPerCard}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 m-3 border-transparent bg-[#191919] text-[#f0d568] hover:text-[#f0d568] hover:bg-[#191919] cursor-pointer"
                                    onClick={decrementQuestions}
                                >
                                    <Minus size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm">Choose Questions per style</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={formData.questionStyle === "Multiple Choice" ? "default" : "outline"}
                                    className={
                                        formData.questionStyle === "Multiple Choice"
                                            ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 rounded-md cursor-pointer"
                                            : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                                    }
                                    onClick={() => handleQuestionStyleChange("Multiple Choice")}
                                >
                                    Multiple Choice
                                </Button>
                                <Button
                                    variant={formData.questionStyle === "Short Answer" ? "default" : "outline"}
                                    className={
                                        formData.questionStyle === "Short Answer"
                                            ? "border border-[#f0d568] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10 hover:text-[#f0d568] rounded-md cursor-pointer"
                                            : "border border-gray-600 bg-transparent text-white hover:text-white hover:opacity-90 rounded-md hover:bg-transparent"
                                    }
                                    onClick={() => handleQuestionStyleChange("Short Answer")}
                                >
                                    Short Answer
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col pt-4 space-y-3 justify-center items-center">
                            <Button
                                className="w-[232px] bg-[#f0d568] hover:bg-[#e0c558] text-black  font-medium h-12 rounded-md cursor-pointer"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                Generate Path
                            </Button>
                            <Button
                                variant="outline"
                                className="w-[232px] border bg-[#333435] border-[#ffffff] text-white hover:bg-[#333435] hover:text-white h-12 rounded-md cursor-pointer"
                                onClick={() => router.push("/tutor/drafts")}
                            >
                                Save as Draft
                            </Button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className=" h-full w-full">
                        <div className="w-full md:col-span-2 bg-[#1a1a1a] rounded-lg flex md:p-10 relative h-full cursor-pointer">
                            {isOpen ? <p className="text-white">A preview will appear once path is generated.</p> :
                                <div className="w-full bg-[#1a1a1a] rounded-lg p-6 text-white min-h-[500px]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-medium">
                                            Preview - <span className="text-gray-400">[ {formData.pathTitle} ]</span>
                                        </h2>
                                        <Button
                                            variant="outline"
                                            className="border border-white bg-[#333435] text-white hover:text-white hover:bg-[#333435] hover:opacity-90 h-12 rounded-md flex items-center gap-2 cursor-pointer"
                                        >
                                            <PlusIcon size={16} /> Add Questions
                                        </Button>
                                    </div>

                                    <div className="font-urbanist font-medium text-[36px] leading-[100%] tracking-[0%] text-[#7C7C7C] mb-4">
                                        [ {formData.category} ]
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%] text-[#f0d568] mb-4">Requirements:</h3>
                                        <div className="space-y-1 text-gray-200">
                                            <p>&gt; Number of Cards selected : {formData.cardsSelected}</p>
                                            <p>&gt; Questions per card : {formData.questionsPerCard}</p>
                                            <p>&gt; Total Path Questions: {formData.totalQuestions}</p>
                                            <p>&gt; Questions Styles: {formData.questionStyle}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-urbanist font-medium text-[32px] leading-[100%] tracking-[0%] text-[#f0d568] mb-4">
                                            Training Content:
                                        </h3>
                                        <div className="bg-[#222222] rounded-lg p-5 space-y-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Question 1:</h4>
                                                <p className="mb-1">
                                                    Our product come with a warranty against manufacturing defects. How long is the warranty period?
                                                </p>
                                                <p className="text-gray-400 italic">Type your answer below</p>
                                            </div>

                                            <div>
                                                <p className="font-medium">
                                                    Answer: <span className="font-normal">24 months</span>
                                                </p>
                                            </div>

                                            <div>
                                                <p className="font-medium">
                                                    Source: <span className="text-[#f0d568]">Warranty</span>
                                                </p>
                                            </div>

                                            <div>
                                                <p className="font-medium">
                                                    Type: <span className="font-normal">Short Form Answer</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}