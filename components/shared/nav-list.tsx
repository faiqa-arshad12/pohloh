import React from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import Image from "next/image";
import { navItems } from "@/utils/constant";
type HeaderProps = {
  setShowAllNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  showAllNotifications: boolean;
};


const NavList = ({setShowAllNotifications}: HeaderProps) => {
  const pathname = usePathname();

  return (
    <div>
      <nav className="rounded-3xl p-2 md:p-0 md:rounded-full flex flex-col md:flex-row border-2 border-[#A2A2A2]" style={{padding:'5px'}}>
        {navItems.map((item) => {
          const isActive = pathname?.includes(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 md:py-5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#F9DB6F] text-black"
                  : "text-[#A2A2A2] hover:text-white"
              )}
              onClick={() => setShowAllNotifications(true)}
            >
              {isActive && (
                <Image
                  src={item.icon}
                  width={16}
                  height={16}
                  alt={`${item.name} icon`}
                />
              )}
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default NavList;
