"use client";
import {useEffect, useState} from "react";
import {useUserHook} from "@/hooks/useUser";
import {getNotifications, markAsRead} from "@/services/notification.service";
import {formatDistanceToNow} from "date-fns";
import {useRouter} from "next/navigation";
import type {Notification} from "@/types/types";
import Loader from "@/components/shared/loader";

const NotificationsPage = () => {
  const {userData} = useUserHook();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (userData) {
      fetchAllNotifications();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const fetchAllNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(userData.id);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching all notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id, userData.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? {...n, read: true} : n))
        );
      }
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) => markAsRead(n.id, userData.id))
      );
      setNotifications((prev) => prev.map((n) => ({...n, read: true})));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <div className="w-full   text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between py-2 pb-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <span className="text-white text-[32px] font-semibold font-urbanist">
            Notifications
          </span>
          <div className="bg-[#F9DB6F] text-black text-[20px] font-bold h-8 w-8 rounded-full flex items-center justify-center">
            {displayCount}
          </div>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="hover:underline text-[#F9DB6F] text-[20px] font-bold cursor-pointer hover:text-[#f5d563] transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {/* Content */}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}

      {loading ? (
        <div className="p-6 text-center text-gray-400 gap-2 flex justify-center">
          <Loader /> <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No notifications found.
        </div>
      ) : (
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto bg-[#191919] rounded-[30px]">
          {notifications.map((notification, index) => (
            <>
              <div
                key={index}
                className="flex items-center px-6 py-4 cursor-pointer hover:bg-zinc-800/30 transition-colors gap-4"
                onClick={() => handleNotificationClick(notification)}
              >
                <img
                  alt="notification"
                  src="/logo/pohloh.svg"
                  className="h-[60px] w-[60px]"
                />
                <div className="flex-grow">
                  <p className="text-white text-[20px] font-medium">
                    {notification.message}
                  </p>
                  {notification.subtext && (
                    <p className="text-[#F9DB6F] text-xs mt-1">
                      {notification.subtext}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-[20px] text-[white] ml-auto">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              {index !== notifications.length - 1 && (
                <div className="h-px bg-[#CDCDCD] w-full" />
              )}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
