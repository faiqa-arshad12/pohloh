"use client";

import {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {CardStatus, CardType} from "@/utils/constant";
import {useRouter} from "next/navigation";
import {stripHtml} from "@/lib/stripeHtml";

type Card = {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
};

interface SavedCardsProp {
  cards: any;
}

export function SavedCards({cards}: SavedCardsProp) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedCard, setDisplayedCard] = useState<any | null>(null);
  const [savedCards, setSavedCards] = useState<Card[]>([]);
  const router = useRouter();
  console.log(cards, "cards");

  useEffect(() => {
    // Filter saved cards and set initial state
    if (cards) {
      const filteredCards = cards?.filter(
        (card: any) =>
          card?.card_status === CardStatus.SAVED &&
           card.is_verified
      );
      setSavedCards(filteredCards || []);

      if (filteredCards?.length > 0) {
        setDisplayedCard(filteredCards[0]);
      }
    }
  }, [cards]);

  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === savedCards.length - 1;

  const goToPrevious = () => {
    if (isTransitioning || isFirstCard || savedCards.length === 0) return;

    setIsTransitioning(true);
    setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (isTransitioning || isLastCard || savedCards.length === 0) return;

    setIsTransitioning(true);
    setCurrentIndex(currentIndex + 1);
  };

  // Update displayed card with transition effect
  useEffect(() => {
    if (isTransitioning && savedCards.length > 0) {
      const timer = setTimeout(() => {
        setDisplayedCard(savedCards[currentIndex]);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning, savedCards]);
  console.log(savedCards, "cards");

  // Handle case when there are no saved cards
  if (savedCards.length === 0 || !displayedCard) {
    return (
      <div
        className="max-w-auto h-full px-6 py-6 bg-[#191919] flex flex-col gap-5 pb-12"
        style={{borderRadius: "30px"}}
      >
        <h2 className="text-white text-[24px] font-normal">Saved Cards</h2>
        <div className="bg-[#1e1e1e] rounded-lg p-4 h-full flex items-center justify-center">
          <p className="text-[#6F767E]">No card available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-auto h-full px-6 py-6 bg-[#191919] flex flex-col gap-5 pb-12"
      style={{borderRadius: "30px"}}
    >
      <div className="flex items-center justify-between">
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

      <div className="bg-[#1e1e1e] rounded-lg p-4 h-full relative overflow-hidden">
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
          </div>

          <p className="text-[#6F767E] text-[14px] mb-4 line-clamp-3">
            {stripHtml(displayedCard.content)}
          </p>

          <div className="flex items-center justify-between absolute bottom-8 left-4 right-4 border-t border-[#828282]">
            <Button
              variant="outline"
              className="bg-[#333435] border-white text-[16px] mt-6 text-white hover:bg-[#333435] hover:text-white cursor-pointer w-[175px] h-[42px] font-normal"
              onClick={() => {
                router.push(
                  `knowledge-base/create-knowledge-base?cardId=${displayedCard.id}`
                );
              }}
            >
              View Card
            </Button>

            <div className="flex items-center gap-2 mt-6">
              <div className="inline-flex h-[44px] items-center gap-2 bg-[#1A1A1A] rounded-full py-2 px-4">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={
                      displayedCard.card_owner_id.profile_picture ||
                      "/placeholder-profile.svg"
                    }
                    alt={displayedCard.card_owner_id.first_name}
                    width={30}
                    height={30}
                    className="object-cover"
                  />
                </div>
                <span className="font-urbanist font-normal text-xl leading-[100%] tracking-normal text-white">
                  {`${displayedCard.card_owner_id.first_name} ${displayedCard.card_owner_id.last_name}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
