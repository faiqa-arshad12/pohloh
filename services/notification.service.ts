import {apiUrl} from "@/utils/constant";
import {Notification} from "@/types/types";

export async function getNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const response = await fetch(`${apiUrl}/notifications/user/${userId}/all-relevant`);
    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }
    const {data} = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const response = await fetch(
      `${apiUrl}/notifications/user/${userId}/unread/count`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }
    const {data} = await response.json();
    console.log(data,'ppppp')
    return data.count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
}

export async function markAsRead(notificationId: string, userId:string): Promise<boolean> {
  try {
    const response = await fetch(
      `${apiUrl}/notifications/${notificationId}/read/${userId}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${apiUrl}/notifications/user/${userId}/read-all`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

export async function createNotification(
  notification: Omit<Notification, "id" | "created_at" | "read">
): Promise<Notification> {
  try {
    const response = await fetch(`${apiUrl}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
    });
    if (!response.ok) {
      throw new Error("Failed to create notification");
    }
    const data = await response.json();
    return data as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getUnreadNotifications(
  userId: string
): Promise<Notification[]> {
  try {
    const response = await fetch(
      `${apiUrl}/notifications/user/${userId}/unread`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch unread notifications");
    }
    const {data} = await response.json();
    console.log(data, "data");
    return data || [];
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
}
