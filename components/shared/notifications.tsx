import React, {useEffect, useState} from "react";
import {Button} from "../ui/button";
import {
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/services/notification.service";
import {formatDistanceToNow} from "date-fns";
import {useUserHook} from "@/hooks/useUser";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Notification} from "@/types/types";
import Loader from "./loader";

type NotificationsProps = {
  setShowAllNotifications?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNotificationsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  onUnreadCountChange?: (count: number) => void;
  unreadCount?: number;
};

export const Notifications = ({
  setShowAllNotifications,
  setIsNotificationsOpen,
  onUnreadCountChange,
  isMobile,
  unreadCount = 0,
}: NotificationsProps) => {
  const {userData} = useUserHook();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userData) {
      console.log("No user found");
      return;
    }
    fetchNotifications();
  }, [userData]);

  const fetchNotifications = async () => {
    if (!userData) {
      console.log("No user found in fetchNotifications");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUnreadNotifications(userData.id);
      setNotifications(data);
      if (onUnreadCountChange) {
        onUnreadCountChange(data.length);
      }
    } catch (error) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userData) return;
    try {
      await markAllAsRead(userData.id);
      setNotifications([]);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      await fetchNotifications();
    } catch (error) {
      setError("Failed to mark all notifications as read");
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await markAsRead(notification.id, userData.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (onUnreadCountChange) {
        onUnreadCountChange(notifications.length - 1);
      }
      if (notification.link) {
        router.push(notification.link);
      }
      await fetchNotifications();
    } catch (error) {
      setError("Failed to mark notification as read");
    }
  };
  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  if (isMobile) {
    return (
      <div className="w-full">
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
        {loading ? (
          <div className="p-4 text-center text-gray-400 gap-2 flex justify-center">
            <Loader /> <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No unread notifications
          </div>
        ) : (
          <>
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 border-b border-zinc-800"
                onClick={() => handleMarkAsRead(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-[#F9DB6F] rounded-full flex items-center justify-center text-black">
                    <img
                      alt="notification"
                      src="/logo/pohloh.svg"
                      height={12}
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-white text-[20px] font-medium">
                    {notification.message}
                  </p>
                  {/* {notification.subtext && (
                    <p className="text-xs mt-1 text-[#F9DB6F]">
                      {notification.subtext}
                    </p>
                  )} */}
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
            <Button
              className="w-full text-[#F9DB6F] text-sm text-center mt-2 bg-transparent"
              onClick={() => {
                router.push("/notifications");
                if (setIsNotificationsOpen) setIsNotificationsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-[700px] bg-[#1a1a1a] rounded-lg shadow-lg border border-zinc-800 overflow-hidden z-50",
        {"w-full": isMobile}
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-white text-[32px] font-semibold font-urbanist">
            Notifications
          </span>
          <div className="bg-[#F9DB6F] text-black text-[16px] font-bold h-6 w-6 rounded-full flex items-center justify-center">
            {displayCount}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            className="hover:underline text-[20px] font-urbanist font-semibold bg-transparent text-[#F9DB6F] hover:bg-transparent cursor-pointer"
            onClick={() => {
              router.push("/notifications");
              if (setIsNotificationsOpen) setIsNotificationsOpen(false);
            }}
          >
            Show All
          </Button>
          <Button
            className="hover:underline text-[20px] font-urbanist font-semibold bg-transparent text-[#F9DB6F] hover:bg-transparent cursor-pointer"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
        {loading ? (
          <div className="p-4 text-center text-gray-400 gap-2 flex justify-center">
            <Loader /> <span>Loading notifications...</span>
          </div>
        ) : notifications?.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No unread notifications
          </div>
        ) : (
          notifications?.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <div
                className="flex items-start gap-3 p-4 hover:bg-zinc-800 transition-colors cursor-pointer bg-zinc-800/50"
                onClick={() => handleMarkAsRead(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-[#F9DB6F] rounded-full flex items-center justify-center text-black">
                    <img
                      alt="notification"
                      src="/logo/pohloh.svg"
                      height={16}
                    />
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
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              {index !== notifications.length - 1 && (
                <div className="h-px bg-[#CDCDCD] w-full" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
