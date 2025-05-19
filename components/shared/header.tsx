"use client";

import {
  Bell,
  Plus,
  Menu,
  X,
  ChevronDown,
  FileText,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";
import NavList from "./nav-list";
import SearchInput from "./search-input";
import {TopBarIcons} from "./settings-dropdown";
import {usePathname} from "next/navigation";
import {Button} from "../ui/button";
import Link from "next/link";
import {useState, useEffect, useRef} from "react";
import CreateCardDropdown from "./dropdown-button";

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
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setOpen(false); // optional: close dropdown on selection
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    // Set initial value
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);

    // Handle clicks outside notification dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      message: "Courtey M. has been added to your Team",
      time: "5 min ago",
    },
    {
      id: 2,
      message: "A new card has been addded to CX",
      time: "2 hours ago",
    },
    {
      id: 3,
      message: "Reminder: You're overdue for your Tutor session.",
      subtext: "Visit the Tutor section to get started.",
      time: "8 hours ago",
    },
    {
      id: 4,
      message:
        "One of your cards has expired. Re-verify it as soon as possible.",
      subtext: "Warranty Policy",
      time: "2 days ago",
    },
    {
      id: 5,
      message: "A new learning path from Marketing has been assigned to you.",
      subtext: "Holiday Sale",
      time: "4 days ago",
    },
  ];

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
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-900" />
              </div>
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[700px] bg-[#1a1a1a] rounded-lg shadow-lg border border-zinc-800 overflow-hidden z-50">
                <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <span className="bg-[#F9DB6F] text-black text-xs px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-[#F9DB6F]">
                    <Button
                      className="hover:underline bg-transparent text-[#F9DB6F] hover:bg-transparent"
                      onClick={() => {
                        setShowAllNotifications(false);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      Show All
                    </Button>
                    <Button className="hover:underline bg-transparent text-[#F9DB6F] hover:bg-transparent">
                      Mark all as read
                    </Button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-4 border-b border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-[#F9DB6F] rounded-full flex items-center justify-center text-black">
                          <Image
                            alt="notification"
                            src="/logo/pohloh.svg"
                            height={16}
                            width={16}
                          />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="text-white text-sm">
                          {notification.message}
                        </p>
                        {notification.subtext && (
                          <p className="text-[#F9DB6F] text-xs mt-1">
                            {notification.subtext}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-400">
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            {/* Mobile Notifications Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Notifications</h3>
                <span className="bg-[#F9DB6F] text-black text-xs px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-3 border-b border-zinc-800"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 bg-[#F9DB6F] rounded-full flex items-center justify-center text-black">
                        <Image
                          alt="notification"
                          src="/logo/pohloh.svg"
                          height={12}
                          width={12}
                        />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-white text-sm">
                        {notification.message}
                      </p>
                      {notification.subtext && (
                        <p className="text-[#F9DB6F] text-xs mt-1">
                          {notification.subtext}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {notification.time}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full text-[#F9DB6F] text-sm text-center mt-2 bg-transparent"
                onClick={() => {
                  setShowAllNotifications(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                View all notifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
