"use client";
import {useClerk} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useState, useRef, useEffect} from "react";
import Image from "next/image"; // Added Next.js Image component
import LogoutPopup from "./logout-popup";

type TopBarProps = {
  userData: any;
};

export function TopBarIcons({userData}: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {signOut} = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  const handleMenuItemClick = (action: () => void) => {
    setDropdownOpen(false);
    action();
  };

  return (
    <div className="flex items-center gap-4 relative">
      <div className="relative cursor-pointer" ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="rounded-full w-14 h-14 overflow-hidden border-1 border-zinc-700 relative"
        >
          <Image
            src={userData?.profile_picture || "/placeholder-profile.svg"}
            alt="Avatar"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 mb-10 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg text-white z-50">
            <ul className="py-2 text-sm">
              <li
                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer flex flex-row gap-3 items-center"
                onClick={() =>
                  handleMenuItemClick(() => {
                    router.replace("/settings");
                    console.log("View Profile clicked");
                  })
                }
              >
                <Image
                  src="/eye.png"
                  alt="Edit"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                View Profile
              </li>
              <li
                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer flex flex-row gap-3 items-center"
                onClick={() =>
                  handleMenuItemClick(() => {
                    router.replace("/settings");
                    console.log("Feedback clicked");
                  })
                }
              >
                <Image
                  src="/edit-icon.svg"
                  alt="Eye"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Feedback
              </li>
              <li
                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer flex flex-row gap-3 items-center bg-[#F9DB6F33] text-[#F9DB6F]"
                onClick={() => {
                  setDropdownOpen(false);
                  setLogoutModalOpen(true);
                }}
              >
                <Image
                  src="/logout.svg"
                  alt="Logout"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
      <LogoutPopup
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Logout"
        isLoading={isLogoutLoading}
      />
    </div>
  );
}
