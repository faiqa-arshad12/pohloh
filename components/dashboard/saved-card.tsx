"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra leo id metus vulputate, ut pretium ipsum tempor. Sed volutpat libero a tortor cursus faucibus. Vivamus vel ultricies sapien. Suspendisse vel tortor cursus felis nulla tempor.",
    author: {
      name: "Mattie James",
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
      "Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.Cras fermentum odio eu feugiat pretium nibh ipsum consequat. Vitae congue eu consequat ac felis donec et odio pellentesque diam. Sit amet nisl suscipit adipiscing bibendum est ultricies integer.",
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

export function SavedCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Update displayed card with transition effect
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setDisplayedCard(demoCards[currentIndex]);
        setIsTransitioning(false);
      }, 150); // Half of transition duration for crossfade effect

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning]);

  return (
    <div className="max-w-auto h-full px-6 py-6  bg-[#191919] flex flex-col gap-5 pb-12" style={{borderRadius:'30px'}}>
      <div className="flex items-center justify-between ">
        <h2 className="text-white text-[24px] font-normal">Saved Cards</h2>
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
            <ChevronLeft size={16}  className="ml-[1px]"/>
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
            <ChevronRight size={16} className="mr-[-1px] "/>
          </button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-lg p-4 h-full  relative overflow-hidden">
        <div
          className={cn(
            "transition-opacity duration-300 ease-in-out absolute inset-0 p-4",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="flex justify-center items-start mb-2">
            <h3 className="text-white font-normal text-[20px] p-4">
              {displayedCard.title}
            </h3>
            {/* <button className="text-gray-400 hover:text-white">
              <MoreVertical size={18} />
            </button> */}
          </div>

          <p className="text-[#6F767E] text-[14px] mb-4 line-clamp-3 ">
            {displayedCard.description}
          </p>
          {/* { <div className="h-[1px] bg-[#828282] mt-10" />
          <div className="flex justify-center items-center" />} */}

          <div className="flex items-center justify-between absolute bottom-8 left-4 right-4 border-t border-[#828282]">

            <Button
              variant="outline"
              className="bg-[#333435] border-white text-[16px] mt-6 text-white hover:bg-[#333435] hover:text-white cursor-pointer  w-[175px] h-[42px] font-normal"
            >
              View Card
            </Button>

            <div className="flex items-center gap-2 mt-6">
              <div className="inline-flex  h-[44px] items-center gap-2 bg-[#1A1A1A] rounded-full py-2 px-4">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={"/placeholder-profile.svg"}
                    alt={"displayedCard.author.nam"}
                    width={30}
                    height={30}
                    className="object-cover"
                  />
                </div>
                {/* Avatar component is commented out as in the original code */}
                <span className="font-urbanist font-normal text-xl leading-[100%] tracking-normal text-white ">
                  {displayedCard.author.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
