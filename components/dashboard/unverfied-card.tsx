"use client";

import {useEffect, useState} from "react";
import {Info, Loader} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {apiUrl, CardType} from "@/utils/constant";
import {useRouter} from "next/navigation";
import {stripHtml} from "@/lib/stripeHtml";
import {ShowToast} from "../shared/show-toast";
import DeleteConfirmationModal from "../shared/delete-modal";

type UnverifiedCard = {
  id: string;
  title: string;
  content: string;
  type: CardType;
  category_id: {
    name: string;
  };
  is_verified: boolean;
  created_at: string;
  card_owner_id: {
    first_name: string;
    last_name: string;
    profile_picture: string;
  };
  verificationperiod?:Date|string
};

const filters = ["Monthly", "Weekly", "Yearly"];

interface UnverifiedCardProps {
  cards: UnverifiedCard[];
}

export function UnverifiedCards({cards}: UnverifiedCardProps) {
  const [selectedFilter, setSelectedFilter] = useState("Monthly");
  const [filteredCards, setFilteredCards] = useState<UnverifiedCard[]>([]);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (cards) {
      const unverifiedCards = cards.filter(
        (card) => !card.is_verified
      );

      const now = new Date();
      let filtered = unverifiedCards;
      switch (selectedFilter) {
        case "Monthly":
          filtered = unverifiedCards.filter((card) => {
            const cardDate = new Date(card.created_at);
            return cardDate >= new Date(now.getFullYear(), now.getMonth(), 1);
          });
          break;
        case "Weekly":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          filtered = unverifiedCards.filter((card) => {
            const cardDate = new Date(card.created_at);
            return cardDate >= weekStart;
          });
          break;
        case "Yearly":
          filtered = unverifiedCards.filter((card) => {
            const cardDate = new Date(card.created_at);
            return cardDate >= new Date(now.getFullYear(), 0, 1);
          });
          break;
        default:
          break;
      }

      setFilteredCards(filtered);
    }
  }, [cards, selectedFilter]);

  useEffect(() => {
    const container = document.querySelector(".cards-container");
    if (container) {
      setHasScrollbar(container.scrollHeight > container.clientHeight);
    }
  }, [filteredCards]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
  };
  const handleVerifyCard = async (cardId: string, date?: Date | string) => {
    const url = `${apiUrl}/cards/${cardId}`;

    try {
      // ✅ Check if the verification date is in the past
      if (date && new Date(date) < new Date()) {
        ShowToast("Cannot verify. Verification period has expired.", "error");
        return;
      }

      setCardId(cardId);
      setIsVerifying(true);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_verified: true }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      ShowToast("Card verified successfully!");
      return data;

    } catch (error: any) {
      console.error("Error verifying card:", error.message || error);
      ShowToast(
        `Error verifying card: ${error.message || "Unknown error"}`,
        "error"
      );
      throw error;
    } finally {
      setIsVerifying(false);
      setCardId(null);
    }
  };


  return (
    <div
      className="relative bg-[#1a1a1a] rounded-xl px-6 py-6 w-full max-w-auto text-white"
      style={{borderRadius: "30px", height: "500px"}}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative !cursor-pointer">
        <h2 className="text-[24px] font-normal">Unverified Cards</h2>

        {/* Dropdown Button */}
        <div className="relative">
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="cursor-pointer bg-[#0E0F11] text-white w-[114px] rounded-full border-0 px-3 py-2 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent className="bg-[#0E0F11] text-white rounded-xl shadow-xl text-sm">
              {filters.map((filter) => (
                <SelectItem
                  key={filter}
                  value={filter}
                  className="cursor-pointer  rounded-md  focus:outline-none"
                >
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`cards-container space-y-3 overflow-y-auto ${
          hasScrollbar ? "pr-3" : "pr-0"
        }`}
        style={{
          height: "calc(100% - 120px)",
          maxHeight: "380px",
        }}
      >
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between bg-[#2a2a2a] px-4 py-4 rounded-lg"
              style={{minHeight: "100px"}}
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#F9DB6F] p-2 rounded-full">
                      <Info size={16} className="text-black" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[20px] font-semibold">
                        {card.title}
                      </h3>
                      <span className="text-[11px] text-white ml-1">
                        {card?.category_id?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-center ">
                    <Button
                      variant="outline"
                      className="w-full border-white text-white hover:bg-[#333435] hover:text-white bg-[#333435] !h-[27.58] !cursor-pointer px-9"
                      onClick={() => {
                        handleVerifyCard(card.id, card.verificationperiod);
                      }}
                    >
                      {isVerifying && cardId === card.id ? (
                        <Loader />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[14px] text-[#6F767E] line-clamp-1">
                  {stripHtml(card.content)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#2a2a2a] px-4 py-4 rounded-lg text-center text-[#6F767E] h-full flex items-center justify-center">
            No unverified cards available
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="mt-4 flex items-center justify-center text-center">
        <Button
          variant="outline"
          className="w-full border-white text-white hover:bg-[#333435] hover:text-white bg-[#333435] !h-[42px] !cursor-pointer"
          onClick={() => {
            router.push("/knowledge-base/cards?verified=false");
          }}
        >
          View All ({filteredCards.length})
        </Button>
      </div>
    </div>
  );
}
