"use client";

import {useState, useEffect, useCallback} from "react";
import {
  ArrowUpToLine,
  Edit,
  MoreHorizontal,
  FilterIcon as Funnel,
  MoveLeft,
  Trash2,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import Table from "@/components/ui/table";
import {useRouter} from "next/navigation";
import SearchInput from "@/components/shared/search-input";
import {useUser} from "@clerk/nextjs";
import {CardStatus} from "@/utils/constant";
import {Skeleton} from "../ui/skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {toast} from "sonner";
import ArrowBack from "../shared/ArrowBack";
import DeleteConfirmationModal from "./delete-card";

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

export function KnowledgeBaseDraft({
  status,
  verified,
}: KnowledgeBaseDraftProps) {
  const router = useRouter();
  const {user} = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardId, setCardId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<"publish" | "edit" | "delete" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Helper function to parse boolean values that might be strings
  const parseBooleanValue = (value: any): boolean => {
    if (value === "false" || value === "0") return false;
    if (value === "true" || value === "1") return true;
    return Boolean(value);
  };

  const fetchCards = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch user data
      const userRes = await fetch(`${apiUrl}/api/users/${user.id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
      });

      if (!userRes.ok) throw new Error("Failed to fetch user");

      const userData = await userRes.json();
      const orgId = userData?.user?.organizations?.id;
      if (!orgId) return;

      // Fetch cards for the org
      const cardsRes = await fetch(
        `${apiUrl}/api/cards/organizations/${orgId}`,
        {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
        }
      );

      if (!cardsRes.ok) throw new Error("Failed to fetch cards");

      const {cards} = await cardsRes.json();
      let filteredCards = cards;

      // Apply filters
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

      setCards(filteredCards || []);
      setFilteredCards(filteredCards || []);
    } catch (err) {
      console.error("Error fetching cards:", err);
      toast.error("Failed to load cards");
    } finally {
      setIsLoading(false);
    }
  }, [user, status, verified, apiUrl]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Filter cards based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter((card) =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  }, [searchTerm, cards]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
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
        const res = await fetch(`${apiUrl}/api/cards/${id}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
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
        const res = await fetch(`${apiUrl}/api/cards/${id}`, {
          method: "DELETE",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
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
              onChange={handleSearch}
              // placeholder="Search by title..."
            />
            <Button
              className="bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black p-2 rounded-md"
              aria-label="Filter"
            >
              <Funnel className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="mt-4 overflow-x-auto">
          {isLoading ? (
           <div className="space-y-4">
           {Array.from({ length: 5 }).map((_, i) => {
             const widthPercent = Math.floor(70 + Math.random() * 30); // between 70% and 100%
             return (
               <Skeleton
                 key={i}
                 className="h-[28px]"
                 style={{ width: `${widthPercent}%` }}
               />
             );
           })}
         </div>

          ) : filteredCards.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? "No matching cards found" : "No data found."}
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
                    <DropdownMenuContent className="min-w-[160px] bg-[#222] rounded-md shadow-lg py-2 p-2 z-50">
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
                        onClick={() => handleCardAction(row.id, "publish")}
                        disabled={isProcessing}
                      >
                        <ArrowUpToLine className="h-4 w-4 hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]" />
                        <span>Publish</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
                        onClick={() => handleCardAction(row.id, "edit")}
                        disabled={isProcessing}
                      >
                        <Pencil className="h-4 w-4 hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]" />
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