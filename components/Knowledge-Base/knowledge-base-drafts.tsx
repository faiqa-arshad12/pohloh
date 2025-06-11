"use client";

import {useState, useEffect, useCallback} from "react";
import {MoreHorizontal, FilterIcon as  Trash2} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Table from "@/components/ui/table";
import {useRouter} from "next/navigation";
import SearchInput from "@/components/shared/search-input";
import {useUser} from "@clerk/nextjs";
import {apiUrl, CardStatus} from "@/utils/constant";
import {Skeleton} from "../ui/skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {toast} from "sonner";
import ArrowBack from "../shared/ArrowBack";
import DeleteConfirmationModal from "./delete-card";
import {Icon} from "@iconify/react";
import {useUserHook} from "@/hooks/useUser";
import {
  TimeFilter,
  TimePeriod,
  filterByTimePeriod,
} from "@/components/shared/TimeFilter";

type Card = {
  id: string;
  title: string;
  is_verified: boolean;
  category_id: {
    id: string;
    name: string;
  };
  folder_id: {
    id: string;
    name: string;
  };
  card_status: string;
  tags: string[];
  verificationperiod: string;
  created_at: string;
  content: string;
};

type KnowledgeBaseDraftProps = {
  status?: string;
  verified?: boolean | string;
};

type FilterState = {
  searchTerm: string;
  timePeriod: TimePeriod;
};

