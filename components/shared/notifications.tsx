import Image from "next/image";
import React from "react";

interface Notification {
  id: number;
  message: string;
  subtext?: string;
  time: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    message: "Courtney M. has been added to your Team",
    time: "5 min ago",
  },
  {
    id: 2,
    message: "A new card has been added to CX.",
    time: "5 min ago",
  },
  {
    id: 3,
    message: "Reminder: You're overdue for your Tutor session",
    subtext: "Visit the Tutor section to get started.",
    time: "5 min ago",
  },
  {
    id: 4,
    message: "One of your cards has expired. Re-verify it as soon as possible.",
    subtext: "Warranty Policy",
    time: "5 min ago",
  },
  {
    id: 5,
    message: "One of your cards has expired. Re-verify it as soon as possible.",
    subtext: "Warranty Policy",
    time: "5 min ago",
  },
  {
    id: 6,
    message: "One of your cards has expired. Re-verify it as soon as possible.",
    subtext: "Warranty Policy",
    time: "5 min ago",
  },
  {
    id: 7,
    message: "A new learning path from Marketing has been assigned to you.",
    subtext: "Holiday Sale",
    time: "5 min ago",
  },
];

const NotificationsPanel: React.FC = () => {
  return (
    <div className="text-white p-4">
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Notifications
            <span className="bg-[#F9DB6F] text-black rounded-full px-2">
              {mockNotifications.length}
            </span>
          </h1>

          <div className="flex items-center flex-wrap gap-2 md:gap-4">
            <a
              href="#"
              className="text-[#FFFFFF99] text-sm whitespace-nowrap underline"
            >
              View history
            </a>
            <a
              href="#"
              className="text-[#F9DB6F] text-sm whitespace-nowrap"
            >
              Mark all as read
            </a>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-[#191919] rounded-lg p-4 space-y-4">
          {mockNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </div>
  );
};

// interface BadgeProps {
//   letter: string;
//   color: string;
// }

//

//   <div
//     className={`text-white rounded-full w-8 h-8 flex items-center justify-center text-sm ${color}`}
//   >
//     {letter}
//   </div>
// );

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { message, subtext, time } = notification;

  return (
    <div>


    <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 h-[88px] ">
      <div className="flex items-start gap-4">
        <Image
          src="/file.png"
          alt="Notification icon"
          className="w-10 h-10 rounded-full shrink-0"
          width={40}
          height={40}
        />
        <div className="text-sm sm:text-base">
          <p>{message}</p>
          {subtext && (
            <p className="text-[#F9DB6F] text-sm mt-0.5">{subtext}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-right sm:text-left">
        <span className="text-gray-500 text-xs">{time}</span>
      </div>
    </div>
      <div className="border-b"></div>
    </div>
  );
};

export default NotificationsPanel;
