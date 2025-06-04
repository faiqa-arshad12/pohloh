import React, {useEffect, useRef, useState} from "react";
import {Button} from "../ui/button";
import {useRouter} from "next/navigation";
import CreateAnnouncement from "../dashboard/modals/create-announcemnet";
import {cn} from "@/lib/utils";
import Image from "next/image";

interface DropdownItemProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  onClick: () => void;
  isSelected?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  text,
  className = "",
  onClick,
  isSelected = false,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer  rounded-[4px]",
      "hover:bg-[#F9DB6F33] hover:text-[#F9DB6F]",
      isSelected && "bg-[#F9DB6F33] text-[#F9DB6F] font-semibold",
      className
    )}
  >
    {icon}
    {text}
  </button>
);

const CreateCardDropdown: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [Openmodal, setOpenModal] = useState(false);
  const toggleDropdown = () => setOpen((prev) => !prev);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleItemClick = (pathname: string, item: string) => {
    if (item === "Create Announcement") {
      setOpenModal(true); // Open the modal
    } else {
      router.push(pathname);
    }
    setSelectedItem(item);
    setOpen(false); // Close dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left ">
      <Button
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 px-3 h-10 md:h-[60px] w-auto md:w-[203px] rounded-full bg-[#F9DB6F] text-black hover:bg-[#F9DB6F] font-urbanist font-bold text-sm leading-none cursor-pointer"
      >
        <Image
          alt="Chevron Down"
          src="/icons/Chevron-Down.png"
          height={10}
          width={10}
          className={cn(
            "ml-1 transition-transform duration-200",
            !open && "rotate-[-90deg]"
          )}
        />
        Create
      </Button>

      {open && (
        <div className="absolute z-10 mt-2 w-64 rounded-lg shadow-lg bg-[#222222] text-white cursor-pointer">
          <div className="py-1  mx-[10px]">
            <DropdownItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/card-plus.svg"
                  height={16}
                  width={16}
                  className={cn("ml-1 transition-transform duration-200")}
                />
              }
              text="Create Knowledge Card"
              onClick={() =>
                handleItemClick(
                  "/knowledge-base/create-knowledge-base",
                  "Create Knowledge Card"
                )
              }
              isSelected={selectedItem === "Create Knowledge Card"}
            />
            <DropdownItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/card-plus.svg"
                  height={16}
                  width={16}
                  className={cn("ml-1 transition-transform duration-200")}
                />
              }
              text="Create Learning Path"
              onClick={() =>
                handleItemClick(
                  "/tutor/creating-learning-path",
                  "Create Learning Path"
                )
              }
              isSelected={selectedItem === "Create Learning Path"}
            />

            {/* <DropdownItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/announcement-line.svg"
                  height={16}
                  width={16}
                  className={cn("ml-1 transition-transform duration-200")}
                />
              }
              text="Create Announcement"
              onClick={() =>
                handleItemClick(
                  "/tutor/creating-learning-path",
                  "Create Announcement"
                )
              }
              isSelected={selectedItem === "Create Announcement"}
            /> */}
          </div>
          <div className="py-2 mx-[10px]">
                <DropdownItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/bi_card-text.svg"
                  height={16}
                  width={16}
                  className={cn("ml-1 transition-transform duration-200")}
                />
              }
              text="View Card Drafts"
              onClick={() =>
                handleItemClick(
                  "/knowledge-base/cards?status=draft",
                  "View Card Drafts"
                )
              }
              isSelected={selectedItem === "View Card Drafts"}
            />
            <DropdownItem
              icon={
                <Image
                  alt="Chevron Down"
                  src="/icons/bi_card-text.svg"
                  height={16}
                  width={16}
                  className={cn("ml-1 transition-transform duration-200")}
                />
              }
              text="View Learning Path Drafts"
              onClick={() =>
                handleItemClick("/tutor/drafts", "View Learning Path Drafts")
              }
              isSelected={selectedItem === "View Learning Path Drafts"}
            />

          </div>
        </div>
      )}

      {/* <CreateAnnouncement open={Openmodal} onClose={setOpenModal} /> */}
    </div>
  );
};

export default CreateCardDropdown;
