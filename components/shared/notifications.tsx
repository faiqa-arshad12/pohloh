import React from "react";
import { Button } from "../ui/button";
type NotificationsProps = {
  setShowAllNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?:boolean

};

 const notifications = [
    {
      id: 1,
      message: "Courtey M. has been added to your Team",
      time: "3 min ago",
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

export const Notifications = ({setShowAllNotifications,setIsNotificationsOpen, isMobile}: NotificationsProps) => {
  return (
    <>

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
                <img alt="notification" src="/logo/pohloh.svg" height={16} />
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-white text-sm">{notification.message}</p>
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
    </>
  );
};

export default notifications;
