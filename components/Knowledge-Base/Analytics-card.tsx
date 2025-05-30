"use client";
import {useEffect, useRef, useState} from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  FileText,
  Copy,
  Ellipsis,
  CopyCheck,
  Check,
  Pencil,
  Import,
  X,
} from "lucide-react";
import {CategoryItem, NavItem, SubcategoryItem} from "./buttons";
import {Button} from "../ui/button";
import {ReassignUserModal} from "./reassign-user";
import Image from "next/image";
import {useUser} from "@clerk/nextjs";
import Tag from "./tags";
import {Skeleton} from "@/components/ui/skeleton";
import {useRouter} from "next/navigation";
import {ShowToast} from "../shared/show-toast";
import {stripHtml} from "@/lib/stripeHtml";
import {renderIcon} from "@/lib/renderIcon";
import DeleteConfirmationModal from "../shared/delete-modal";
import {apiUrl, CardStatus} from "@/utils/constant";
import {Icon} from "@iconify/react";
import CreateAnnouncement from "../dashboard/modals/create-announcemnet";

interface Team {
  id: string;
  name: string;
  icon?: string;
  iconAttachment?: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  knowledge_card?: KnowledgeCard[];
}

interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  is_verified: boolean;
  card_owner_id: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture: string;
  };
  tags?: string[];
  created_at: string;
  type: string;
  subcategory_id?: string;
  category_id?: string;
  verificationperiod?: string | Date;
  card_status?: CardStatus;
  attachments?: {name: string; url: string}[];
}

interface AnalyticsCardProps {
  cardId?: string;
}

