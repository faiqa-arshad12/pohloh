"use client";

import {useEffect, useState} from "react";
import {Loader} from "lucide-react";
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
import {Icon} from "@iconify/react/dist/iconify.js";
import {useRole} from "../ui/Context/UserContext";
import {useUserHook} from "@/hooks/useUser";

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
  verificationperiod?: Date | string;
  verification_duration?: string;
};

const filters = ["Monthly", "Weekly", "Yearly"];

interface UnverifiedCardProps {
  cards: UnverifiedCard[];
  isAnalytic?: boolean;
}

export function UnverifiedCards({cards, isAnalytic}: UnverifiedCardProps) {
  const [selectedFilter, setSelectedFilter] = useState("Monthly");
  const [filteredCards, setFilteredCards] = useState<UnverifiedCard[]>([]);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);
  const {roleAccess} = useRole();
  const {userData} = useUserHook();

  const router = useRouter();

  useEffect(() => {
    if (cards) {
      const unverifiedCards = cards.filter((card) => !card.is_verified);

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

  const getNewVerificationDate = (duration: string) => {
    const now = new Date();
    switch (duration) {
      case "2 Weeks":
        return new Date(now.setDate(now.getDate() + 14));
      case "1 Month":
        return new Date(now.setMonth(now.getMonth() + 1));
      case "6 Months":
        return new Date(now.setMonth(now.getMonth() + 6));
      case "1 Year":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return null;
    }
  };

  const handleVerifyCard = async (
    cardId: string,
    date?: Date | string,
    duration?: string
  ) => {
    // Prefer duration from argument, fallback to card's verification_duration if available
    const card = filteredCards.find((c) => c.id === cardId);
    const effectiveDuration = duration || card?.verification_duration;
    let verificationDate = date ? new Date(date) : null;
    const now = new Date();

    // If expired
    if (verificationDate && verificationDate < now) {
      if (effectiveDuration && effectiveDuration !== "Custom Date") {
        // Auto-update to new date based on duration
        verificationDate = getNewVerificationDate(effectiveDuration);
        ShowToast(
          "Verification period was expired and has been updated to a new period.",
          "info"
        );
      } else {
        // Custom Date and expired
        ShowToast(
          "Verification period cannot be in the past. Please update the verification period.",
          "error"
        );
        return;
      }
    }

    // Proceed with verification using the (possibly updated) verificationDate
    const url = `${apiUrl}/cards/${cardId}`;
    try {
      setCardId(cardId);
      setIsVerifying(true);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_verified: true,
          verificationperiod: verificationDate
            ? verificationDate.toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      ShowToast("Card verified successfully!");

      // Remove the verified card from the local state
      setFilteredCards((prev) => prev.filter((c) => c.id !== cardId));

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

  const isVerificationPeriodExpired = (date?: Date | string) => {
    if (!date) return false;
    return new Date(date) < new Date();
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
        {roleAccess == "admin" &&
        isAnalytic &&
        (userData?.team_id === null || !userData?.team_id) ? (
          <div className="bg-[#2a2a2a] px-4 py-4 rounded-lg text-center text-[#6F767E] h-full flex items-center justify-center">
            No unverified cards available
          </div>
        ) : filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col bg-[#2a2a2a] px-4 py-4 rounded-lg"
              style={{minHeight: "100px"}}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="bg-[#F9DB6F] p-2 rounded-full flex-shrink-0">
                    {/* <Info size={16} className="text-black" /> */}
                    <Icon
                      icon="hugeicons:information-square"
                      width="16"
                      height="16"
                      color="#232D39"
                    />{" "}
                  </div>
                  <div className="flex flex-col flex-grow overflow-hidden">
                    <p className="text-[20px] font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
                      {/* {card.title?.slice(0, 50) +
                        (card.title?.length > 50 ? "..." : "")} */}
                      {card.title}
                    </p>

                    <span className="text-[11px] text-white">
                      {card?.category_id?.name}
                    </span>
                  </div>
                </div>
                {!isAnalytic ? (
                  <div className="flex items-center justify-center text-center flex-shrink-0">
                    <Button
                      variant="outline"
                      className="max-w-[88px] border-white text-white hover:bg-[#333435] hover:text-white bg-[#333435] !h-[27.58px] !cursor-pointer px-9 rounded-[5.55px]"
                      onClick={() => {
                        handleVerifyCard(
                          card.id,
                          card.verificationperiod,
                          card.verification_duration
                        );
                      }}
                      // disabled={
                      //   isVerificationPeriodExpired(card.verificationperiod) ||
                      //   isVerifying
                      // }
                      // title={
                      //   isVerificationPeriodExpired(card.verificationperiod)
                      //     ? "Verification period has expired"
                      //     : ""
                      // }
                    >
                      {isVerifying && cardId === card.id ? (
                        <Loader />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-[44px] items-center gap-2 bg-[#FFFFFF0A] rounded-full py-2 px-4">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <img
                          src={
                            card.card_owner_id?.profile_picture ||
                            "/placeholder-profile.svg"
                          }
                          alt={card.card_owner_id?.first_name}
                          width={30}
                          height={30}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-urbanist font-normal text-xl leading-[100%] tracking-normal text-white">
                        {`${card.card_owner_id?.first_name} ${card.card_owner_id?.last_name}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-[14px] text-[#6F767E] line-clamp-1 mt-2">
                {stripHtml(card.content)}
              </p>
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
          disabled={filteredCards.length === 0}
        >
          View All ({filteredCards.length})
        </Button>
      </div>
    </div>
  );
}
