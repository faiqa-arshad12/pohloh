"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Headset,
  Trash2,
  Save,
  BarChart2,
  Users,
  Palette,
  Megaphone,
  PieChart,
  FileText,
  Copy,
  Ellipsis,
  ArchiveIcon,
  CopyCheck,
} from "lucide-react";

import {
  BarChartIcon,
  CategoryItem,
  NavItem,
  SubcategoryItem,
} from "./buttons";
import { Button } from "../ui/button";
import { ReassignUser } from "./reassign-user";
// import { useRouter } from "next/navigation"
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AnalyticsCard() {
  const [activeCategory, setActiveCategory] = useState("Analytics");
  const [activeCategoryFloder, setActiveCategoryFloder] = useState("Policies");
  const [activeSubcategory, setActiveSubcategory] = useState("Warranty");
  const [isPoliciesExpanded, setPoliciesExpanded] = useState(true);
  const [showFloating, setShowFloating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const handleAssignUser = (userId: string) => {
    console.log(`Assigned user with ID: ${userId}`);
    setIsModalOpen(false);
  };
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setAtTop(el.scrollTop === 0);
      // Check if scrolled to bottom (with 1px threshold)
      setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
    }
  };

  const handleScroll = (direction: "up" | "down") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 100;
    el.scrollBy({
      top: direction === "up" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    // Delay to allow scroll to finish before checking position
    setTimeout(checkScroll, 200);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Check initial position
    checkScroll();

    // Attach scroll listener
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard:", text);
        // You can add a toast/alert here if needed
        setIsCopied(true);
        console.log("Copied", isCopied);
        // Reset after 2 seconds
        // setTimeout(() => setIsCopied(false), 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        floatingRef.current &&
        !floatingRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowFloating(false);
      }
    };

    if (showFloating) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFloating]);

  return (
    <div className=" text-white flex flex-col">
      {/* Header */}
      <div className="py-4 lg:py-6 justify-between flex">
        <h1 className="text-white text-[36px] font-semibold">Knowledge Base</h1>

        {/* { <Button
                    type="button"
                    // onClick={}
                    variant="outline"
                    className="w-[132px] bg-[#2C2D2E] border border-[##FFFFFF] hover:bg-[#3A3B3C] text-white hover:text-white"
                    onClick={() => router.push('/knowledge-base/Access-draft')}
                >
                    Access Drafts
                </Button>} */}
      </div>

      <div className=" h-full flex flex-1 gap-[32px] ">
        {/* Left Sidebar */}
        <div className="w-auto  h-[633px] flex flex-col">
          {/* Top Button */}
          <div className="py-2">
            <button
              onClick={() => handleScroll("up")}
              disabled={atTop}
              className={`w-full h-[46px] p-[12px] rounded-full border border-[#F9DB6F] flex items-center justify-center gap-[10px]
                                ${
                                  atTop ? "opacity-50 cursor-not-allowed" : ""
                                }`}
            >
              <ChevronUp className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Scrollable Nav Items */}
          <div
            ref={scrollRef}
            style={{
              overflowY: "auto",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
            className="w-full min-h-0 overflow-y-auto scrollbar-hide"
          >
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/arrow-growth-20-filled.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "Sales"
                      ? "white-yellow-icon"
                      : "invert-0"
                  )}
                />
              }
              label="Sales"
              active={activeCategory === "Sales"}
              highlight={activeCategory === "Sales"}
              onClick={() => setActiveCategory("Sales")}
            />
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/bi_people.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "HR" ? "white-yellow-icon" : "invert-0"
                  )}
                />
              }
              label="HR"
              active={activeCategory === "HR"}
              highlight={activeCategory === "HR"}
              onClick={() => setActiveCategory("HR")}
            />
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/customer-support.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "CX" ? "white-yellow-icon" : "invert-0"
                  )}
                />
              }
              label="CX"
              active={activeCategory === "CX"}
              highlight={activeCategory === "CX"}
              onClick={() => setActiveCategory("CX")}
            />
            <NavItem
              icon={
                <Image
                  alt="Analytics"
                  src="/icons/anaylitcs.svg"
                  height={24}
                  width={24}
                  className={cn(
                    "",
                    activeCategory === "Analytics"
                      ? "           "
                      : "invert-[100%]" // Makes icon white
                  )}
                />
              }
              label="Analytics"
              active={activeCategory === "Analytics"}
              highlight={activeCategory === "Analytics"}
              onClick={() => setActiveCategory("Analytics")}
            />
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/arrow-growth-20-filled.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "Finance"
                      ? "white-yellow-icon"
                      : "invert-0"
                  )}
                />
              }
              label="Finance"
              active={activeCategory === "Finance"}
              highlight={activeCategory === "Finance"}
              onClick={() => setActiveCategory("Finance")}
            />
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/design-ideas-28-regular.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "Design"
                      ? "white-yellow-icon"
                      : "invert-0"
                  )}
                />
              }
              label="Design Marketing"
              active={activeCategory === "Design"}
              highlight={activeCategory === "Design"}
              onClick={() => setActiveCategory("Design")}
            />
            <NavItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/marketing.svg"
                  height={24}
                  width={24}
                  className={cn(
                    activeCategory === "Marketing"
                      ? "white-yellow-icon"
                      : "invert-0"
                  )}
                />
              }
              label="Marketing"
              active={activeCategory === "Marketing"}
              highlight={activeCategory === "Marketing"}
              onClick={() => setActiveCategory("Marketing")}
            />
          </div>

          {/* Bottom Button */}
          <div className="py-2">
            <button
              onClick={() => handleScroll("down")}
              disabled={atBottom}
              className={`w-full h-[46px] p-[12px] rounded-full border border-[#F9DB6F]  flex items-center justify-center gap-[10px] ${
                atBottom ? "opacity-50 cursor-not-allowed " : "]"
              }`}
            >
              <ChevronDown className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Middle Sidebar */}
        {activeCategory ? (
          <div className="w-full md:w-[1034px] h-full max-h-[625px] rounded-[20px] gap-[10px] pt-[54px] pr-[36px] pb-[54px] pl-[36px] bg-[#191919] ">
            <CategoryItem
              label="Training"
              active={activeCategoryFloder === "Training"}
              onClick={() => setActiveCategoryFloder("Training")}
            />
            <CategoryItem
              label="Troubleshooting"
              active={activeCategoryFloder === "Troubleshooting"}
              onClick={() => setActiveCategoryFloder("Troubleshooting")}
            />
            <CategoryItem
              label="Tools/Software"
              active={activeCategoryFloder === "Tools/Software"}
              onClick={() => setActiveCategoryFloder("Tools/Software")}
            />

            <div className="mt-4">
              <CategoryItem
                label="Policies"
                expanded={isPoliciesExpanded}
                active={activeCategoryFloder === "Policies"}
                onClick={() => {
                  setActiveCategoryFloder("Policies");
                  setPoliciesExpanded((prev) => !prev);
                }}
              />

              {isPoliciesExpanded && (
                <div className="mx-5 mt-5 space-y-5">
                  {["Warranty", "Return Policy", "Cancellation"].map(
                    (label) => (
                      <SubcategoryItem
                        key={label}
                        label={label}
                        active={activeSubcategory === label}
                        highlight={activeSubcategory === label}
                        onClick={() => setActiveSubcategory(label)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-[334px] h-[90vh]  rounded-[20px] gap-[10px] pt-[54px] pr-[36px] pb-[54px] pl-[36px] bg-[#191919]">
            <h1 className="text-xl font-medium">
              To select the folder, please choose category first
            </h1>
          </div>
        )}

        {/* Main Content */}
        {activeCategory ? (
          <div className=" h-full rounded-[20px] gap-[10px] pt-[24px] pr-[13px] pb-[24px] pl-[13px] bg-[#191919]">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between ">
                <div className="flex items-center">
                  <h2 className="font-urbanist font-semibold text-[40px] leading-[20px] align-middle mr-3 ">
                    Warranty
                  </h2>
                  <div className="ml-2 flex items-center cursor-pointer gap-4">
                    <div className="relative inline-block">
                      {!isCopied ? (
                        <Copy
                          onClick={() => copyToClipboard("Your text to copy")}
                          className="h-[28px] w-[28px] cursor-pointer text-white hover:text-white transition-colors"
                        />
                      ) : (
                        <CopyCheck className="h-[28px] w-[28px] text-white transition-colors" />
                      )}
                    </div>

                    <div className="relative inline-block">
                      {/* Trigger Button */}
                      <Button
                        ref={triggerRef}
                        className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-transparent"
                        onClick={() => setShowFloating((prev) => !prev)}
                      >
                        <Ellipsis className="h-5 w-5 text-white" />
                      </Button>

                      {/* Floating Menu */}
                      {showFloating && (
                        <div
                          ref={floatingRef}
                          className="absolute right-0 top-10 w-[199px] h-[220px] bg-[#2C2D2E] border border-[#3A3B3C] rounded-[10px] shadow-lg z-10 p-[14px] flex flex-col gap-[10px] text-left"
                        >
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]  rounded-[4px] cursor-pointer"
                            onClick={() => setShowFloating((prev) => !prev)}
                          >
                            <Edit className="h-4 w-4 hover:text-[#F9DB6F] " />
                            <span>Edit</span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => setShowFloating((prev) => !prev)}
                          >
                            <Trash2 className="h-4 w-4 hover:text-[#F9DB6F]" />
                            <span className=" font-urbanist font-medium text-sm leading-6 tracking-normal  text-white rounded">
                              Delete
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => setShowFloating((prev) => !prev)}
                          >
                            <Save className="h-4 w-4 hover:text-[#F9DB6F]" />
                            <span>Save Card</span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => setShowFloating((prev) => !prev)}
                          >
                            <ArchiveIcon className="h-4 w-4 hover:text-[#F9DB6F]" />
                            <span>Archive Card</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side user info */}
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full  flex items-center justify-center">
                    <Image
                      src="/CheckMark.png"
                      width={47.67}
                      height={47.67}
                      alt="checkmark"
                    />
                  </div>
                  <div className="flex w-full items-end bg-[#FFFFFF14] rounded-full p-2 gap-3">
                    <div className="h-10 w-10 ">
                      <Image
                        src="/Pic1.png"
                        alt="User"
                        className="rounded-full"
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="flex flex-col text-[20] ">
                      <span className="font-urbanist font-medium  leading-[100%]">
                        John Doe
                      </span>
                      <span
                        className="text-xs text-[#F9DB6F] underline cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Reassign
                      </span>
                      <ReassignUser
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAssign={handleAssignUser}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Subheading */}
              <h3 className="font-urbanist font-semibold text-[28px] leading-[20px] align-middle text-[#828282] mb-4">
                Policies
              </h3>

              {/* Text Content */}
              <div className="font-urbanist font-medium text-[20px] leading-[40px] align-middle ">
                <p className=" mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit, sed do eiusmod tempor incididunt
                  ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* File & Tags */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-[40px] w-[40px]" />
                    <span className="ml-2 font-urbanist font-medium text-[20px] leading-[100%]">
                      Warranty.pdf
                    </span>
                  </div>
                  <div>
                    {/* <div className="font-urbanist font-medium text-[16px] leading-[20px] align-middle">Tags:</div> */}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <div className="bg-[#F9DB6F] w-[113px] h-[24px] text-black text-xs px-2 py-1 rounded-[4px] flex items-center">
                        Software Rights{" "}
                        <span className="ml-1 cursor-pointer   h-[16px]">
                          ×
                        </span>
                      </div>
                      <div className="bg-[#3A3B3C] text-white text-xs px-2 py-1 rounded-[4px]">
                        Design
                      </div>
                      <div className="bg-[#F9DB6F] text-black text-xs px-2 py-1 rounded-[4px] flex items-center">
                        Product Rules{" "}
                        <span className="ml-1 cursor-pointer w-[16px] h-[16px]">
                          ×
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[90vh] rounded-[20px] gap-[10px] pt-[24px] pr-[13px] pb-[24px] pl-[13px] bg-[#191919]">
            <h1 className="text-xl font-medium">
              To select the folder, please choose category first
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
