"use client";

import {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import ViewAnnouncmentModal from "./modals/view-announcement";
import Image from "next/image";
import {apiUrl, CardType} from "@/utils/constant";
import {stripHtml} from "@/lib/stripeHtml";

type Announcement = {
  id: string;
  title: string;
  description: string;
  org_id: any;
  user_id: any;
  card_id: any;
  created_at: string;
  expiry_date: string;
};

type TeamAnnouncement = {
  announcement: Announcement;
  team?: {
    id: string;
    icon: string;
    name: string;
    org_id: string;
    lead_id: string;
    user_id: string;

    created_at: string;
  };
};

interface AnnouncementCardProps {
  userData: any;
}

export function AnnouncementCard({userData}: AnnouncementCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedAnnouncement, setDisplayedAnnouncement] =
    useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        let url = "";
        if (userData.role === "owner") {
          url = `${apiUrl}/announcements/organizations/${userData.org_id}`;
        } else {
          url = `${apiUrl}/announcements/teams/${userData.team_id}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch announcements");

        const data = await response.json();

        // Handle different response formats
        let announcementsData: Announcement[] = [];
        if (userData.role === "owner") {
          announcementsData = data.announcement || [];
        } else {
          announcementsData =
            data.announcement?.map(
              (item: TeamAnnouncement) => item.announcement
            ) || [];
        }

        setAnnouncements(announcementsData);
        if (announcementsData.length > 0) {
          setDisplayedAnnouncement(announcementsData[0]);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchAnnouncements();
    }
  }, [userData]);
  console.log(announcements, "alsklskdk");
  const isFirstAnnouncement = currentIndex === 0;
  const isLastAnnouncement = currentIndex === announcements.length - 1;

  const goToPrevious = () => {
    if (isTransitioning || isFirstAnnouncement || announcements.length === 0)
      return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (isTransitioning || isLastAnnouncement || announcements.length === 0)
      return;
    setIsTransitioning(true);
    setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (isTransitioning && announcements.length > 0) {
      const timer = setTimeout(() => {
        setDisplayedAnnouncement(announcements[currentIndex]);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isTransitioning, announcements]);

  if (loading) {
    return (
      <div className="max-w-auto h-full px-6 py-6 bg-[#1e1e1e] flex flex-col gap-5 rounded-[30px]">
        <h2 className="text-white text-[24px] font-normal text-left">
          Announcements
        </h2>
        <div className="flex items-center justify-center h-full">
          <p className="text-[#6F767E]">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (announcements.length === 0 || !displayedAnnouncement) {
    return (
      <div className="max-w-auto h-full px-6 py-6 bg-[#1e1e1e] flex flex-col gap-5 rounded-[30px]">
        <h2 className="text-white text-[24px] font-normal text-left">
          Announcements
        </h2>
        <div className="flex items-center justify-center h-full">
          <p className="text-[#6F767E]">No announcements available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ViewAnnouncmentModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        announcement={displayedAnnouncement}
      />

      <div className="max-w-auto h-full px-6 py-6 bg-[#1e1e1e] flex flex-col gap-5 rounded-[30px]">
        <div className="flex justify-between">
          <h2 className="text-white text-[24px] font-normal text-left">
            Announcements
          </h2>
          <div className="w-full flex justify-end">
            <div className="flex items-center space-x-2">
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isFirstAnnouncement
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToPrevious}
                aria-label="Previous announcement"
                disabled={isFirstAnnouncement}
              >
                <ChevronLeft size={16} className="ml-[1px]" />
              </button>
              <button
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full",
                  !isLastAnnouncement
                    ? "text-[#F9DB6F] border-2 border-[#F9DB6F] cursor-pointer"
                    : "bg-[#1e1e1e] text-gray-400 cursor-not-allowed"
                )}
                onClick={goToNext}
                aria-label="Next announcement"
                disabled={isLastAnnouncement}
              >
                <ChevronRight size={16} className="mr-[-1px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Image container - full width with reduced height */}
          <div className="w-full h-[180px]">
            <Image
              src="/announcement.svg" // Default image since the API doesn't provide one
              className="w-full h-[150px] object-cover rounded-xl"
              alt="Announcement"
              width={300}
              height={150}
            />
          </div>

          <h3 className="text-white font-normal text-[20px] mt-2">
            {displayedAnnouncement.title}
          </h3>
          <p className="text-[#6F767E] text-[12px] line-clamp-4 h-20">
            {stripHtml(displayedAnnouncement.description)}
          </p>

          <div className="h-[1px] bg-[#828282]" />
        </div>

        <div className="flex items-center gap-2 flex-row justify-between">
          <Button
            variant="outline"
            className="bg-[#333435] border-white text-[16px] text-white hover:bg-[#333435] hover:text-white cursor-pointer w-[175px] h-[42px] font-normal"
            onClick={() => setIsOpen(true)}
          >
            View Announcement
          </Button>
          <div className="inline-flex items-center gap-2 bg-[black] rounded-full py-2 px-4">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src="/placeholder-profile.svg" // Default profile picture
                alt="Announcement author"
                width={30}
                height={30}
                className="object-cover"
              />
            </div>
            <span className="font-urbanist font-normal text-xl leading-[100%] tracking-normal text-white">
              {/* Display user info if available, otherwise just "Admin" */}
              {displayedAnnouncement?.user_id.first_name
                ? `${displayedAnnouncement?.user_id.first_name} ${displayedAnnouncement?.user_id.last_name}`
                : "Admin"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
