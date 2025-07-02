"use client";

import type React from "react";
import {Bell, Menu, X} from "lucide-react";
import Image from "next/image";
import NavList from "./nav-list";
import SearchInput from "./search-input";
import {TopBarIcons} from "./settings-dropdown";
import {Button} from "../ui/button";
import {useState, useEffect, useRef} from "react";
import CreateCardDropdown from "./dropdown-button";
import {useRouter} from "next/navigation";
import Loader from "./loader";
import {apiUrl_AI, apiUrl} from "@/utils/constant";
import {Notifications} from "./notifications";
import {getUnreadCount} from "@/services/notification.service";
import {supabase} from "@/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  relevance_score: number;
  matched_fields: string[];
}

function useSearch(
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  userData: any
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const saveSearchQuery = async (query: string) => {
    try {
      if (!userData?.id || !userData?.org_id) {
        console.error("Missing user data for saving search query");
        return;
      }

      const response = await fetch(`${apiUrl}/searches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item: query,
          org_id: userData.org_id,
          user_id: userData.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save search query:", errorData);
      }
    } catch (error) {
      console.error("Error saving search query:", error);
    }
  };

  const handleSearch = async (input: string) => {
    setSearchQuery(input);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!input.trim()) {
        setSearchResults([]);
        setIsSearchResultsOpen(false);
        return;
      }

      setIsSearching(true);
      setIsSearchResultsOpen(true);

      try {
        const response = await fetch(`${apiUrl_AI}/search/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: input,
            user_id: userData?.id,
            limit: 20,
            organization_id:userData.org_id,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSearchResults(data.cards);
          if (data.cards.length === 0) {
            await saveSearchQuery(input);
          }
        } else {
          await saveSearchQuery(input);
        }
      } catch (error) {
        console.error("Search error:", error);
        await saveSearchQuery(input);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleResultClick = (resultId: string) => {
    router.push(`/knowledge-base?cardId=${resultId}`);
    setIsSearchResultsOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setIsSearchResultsOpen(true);
    }
  };

  const handleSearchClose = () => {
    setIsSearchResultsOpen(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const closeSearchResults = () => {
    setIsSearchResultsOpen(false);
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    isSearchResultsOpen,
    handleSearch,
    handleResultClick,
    handleSearchFocus,
    handleSearchClose,
    closeSearchResults,
    setIsSearchResultsOpen,
  };
}

function SearchResultItem({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  return (
    <div
      className="p-3 border-b border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-white text-sm font-medium">{result.title}</h4>
        <span className="text-xs text-gray-400">
          {Math.round(result.relevance_score * 100)}%
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {result.matched_fields.map((field) => (
          <span
            key={field}
            className="text-xs px-2 py-0.5 bg-[#F9DB6F] text-black rounded-full uppercase font-semibold"
          >
            {field.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

type HeaderProps = {
  setShowAllNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  showAllNotifications: boolean;
  userData: any;
};

export function Header({
  setShowAllNotifications,
  showAllNotifications,
  userData,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    searchQuery,
    searchResults,
    isSearching,
    isSearchResultsOpen,
    handleSearch,
    handleResultClick,
    handleSearchFocus,
    handleSearchClose,
    closeSearchResults,
  } = useSearch(setIsMobileMenuOpen, setIsNotificationsOpen, userData);

  // Function to fetch unread count
  const fetchUnreadCount = async () => {
    if (!userData?.id) return;

    try {
      const count = await getUnreadCount(userData.id);
      setUnreadCount(count);
    } catch (error) {
      console.error(" Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  // Function to setup real-time subscription
  const setupRealtimeSubscription = () => {
    if (!userData?.id) {
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const channelName = `notifications_${userData.id}_${Date.now()}`;

    setConnectionStatus("connecting");

    channelRef.current = supabase
      .channel(channelName, {
        config: {
          broadcast: {self: true},
          presence: {key: userData.id},
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          fetchUnreadCount();
        }
      )
      .subscribe((status, err) => {
        setConnectionStatus(status);

        if (err) {
          console.error("Subscription error:", err);
        }

        switch (status) {
          case "SUBSCRIBED":
            break;
          case "CHANNEL_ERROR":
            setConnectionStatus("error");
            // Retry after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              setupRealtimeSubscription();
            }, 5000);
            break;
          case "TIMED_OUT":
            setConnectionStatus("timeout");
            // Retry after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              setupRealtimeSubscription();
            }, 3000);
            break;
          case "CLOSED":
            setConnectionStatus("closed");
            break;
        }
      });
  };
  useEffect(() => {
    if (!userData?.id || !userData?.org_id) {
      return;
    }
    fetchUnreadCount();
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [userData?.id, userData?.org_id]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        closeSearchResults();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSearchResults]);

  return (
    <>
      <header className="fixed w-[100%] top-0 z-50 bg-transparent backdrop-blur-sm flex items-center justify-between h-16 md:h-30 md:px-6 !px-16">
        {/* Left side - Logo and Hamburger */}
        <div className="flex items-center gap-4 md:gap-6 bg-[transparent] backdrop-blur-sm">
          <Button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-yellow-400 text-2xl">
              <Image
                alt="pohloh"
                src="/logo/pohloh.svg"
                height={50}
                width={50}
                style={{cursor: "pointer"}}
              />
            </div>
            <span className="text-white font-bold text-xl md:text-[25.33px]">
              Pohloh
            </span>
          </div>
          <div className="hidden md:block bg-[transparent] backdrop-blur-xl">
            <NavList
              setShowAllNotifications={setShowAllNotifications}
              showAllNotifications={showAllNotifications}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          <CreateCardDropdown />

          <div className="hidden md:block relative" ref={searchContainerRef}>
            <SearchInput
              onChange={handleSearch}
              onFocus={handleSearchFocus}
              onClose={handleSearchClose}
              value={searchQuery}
            />

            {/* Search Results Dropdown */}
            {isSearchResultsOpen && (
              <div className="absolute top-full left-0 mt-2 w-[350px] bg-[#1a1a1a] rounded-lg shadow-lg border border-zinc-800 overflow-hidden z-50">
                <div className="p-2 border-b border-zinc-800">
                  <h3 className="text-white text-sm font-medium">
                    Search Results
                  </h3>
                </div>
                {isSearching ? (
                  <div className="p-3 text-center text-gray-400 flex justify-center items-center">
                    <Loader />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onClick={() => handleResultClick(result.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-gray-400">
                    No results found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Bell with dropdown */}
          <div className="hidden md:block relative" ref={notificationRef}>
            <button
              className="flex text-gray-300 hover:text-white rounded-full p-2 md:p-4 border border-gray-600 cursor-pointer hover:bg-zinc-800"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <div className="relative w-5 h-5">
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-900" />
                )}
              </div>
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <Notifications
                setIsNotificationsOpen={setIsNotificationsOpen}
                setShowAllNotifications={setShowAllNotifications}
                onUnreadCountChange={setUnreadCount}
                unreadCount={unreadCount}
              />
            )}
          </div>

          <TopBarIcons userData={userData} />
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isMobile && (
        <div className="fixed inset-0 pb-15 z-40 bg-[#1a1a1a] pt-16 px-4 overflow-y-scroll md:hidden">
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <NavList
                setShowAllNotifications={setShowAllNotifications}
                showAllNotifications={showAllNotifications}
              />
            </div>

            <div className="mb-6 relative" ref={searchContainerRef}>
              <SearchInput
                onChange={handleSearch}
                onFocus={handleSearchFocus}
                onClose={handleSearchClose}
                value={searchQuery}
              />

              {isSearchResultsOpen && (
                <div className="mt-2 bg-[#1a1a1a] rounded-lg border border-zinc-800 overflow-hidden ">
                  <div className="p-2 border-b border-zinc-800">
                    <h3 className="text-white text-sm font-medium">
                      Search Results
                    </h3>
                  </div>
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-400 flex justify-center items-center">
                      <Loader />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onClick={() => handleResultClick(result.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-gray-400">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <CreateCardDropdown />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#F9DB6F] text-black text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <Notifications
                  setShowAllNotifications={setShowAllNotifications}
                  setIsNotificationsOpen={setIsMobileMenuOpen}
                  isMobile={true}
                  onUnreadCountChange={setUnreadCount}
                  unreadCount={unreadCount}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
