"use client";
import {ChevronRight} from "lucide-react";

// Icons
export function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 20V10M12 20V4M6 20V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ... (Repeat for all other icon components exactly as above)

// NavItem Component
export function NavItem({
  icon,
  label,
  active = false,
  highlight = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-[70px] rounded-[12px] border my-2 cursor-pointer transition-opacity duration-200
      ${active ? "border-[#F9DB6F]" : "border-[#828282]"}
      ${!active ? "opacity-80 hover:opacity-100" : ""}
    `}
      title={label}
    >
      <div
        className={`flex items-center justify-center gap-[10px] h-full rounded-[12px]
        ${highlight ? "bg-[#F9DB6F] text-black" : active ? "bg-[#2C2D2E]" : ""}
      `}
      >
        <div>{icon}</div>
        <span className="text-xs text-center">{label}</span>
      </div>
    </button>
  );
}

// CategoryItem Component
export function CategoryItem({
  label,
  expanded = false,
  active = false,
  onClick,
}: {
  label: string;
  expanded?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`w-[auto] h-[58px] rounded-[6px] border px-[16px] py-[12px] flex items-center justify-between mt-3 mb-3 cursor-pointer bg-[#FFFFFF14] hover:bg-[#2C2D2E] ${
        active ? "border-[#F9DB6F]  " : " border-none"
      }
            ${!active ? "opacity-80 hover:opacity-100" : ""}
`}
    >
      <span className="font-urbanist font-normal text-[18px] leading-[20px] align-middle">
        {label}
      </span>
      <ChevronRight
        className={`h-4 w-4 transition-transform ${
          expanded ? "rotate-90" : ""
        }`}
      />
    </div>
  );
}

// SubcategoryItem Component
export function SubcategoryItem({
  label,
  active = false,
  highlight = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        h-[58px]
        min-w-[100px]  // Add minimum width
        max-w-[250px]  // Add maximum width
        px-3           // Add horizontal padding
        rounded-[6px]
        text-center
        border
        flex
        items-center
        justify-center
        cursor-pointer
        transition-colors
        ${
          highlight
            ? "bg-[#F9DB6F] text-black border-[#F9DB6F]"
            : active
            ? "bg-[#2C2D2E] border-[#3A3B3C]"
            : "bg-[#FFFFFF14] border-[#3A3B3C]"
        }
        ${!active ? "opacity-80 hover:opacity-100" : ""}
      `}
    >
      <span
        className="
          font-urbanist
          font-medium
          text-[18px]
          leading-[20px]
          align-middle
          text-center
          truncate
          overflow-hidden
          whitespace-nowrap
          w-full         // Make span take full width
        "
      >
        {label}
      </span>
    </div>
  );
}