export default function AnalyticsCard({cardId}: AnalyticsCardProps) {
  const {user, isLoaded: isUserLoaded} = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeSubcategory, setActiveSubcategory] =
    useState<Subcategory | null>(null);
  const [activeItem, setActiveItem] = useState<KnowledgeCard | null>(null);
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Record<string, boolean>
  >({});
  const [showFloating, setShowFloating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [card, setCard] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>();

  const [isCardDeleteLoading, setIsCardDeleting] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [pathId, setPathId] = useState<null | string>(null);

  const [selectedCards, setSelectedCards] = useState<KnowledgeCard[]>([]);

  const [userDetails, setUserDetails] = useState<any>();

  // Add back the URL parameter handling effects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCard(params.get("selectForLearningPath") === "true" ? "true" : null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPathId(params.get("id"));
  }, []);

  const loadCardById = async (id: string) => {
    try {
      // Find the card in the existing data structure
      let cardFound = false;
      for (const team of teams) {
        if (!team.subcategories) continue;

        for (const subcategory of team.subcategories) {
          if (!subcategory.knowledge_card) continue;

          const card = subcategory.knowledge_card.find(
            (card) => card.id === id
          );
          if (card) {
            // Set the active states to display this card
            setActiveTeam(team);
            setActiveSubcategory(subcategory);
            setActiveItem(card);

            // Expand the subcategory containing this card
            setExpandedSubcategories((prev) => ({
              ...prev,
              [subcategory.id]: true,
            }));
            cardFound = true;
            break;
          }
        }
        if (cardFound) break;
      }

      // If card not found in existing data, fetch it directly
      if (!cardFound && userDetails?.user?.organizations?.id) {
        const response = await fetch(`${apiUrl}/cards/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch card details");
        }

        const cardData = await response.json();

        // Now fetch the team and subcategory this card belongs to
        if (cardData.subcategory_id) {
          const subcategoryResponse = await fetch(
            `${apiUrl}/subcategories/${cardData.subcategory_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (subcategoryResponse.ok) {
            const subcategoryData = await subcategoryResponse.json();

            // Find the team this subcategory belongs to
            const teamResponse = await fetch(
              `${apiUrl}/teams/${subcategoryData.team_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (teamResponse.ok) {
              const teamData = await teamResponse.json();

              // Update the active states
              setActiveTeam(teamData);
              setActiveSubcategory(subcategoryData);
              setActiveItem(cardData);

              // Expand the subcategory
              setExpandedSubcategories((prev) => ({
                ...prev,
                [subcategoryData.id]: true,
              }));

              // Add the card to the team's subcategory if it doesn't exist
              setTeams((prevTeams) => {
                return prevTeams.map((team) => {
                  if (team.id === teamData.id) {
                    return {
                      ...team,
                      subcategories: team.subcategories?.map((sub) => {
                        if (sub.id === subcategoryData.id) {
                          return {
                            ...sub,
                            knowledge_card: sub.knowledge_card?.some(
                              (card) => card.id === cardData.id
                            )
                              ? sub.knowledge_card
                              : [...(sub.knowledge_card || []), cardData],
                          };
                        }
                        return sub;
                      }),
                    };
                  }
                  return team;
                });
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading card by ID:", error);
      ShowToast("Failed to load card details", "error");
    }
  };

  // Update the card loading effects
  useEffect(() => {
    if (cardId && teams.length > 0 && userDetails) {
      loadCardById(cardId);
    }
  }, [cardId, teams, userDetails]);

  // Add a new effect to handle URL cardId parameter
  useEffect(() => {
    if (!isLoading && userDetails) {
      const params = new URLSearchParams(window.location.search);
      const urlCardId = params.get("cardId");
      if (urlCardId) {
        loadCardById(urlCardId);
      }
    }
  }, [isLoading, userDetails]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setAtTop(el.scrollTop === 0);
      setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
    }
  };
  const handleSaveCard = async (
    id: string,
    is_verified?: boolean,
    date?: string | Date
  ) => {
    if (date && new Date(date) < new Date()) {
      ShowToast("Cannot verify. Verification period has expired.", "error");
      return;
    }
    if (!id) {
      ShowToast("Invalid card ID", "error");
      return;
    }
    const cardData = is_verified
      ? {is_verified: true}
      : {card_status: CardStatus.SAVED};

    try {
      const res = await fetch(`${apiUrl}/cards/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        // credentials: "include",
        body: JSON.stringify({
          ...cardData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save card");
      }

      ShowToast(
        is_verified ? "Card verified successfully" : "Card Saved successfully"
      );
      // setActiveItem(null);
      // fetchData();
      // if (!is_verified) router.push("/dashboard");
    } catch (err) {
      console.error("Error saving card:", err);
      ShowToast("Something went wrong while saving the card", "error");
    } finally {
      setShowFloating(false);
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

    setTimeout(checkScroll, 200);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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
  useEffect(() => {
    if (!userDetails || !activeItem) return;

    const isOwner = userDetails.user.role === "owner";
    const isAdminOfTeam =
      userDetails.user.role === "admin" &&
      userDetails.user.team_id === activeItem.category_id;
    const isCardOwner = activeItem.card_owner_id?.id === userDetails.user.id;

    setCanEdit(isOwner || isAdminOfTeam || isCardOwner);
  }, [userDetails, activeItem]);

  const handleDeleteCard = async (id: string) => {
    try {
      setIsCardDeleting(true);

      const res = await fetch(`${apiUrl}/cards/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        // credentials: "include",
      });

      if (!res.ok) {
        throw new Error(res.statusText || "Failed to delete card");
      }

      ShowToast("Card deleted successfully", "success");
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete card error:", error);
      ShowToast(
        error instanceof Error ? error.message : "Failed to delete card",
        "error"
      );
    } finally {
      setIsCardDeleting(false);
    }
  };
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const response = await fetch(`${apiUrl}/users/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await response.json();
        setUserDetails(userData);
        const res = await fetch(
          `${apiUrl}/teams/organizations/categories/${userData.user.organizations?.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            // credentials: "include",
            body: JSON.stringify({
              role: userData.user.role,
              userId: userData.user.id,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch teams");
        }

        const mockData = await res.json();

        setTeams(mockData.teams || []);

        const initialExpandedState: Record<string, boolean> = {};
        mockData.teams?.forEach((team: Team) => {
          team.subcategories?.forEach((subcategory: Subcategory) => {
            initialExpandedState[subcategory.id] = false;
          });
        });
        setExpandedSubcategories(initialExpandedState);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isUserLoaded) {
      fetchData();
    }
  }, [user, isUserLoaded]);

  const toggleSubcategoryExpanded = (subcategoryId: string) => {
    setExpandedSubcategories((prev) => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId],
    }));
  };

  const handleTeamClick = (team: Team) => {
    setActiveTeam(team);
    setActiveSubcategory(team.subcategories?.[0] || null);
    setActiveItem(team.subcategories?.[0]?.knowledge_card?.[0] || null);
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setActiveSubcategory(subcategory);
    toggleSubcategoryExpanded(subcategory.id);
    setActiveItem(subcategory.knowledge_card?.[0] || null);
  };

  const toggleCardSelection = (item: KnowledgeCard) => {
    const isCardSelected = selectedCards.some((card) => card.id === item.id);

    if (isCardSelected) {
      // If already selected, remove it from the selection
      setSelectedCards((prev) => {
        const updatedCards = prev.filter((card) => card.id !== item.id);
        // Update localStorage when card is removed
        if (card === "true") {
          localStorage.setItem(
            "selectedLearningPathCards",
            JSON.stringify(updatedCards)
          );
        }
        return updatedCards;
      });
    } else {
      // If not selected, add it to the selection
      setSelectedCards((prev) => {
        const updatedCards = [...prev, item];
        // Update localStorage when card is added
        if (card === "true") {
          localStorage.setItem(
            "selectedLearningPathCards",
            JSON.stringify(updatedCards)
          );
        }
        return updatedCards;
      });
    }
  };

  const handleItemClick = (item: KnowledgeCard) => {
    // Always set the active item for display
    setActiveItem(item);

    // If in multi-select mode (selectForLearningPath=true)
    if (card === "true") {
      toggleCardSelection(item);

      // Store in localStorage for learning path
      // localStorage.setItem(
      //   "selectedLearningPathCard",
      //   JSON.stringify({
      //     card: item,
      //   }),
      // )
    }
    //  else {
    //   // Regular single-select mode
    //   if (card) {
    //     localStorage.setItem(
    //       "selectedLearningPathCard",
    //       JSON.stringify({
    //         card: item,
    //       }),
    //     )
    //   }
    // }
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.some((card) => card.id === cardId);
  };

  const clearSelectedCards = () => {
    setSelectedCards([]);
    // Clear localStorage when cards are cleared
    if (card === "true") {
      localStorage.setItem("selectedLearningPathCards", JSON.stringify([]));
    }
  };

  if (!isUserLoaded || isLoading) {
    return (
      <div className="text-white flex flex-col">
        {/* Header Skeleton */}
        <div className="py-4 lg:py-6">
          <Skeleton className="h-[36px] w-[250px] rounded-lg" />
        </div>

        <div className="h-full flex flex-1 gap-[32px]">
          {/* Left Sidebar Skeleton */}
          <div className="w-auto h-[633px] flex flex-col">
            {/* Top Button Skeleton */}
            <div className="py-2">
              <Skeleton className="w-full h-[46px] rounded-full" />
            </div>

            {/* Nav Items Skeleton */}
            <div className="w-full min-h-0 overflow-y-auto scrollbar-hide space-y-4 py-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-[100px] h-[60px] rounded-lg" />
              ))}
            </div>

            {/* Bottom Button Skeleton */}
            <div className="py-2">
              <Skeleton className="w-full h-[46px] rounded-full" />
            </div>
          </div>

          {/* Middle Sidebar Skeleton */}
          <div className="w-full max-w-sm h-[625px] rounded-[20px] bg-[#191919] p-6">
            <div className="pt-[20px] space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  {i === 0 && (
                    <div className="mx-5 mt-5 space-y-5">
                      {[...Array(2)].map((_, j) => (
                        <Skeleton key={j} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="w-full max-h-[80vh] rounded-[20px] bg-[#191919] p-6">
            <div className="space-y-6">
              {/* Header with title and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[40px] w-[200px] rounded-lg" />
                  <div className="flex gap-4">
                    <Skeleton className="h-[28px] w-[28px] rounded-md" />
                    <Skeleton className="h-[28px] w-[28px] rounded-md" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="bg-[#FFFFFF14] rounded-full p-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex flex-col">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-3 w-16 rounded-md mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategory name */}
              <Skeleton className="h-[28px] w-[150px] rounded-lg" />

              {/* Content */}
              <Skeleton className="h-[200px] w-full rounded-lg" />

              {/* Footer with file and tags */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-[40px] w-[40px] rounded-md" />
                  <Skeleton className="h-5 w-[150px] rounded-md ml-2" />
                </div>
                <Skeleton className="h-8 w-[200px] rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col">
      {/* Header */}

      <div className="py-4 lg:py-6 justify-between flex items-center">
        <div>
          <h1 className="text-white text-[36px] font-semibold">
            Knowledge Base
          </h1>
        </div>

        {/* Selection controls - only show when in selection mode */}
        {card === "true" && (
          <div className="flex items-center gap-4">
            <div className="bg-[#2C2D2E] px-4 py-2 rounded-lg flex items-center cursor-pointer">
              <span className="text-[#F9DB6F] font-medium">
                {selectedCards.length} card
                {selectedCards.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            {selectedCards.length > 0 && (
              <Button
                onClick={clearSelectedCards}
                className="bg-[#2C2D2E] hover:bg-[#3A3B3C] text-white border-none flex items-center gap-2 cursor-pointer"
              >
                <X size={16} />
                Clear selection
              </Button>
            )}

            {selectedCards.length > 0 && (
              <Button
                onClick={() => {
                  // Save selected cards to localStorage or process them
                  localStorage.setItem(
                    "selectedLearningPathCards",
                    JSON.stringify(selectedCards)
                  );
                  if (pathId) {
                    // ShowToast(`${selectedCards.length} cards saved to learning path`, "success")
                    router.push(`/tutor/creating-learning-path?id=${pathId}`);
                  } else {
                    router.push(`/tutor/creating-learning-path`);
                  }
                }}
                className="bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black cursor-pointer"
              >
                Confirm Selection
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="h-full flex flex-col lg:flex-row flex-1 gap-[32px]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-auto h-auto lg:h-[633px] flex flex-col">
          {/* Top Button */}
          <div className="py-2">
            <button
              onClick={() => handleScroll("up")}
              disabled={atTop}
              className={`w-full h-[46px] p-[12px] rounded-full border border-[#F9DB6F] flex items-center justify-center gap-[10px] cursor-pointer
                ${atTop ? "cursor-not-allowed" : ""}`}
              style={{borderRadius: "12px"}}
            >
              <ChevronUp
                className={`h-5 w-5  ${
                  atTop ? "text-[#F9DB6F]" : "text-[white]"
                }`}
              />
            </button>
          </div>

          {/* Scrollable Nav Items */}
          <div
            ref={scrollRef}
            style={{
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="w-full min-h-0 overflow-y-auto scrollbar-hide"
          >
            {teams.map((team) => (
              <div key={team.id} className="min-w-50">
                <NavItem
                  icon={renderIcon(
                    team.icon || "",
                    activeTeam?.id === team.id
                      ? "text-[black] h-5 w-5"
                      : "invert-0 h-5 w-5"
                  )}
                  label={team.name}
                  active={activeTeam?.id === team.id}
                  highlight={activeTeam?.id === team.id}
                  onClick={() => handleTeamClick(team)}
                />
              </div>
            ))}
          </div>

          {/* Bottom Button */}
          <div className="py-2">
            <button
              onClick={() => handleScroll("down")}
              disabled={atBottom}
              className={`w-full h-[46px] p-[12px] rounded-full border border-[#F9DB6F] flex items-center justify-center gap-[10px] cursor-pointer ${
                atBottom ? "cursor-not-allowed" : ""
              }`}
              style={{borderRadius: "12px"}}
            >
              <ChevronDown
                className={`h-5 w-5  ${
                  atBottom ? "text-[#F9DB6F]" : "text-[white]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Middle Sidebar */}
        {activeTeam ? (
          <div className="w-full lg:max-w-xs rounded-[20px] gap-[24px] pt-[30px] pb-[54px] px-[24px] bg-[#191919] justify-center items-center max-h-[80vh] overflow-auto">
            {activeTeam.subcategories && activeTeam.subcategories.length > 0 ? (
              activeTeam.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex flex-col gap-1">
                  <CategoryItem
                    label={subcategory.name}
                    expanded={expandedSubcategories[subcategory.id]}
                    active={activeSubcategory?.id === subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  />

                  {expandedSubcategories[subcategory.id] &&
                    subcategory.knowledge_card &&
                    subcategory.knowledge_card.length > 0 && (
                      <div className="mx-5 mt-2 space-y-3 max-h-[450px] overflow-auto flex flex-col items-center">
                        {" "}
                        {subcategory.knowledge_card.map((item) => (
                          <div
                            key={item.id}
                            className="w-full max-w-[250px] flex items-center justify-center gap-2"
                          >
                            <div className="flex-1">
                              <SubcategoryItem
                                label={item.title}
                                active={activeItem?.id === item.id}
                                highlight={
                                  card === "true"
                                    ? isCardSelected(item.id)
                                    : activeItem?.id === item.id
                                }
                                onClick={() => handleItemClick(item)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center h-full !pt-[-30px]">
                <h1 className="text-[20px] font-weight-[500] text-center">
                  No subcategories available
                </h1>
                <p className="text-[20px] font-weight-[500]">
                  Select a different category
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-lg max-h-[80vh] rounded-[20px] gap-[10px] p-5 bg-[#191919] flex flex-col items-center pt-10 ">
            <h1 className="text-[20px] font-weight-[500] text-center">
              To select the folder, please choose category first
            </h1>
          </div>
        )}

        {/* Main Content */}
        {activeTeam && activeItem ? (
          <div className="w-full max-h-[80vh] rounded-[20px] gap-[10px] pt-[24px] pr-[13px] pb-[24px] pl-[13px] bg-[#191919]">
            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="font-urbanist font-semibold text-[40px] leading-[20px] align-middle mr-3">
                    {activeItem.title}
                  </h2>
                  <div className="ml-2 flex items-center cursor-pointer gap-4">
                    {/* {card === "true" && (
                      <Button
                        onClick={() => toggleCardSelection(activeItem)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                          isCardSelected(activeItem.id)
                            ? "bg-[#F9DB6F] text-black hover:bg-[#F9DB6F]/90"
                            : "bg-[#2C2D2E] text-white hover:bg-[#3A3B3C]"
                        }`}
                      >
                        {isCardSelected(activeItem.id) ? (
                          <>
                            <CheckCircle size={16} />
                            Selected
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            Select
                          </>
                        )}
                      </Button>
                    )} */}
                    <div className="relative inline-block">
                      {!isCopied ? (
                        <Copy
                          onClick={() => copyToClipboard(activeItem.title)}
                          className="h-[28px] w-[28px] cursor-pointer text-white hover:text-white transition-colors"
                        />
                      ) : (
                        <CopyCheck className="h-[28px] w-[28px] text-white transition-colors" />
                      )}
                    </div>

                    <div className="relative inline-block">
                      <Button
                        ref={triggerRef}
                        className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-transparent"
                        onClick={() => setShowFloating((prev) => !prev)}
                      >
                        <Ellipsis className="h-5 w-5 text-white" />
                      </Button>

                      {showFloating && canEdit && (
                        <div
                          ref={floatingRef}
                          className="absolute right-0 top-10 w-[250px]  bg-[#2C2D2E] border border-[#3A3B3C] rounded-[10px] shadow-lg z-10 p-[14px] flex flex-col gap-[10px] text-left"
                        >
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => {
                              router.push(
                                `knowledge-base/create-knowledge-base?cardId=${activeItem.id}`
                              );
                              setShowFloating(false);
                            }}
                          >
                            <Pencil className="h-4 w-4 hover:text-[#F9DB6F]" />
                            <span>Edit</span>
                          </div>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => {
                              // handleDeleteCard(activeItem.id);
                              setShowFloating(false);
                              setIsOpen(true);
                              setSelectedCardId(activeItem.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 hover:text-[#F9DB6F]" />
                            <span className="font-urbanist font-medium text-sm leading-6 tracking-normal text-white rounded">
                              Delete
                            </span>
                          </div>
                          {activeItem.card_status !== CardStatus.SAVED && (
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                              onClick={() => {
                                handleSaveCard(activeItem.id);
                              }}
                            >
                              <Import className="h-4 w-4 hover:text-[#F9DB6F]" />
                              <span>Save Card</span>
                            </div>
                          )}
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                            onClick={() => {
                              // handleSaveCard(activeItem.id);
                              setSelectedCard(activeItem);
                              setOpenModal(true);
                            }}
                          >
                            <Icon
                              icon="mingcute:announcement-line"
                              width="24"
                              height="24"
                            />
                            <span>Create Announcment</span>
                          </div>

                          {!activeItem.is_verified && (
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] rounded-[4px] cursor-pointer"
                              onClick={() => {
                                handleSaveCard(
                                  activeItem.id,
                                  true,
                                  activeItem?.verificationperiod
                                );
                              }}
                            >
                              <Check />
                              <span>Verify Card</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center">
                    {activeItem.is_verified ? (
                      <Image
                        src="/CheckMark.png"
                        width={47.67}
                        height={47.67}
                        alt="checkmark"
                      />
                    ) : (
                      <Image
                        src="/unverified.png"
                        width={47.67}
                        height={47.67}
                        alt="checkmark"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-center w-full">
                    <div className="flex items-center justify-center bg-[#FFFFFF14] rounded-full px-4 py-2 gap-3">
                      <Image
                        src={
                          activeItem?.card_owner_id?.profile_picture ||
                          "/pic1.png" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt="User"
                        className="rounded-full w-[60px] h-[60px]"
                        width={60}
                        height={60}
                      />
                      <div className="flex flex-col text-[20px]">
                        <span className="font-urbanist font-medium leading-[100%]">
                          {`${activeItem?.card_owner_id?.first_name} ${activeItem.card_owner_id?.last_name}`}
                        </span>
                        {canEdit && (
                          <>
                            <span
                              className="text-xs text-[#F9DB6F] underline cursor-pointer"
                              onClick={() => setIsModalOpen(true)}
                            >
                              Reassign
                            </span>
                            <ReassignUserModal
                              isOpen={isModalOpen}
                              onClose={() => setIsModalOpen(false)}
                              orgId={userDetails?.user?.organizations?.id}
                              cardId={activeItem?.id}
                              currentAssigneeId={activeItem?.card_owner_id?.id}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-urbanist font-semibold text-[28px] leading-[20px] align-middle text-[#828282] mb-4 mt-3">
                {activeSubcategory?.name}
              </h3>

              <div className="font-urbanist font-medium text-[20px] leading-[40px] align-middle flex-grow overflow-auto h-[300px]">
                <p className="mb-4">{stripHtml(activeItem.content)}</p>
              </div>

              <div className="mt-auto pt-4 ">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {activeItem.attachments &&
                      activeItem.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeItem.attachments.map(
                            (file: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center p-2 rounded-md"
                              >
                                <FileText className="h-[32.5px] w-[27.5px] mr-2" />
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-white hover:text-[#F9DB6F] cursor-pointer truncate max-w-[200px]"
                                >
                                  <span className="text-[20px] font-urbanist font-medium">
                                    {file.name}
                                  </span>
                                </a>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                  {activeItem && activeItem?.tags &&activeItem?.tags?.length>0 &&
                  <div className="p-2 flex-shrink-0">
                    <div
                      className={`w-full max-w-xl relative h-[24px] cursor-pointer p-2`}
                    >
                      <div className="flex flex-wrap items-start rounded-[6px] px-3 py-2 bg-[#FFFFFF0F] gap-2 overflow-auto h-[50px] !max-w-xl">
                        {activeItem?.tags?.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-[#F9DB6F] w-[114px] h-[24px] text-black px-2 sm:px-3 rounded-sm flex items-center text-xs sm:text-sm max-w-full justify-between"
                          >
                            <span className="truncate max-w-[120px] sm:max-w-[160px]">
                              {tag}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="w-4 h-4 ml-1 p-0 text-black text-right hover:bg-black/10 hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                              disabled
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
}
                </div>
              </div>
            </div>
          </div>
        ) : activeTeam ? (
          <div className="w-full h-[625px] rounded-[20px] gap-[10px]  bg-[#191919] flex  p-10">
            <div className="text-center">
              <p className="text-[20px] font-weight-[500]">
                Select an item to view details
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-[625px] rounded-[20px] gap-[10px]  bg-[#191919] flex p-10">
            <div className="text-center">
              <h1 className="text-[20px] font-weight-[500]">
                To select the folder, please choose category first
              </h1>
            </div>
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        onConfirm={() => handleDeleteCard(selectedCardId)}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Knowledge Card"
        isLoading={isCardDeleteLoading}
      />
      <CreateAnnouncement
        open={openModal}
        onClose={setOpenModal}
        selectedCard={selectedCard}
      />
    </div>
  );
}
