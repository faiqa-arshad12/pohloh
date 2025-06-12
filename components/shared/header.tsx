"use client";

import {Bell, Menu, X} from "lucide-react";
import Image from "next/image";
import NavList from "./nav-list";
import SearchInput from "./search-input";
import {TopBarIcons} from "./settings-dropdown";
import {Button} from "../ui/button";
import {useState, useEffect, useRef} from "react";
import CreateCardDropdown from "./dropdown-button";
import {Notifications} from "./notifications";
import {supabase} from "@/supabase/client";
import {useUser} from "@clerk/nextjs";

type HeaderProps = {
  setShowAllNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  showAllNotifications: boolean;
  userData: any;
};

interface DropdownItemProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  onClick: () => void;
  isSelected?: boolean;
}

export function Header({
  setShowAllNotifications,
  showAllNotifications,
  userData,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const {user} = useUser();

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
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Subscribe to notifications changes
  useEffect(() => {
    if (!user) return;

    // Initial fetch of unread count
    fetchUnreadCount();

    // Subscribe to notifications changes
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          await fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const {count, error} = await supabase
        .from("notifications")
        .select("*", {count: "exact", head: true})
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error fetching unread count:", error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error in fetchUnreadCount:", error);
    }
  };

  return (
    <>
      <header className="fixed w-[100%] top-0 z-50 bg-transparent backdrop-blur-sm flex items-center justify-between h-16 md:h-30 md:px-6 !px-16">
        {/* Left side - Logo and Hamburger */}
        <div className="flex items-center gap-4 md:gap-6 bg-[transparent] backdrop-blur-sm">
          {/* Hamburger menu for mobile */}
          <Button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-yellow-400 text-2xl">
              <Image
                alt="pohloh"
                src="/logo/pohloh.svg"
                height={40}
                width={40}
                style={{cursor: "pointer"}}
              />
            </div>
            <span className="text-white font-bold text-xl md:text-[25.33px]">
              Pohloh
            </span>
          </div>

          {/* Desktop Navigation */}
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

          <div className="hidden md:block">
            <SearchInput onChange={(value) => setFilter(value)} />
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
                setIsNotificationsOpen={setShowAllNotifications}
                setShowAllNotifications={setIsNotificationsOpen}
              />
            )}
          </div>

          {/* Avatar with dropdown */}
          <TopBarIcons userData={userData} />
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isMobile && (
        <div className="fixed inset-0 pb-15 z-40 bg-[#1a1a1a] pt-16 px-4  overflow-y-scroll md:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Navigation */}
            <div className="mb-6">
              <NavList
                setShowAllNotifications={setShowAllNotifications}
                showAllNotifications={showAllNotifications}
              />
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <SearchInput onChange={(value) => setFilter(value)} />
            </div>

            {/* Mobile Create Button */}
            <CreateCardDropdown />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
