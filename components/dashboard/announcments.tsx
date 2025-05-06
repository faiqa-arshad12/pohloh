"use client";

import {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import ViewAnnouncmentModal from "./modals/view-announcement";
import Image from "next/image";

type Card = {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
};

const demoCards: Card[] = [
  {
    id: "1",
    title: "Card Title",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra leo id metus vulputate, ut pretium ipsum tempor. Sed volutpat libero a tortor cursus faucibus. Vivamus vel ultricies sapien. Suspendisse vel tortor cursus felis nulla tempor.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra leo id metus vulputate, ut pretium ipsum tempor. Sed volutpat libero a tortor cursus faucibus. Vivamus vel ultricies sapien. Suspendisse vel tortor cursus felis nulla tempor.",
    author: {
      name: "Mattie James ",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "2",
    title: "Design Tips",
    description:
      "Nullam eget felis eget nunc lobortis mattis aliquam faucibus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.",
    author: {
      name: "Alex Morgan",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "3",
    title: "Development Notes",
    description:
      "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.",
    author: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "4",
    title: "Project Planning",
    description:
      "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.",
    author: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "5",
    title: "User Research",
    description:
      "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.",
    author: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: "6",
    title: "Marketing Strategy",
    description:
      "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.",
    author: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
];

export function AnnouncementCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(demoCards[0]);

  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === demoCards.length - 1;

  const goToPrevious = () => {
    if (isTransitioning || isFirstCard) return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (isTransitioning || isLastCard) return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setDisplayedCard(demoCards[currentIndex]);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning]);

  return (
    <>
      <ViewAnnouncmentModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
      <div className="max-w-auto h-full px-6 py-6 bg-[#1e1e1e] flex flex-col gap-5" style={{borderRadius:'30px'}}>
        <div className="flex justify-between">
          <h2 className="text-white text-[24px] font-normal text-left">
            Announcements
            
          </h2>
          <div className="w-full flex justify-end">
            <div className="flex items-center space-x-2">
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isFirstCard
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToPrevious}
                aria-label="Previous card"
                disabled={isFirstCard}
              >
                <ChevronLeft size={16} className="ml-[1px]" />
              </button>
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isLastCard
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToNext}
                aria-label="Next card"
                disabled={isLastCard}
              >
                <ChevronRight size={16} className="mr-[-1px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Image container - full width with reduced height */}
          <div className="w-full h-[180px]">
            <Image
              src="/announcement.svg"
              className="w-full h-[150px] object-cover rounded-xl"
              alt="Announcement icon"
              width={30}
              height={30}
            />
          </div>

          <h3 className="text-white font-normal text-[20px] mt-2">
            {displayedCard.title}
          </h3>
          <p className="text-[#6F767E] text-[12px] line-clamp-4 h-20">
            {displayedCard.description}
          </p>

          <div className="h-[1px] bg-[#828282]" />
        </div>

        <div className="flex items-center gap-2 flex-row justify-between">
          <Button
            variant="outline"
            className="bg-[#333435] border-white text-[16px] text-white hover:bg-[#333435] hover:text-white cursor-pointer w-[175px] h-[42px] font-normal"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            View Announcement
          </Button>
          <div className="inline-flex items-center gap-2 bg-[black] rounded-full py-2 px-4">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={"/placeholder-profile.svg"}
                alt={displayedCard.author.name}
                width={30}
                height={30}
                className="object-cover"
              />
            </div>
            <span className="font-urbanist font-normal text-xl leading-[100%] tracking-normal text-white ">
              {displayedCard.author.name}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
