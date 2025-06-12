import React, {useEffect, useState} from "react";
import {Button} from "../ui/button";
import {supabase} from "@/supabase/client";
import {
  Notification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
} from "@/actions/notifications";
import {formatDistanceToNow} from "date-fns";
import {useUserHook} from "@/hooks/useUser";
import {useRouter} from "next/navigation";

type NotificationsProps = {
  setShowAllNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  onUnreadCountChange?: (count: number) => void;
};

export const Notifications = ({
  setShowAllNotifications,
  setIsNotificationsOpen,
  onUnreadCountChange,
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

    console.log("Current user ID:", userData.id);

    // Initial fetch
    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          console.log("Received real-time update:", payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData]);

  const fetchNotifications = async () => {
    if (!userData) {
      console.log("No user found in fetchNotifications");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching unread notifications for user:", userData.id);

      // First, let's check all notifications for this user
      const {data: allNotifications, error: allError} = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.id);

      console.log("All notifications for user:", allNotifications);

      // Then get unread notifications
      const data = await getUnreadNotifications(userData.id);
      console.log("Fetched unread notifications:", data);
      setNotifications(data);

      // Update the unread count in the parent component
      if (onUnreadCountChange) {
        onUnreadCountChange(data.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userData) return;
    try {
      await markAllAsRead(userData.id);
      setNotifications([]); // Immediately clear notifications
      if (onUnreadCountChange) {
        onUnreadCountChange(0); // Immediately update unread count
      }
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      setError("Failed to mark all notifications as read");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      // Immediately remove the notification from the list
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // Update the unread count
      if (onUnreadCountChange) {
        onUnreadCountChange(notifications.length - 1);
      }
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Failed to mark notification as read");
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-[700px] bg-[#1a1a1a] rounded-lg shadow-lg border border-zinc-800 overflow-hidden z-50">
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Unread Notifications</h3>
          <span className="bg-[#F9DB6F] text-black text-xs px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center text-xs text-[#F9DB6F]">
          <Button
            className="hover:underline bg-transparent text-[#F9DB6F] hover:bg-transparent"
            onClick={() => {
              router.push("/notifications");
              setIsNotificationsOpen(false);
            }}
          >
            Show All
          </Button>
          <Button
            className="hover:underline bg-transparent text-[#F9DB6F] hover:bg-transparent"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No unread notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-4 border-b border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer bg-zinc-800/50"
              onClick={() => handleMarkAsRead(notification.id)}
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
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