export function KnowledgeBaseDraft({
  status,
  verified,
}: KnowledgeBaseDraftProps) {
  const router = useRouter();
  const {user} = useUser();

  // Initialize filters without URL params
  const getInitialFilters = () => {
    return {
      searchTerm: "",
      timePeriod: TimePeriod.ALL,
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters());
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardId, setCardId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<"publish" | "edit" | "delete" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const {userData} = useUserHook();

  // Helper function to parse boolean values that might be strings
  const parseBooleanValue = (value: any): boolean => {
    if (value === "false" || value === "0") return false;
    if (value === "true" || value === "1") return true;
    return Boolean(value);
  };

  const fetchCards = useCallback(async () => {
    if (!userData) return;

    setIsLoading(true);

    try {
      if (!userData?.org_id) return;

      const cardsRes = await fetch(
        `${apiUrl}/cards/organizations/${userData?.org_id}`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            role: userData?.role,
            userId: userData?.id,
          }),
        }
      );

      if (!cardsRes.ok) throw new Error("Failed to fetch cards");

      const {cards} = await cardsRes.json();
      let filteredCards = cards || [];

      // Apply initial status filter if provided
      if (status) {
        filteredCards = filteredCards.filter(
          (card: Card) => card.card_status === status
        );
      }

      if (verified !== undefined) {
        const verifiedBool = parseBooleanValue(verified);
        filteredCards = filteredCards.filter(
          (card: Card) => card.is_verified === verifiedBool
        );
      }

      setCards(filteredCards);
      setFilteredCards(filteredCards);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching cards:", err);
      toast.error("Failed to load cards");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, status, verified, apiUrl, userData]);

  useEffect(() => {
    if (userData) fetchCards();
  }, [fetchCards, userData]);

  // Simplified filtering logic
  const applyFilters = useCallback((cards: Card[], filters: FilterState) => {
    // First apply time period filter
    const filteredCards = filterByTimePeriod(cards, filters.timePeriod);

    // Then apply search term filter
    return filteredCards.filter((card) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return (
        filters.searchTerm === "" ||
        card.title.toLowerCase().includes(searchTermLower) ||
        card.category_id.name.toLowerCase().includes(searchTermLower) ||
        card.folder_id.name.toLowerCase().includes(searchTermLower) ||
        card.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
      );
    });
  }, []);

  // Update filtered cards when filters change
  useEffect(() => {
    if (cards.length > 0) {
      setFilteredCards(applyFilters(cards, filters));
    }
  }, [cards, filters, applyFilters]);

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    const newFilters = {...filters, [key]: value};
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      searchTerm: "",
      timePeriod: TimePeriod.ALL,
    };
    setFilters(newFilters);
  };

  const handleCardAction = async (
    id: string,
    action: "publish" | "edit" | "delete"
  ) => {
    if (action === "edit") {
      router.push(`create-knowledge-base?cardId=${id}`);
      return;
    }

    setIsProcessing(true);
    try {
      if (action === "publish") {
        const res = await fetch(`${apiUrl}/cards/${id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          // credentials: "include",
          body: JSON.stringify({
            card_status: CardStatus.PUBLISH,
            is_verified: true,
          }),
        });

        if (res.ok) {
          setCards(cards.filter((card) => card.id !== id));
          setFilteredCards(filteredCards.filter((card) => card.id !== id));
          toast.success("Card published successfully");
        } else {
          throw new Error("Failed to publish card");
        }
      } else if (action === "delete") {
        const res = await fetch(`${apiUrl}/cards/${id}`, {
          method: "DELETE",
          headers: {"Content-Type": "application/json"},
          // credentials: "include",
        });

        if (res.ok) {
          setCards(cards.filter((card) => card.id !== id));
          setFilteredCards(filteredCards.filter((card) => card.id !== id));
          toast.success("Card deleted successfully");
        } else {
          throw new Error("Failed to delete card");
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing card:`, err);
      toast.error(`Failed to ${action} card`);
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };

  const columns = [
    {Header: "Card", accessor: "title"},
    {Header: "Category", accessor: "category_id.name"},
    {Header: "Folder", accessor: "folder_id.name"},
  ];

  return (
    <div className="text-white">
      <div className="mx-auto">
        <header className="py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 cusror-pointer">
            <ArrowBack link="/knowledge-base" />
            <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
              {status ? "Explore Card Drafts" : "Explore Knowledge Cards"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              onChange={(term) => handleFilterChange("searchTerm", term)}
              placeholder="Search by title, department, tags..."
            />
            <TimeFilter
              timePeriod={filters.timePeriod}
              onTimePeriodChange={(period) =>
                handleFilterChange("timePeriod", period)
              }
              onClearFilters={clearFilters}
            />
          </div>
        </header>

        {/* Active filters display - only show when user has searched or filtered */}

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({length: 5}).map((_, i) => {
                const widthPercent = Math.floor(70 + Math.random() * 30); // between 70% and 100%
                return (
                  <Skeleton
                    key={i}
                    className="h-[28px]"
                    style={{width: `${widthPercent}%`}}
                  />
                );
              })}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {filters.searchTerm
                ? "No matching cards found"
                : "No data found."}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredCards}
              tableClassName="min-w-full text-sm sm:text-base shadow rounded-lg border-collapse"
              headerClassName="bg-[#F9DB6F] font-urbanist font-medium text-base text-black text-left"
              bodyClassName="py-3 px-4"
              cellClassName="border-t border-[#E0EAF5] py-3 px-4 align-middle whitespace-nowrap font-urbanist text-base h-[68px]"
              renderActions={(row) => (
                <div className="flex justify-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isProcessing}>
                      <button
                        className="h-8 w-8 flex items-center justify-center text-lg cursor-pointer rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Card actions"
                      >
                        <MoreHorizontal className="h-5 w-5 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[160px] bg-[#222] rounded-md shadow-lg py-2 p-2 z-50 w-[154px]">
                      {row.card_status !== CardStatus.PUBLISH && (
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
                          onClick={() => handleCardAction(row.id, "publish")}
                          disabled={isProcessing}
                        >
                          <Icon
                            icon="material-symbols:publish-rounded"
                            width="24"
                            height="24"
                          />

                          <span>Publish</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
                        onClick={() => handleCardAction(row.id, "edit")}
                        disabled={isProcessing}
                      >
                        <Icon
                          icon="iconamoon:edit-light"
                          width="24"
                          height="24"
                        />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#5C4B2D] hover:text-[#F9DB6F] cursor-pointer"
                        onClick={() => {
                          setCardId(row.id);
                          setAction("delete");
                          setIsOpen(true);
                        }}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4 hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            />
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        id={cardId}
        action={action}
        onConfirm={handleCardAction}
        isLoading={isProcessing}
        title="Knowledge Card"
      />
    </div>
  );
}
