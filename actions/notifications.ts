import { supabase } from "@/supabase/client";

export type Notification = {
    id: string;
    user_id: string;
    message: string;
    subtext?: string;
    read: boolean;
    org_id?: string;
    team_id?: string;
    created_at: string;
};

export async function getNotifications(userId: string) {
    try {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        return data as Notification[];
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

export async function getUnreadCount(userId: string) {
    try {
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("read", false);

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        return count || 0;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        throw error;
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notificationId);

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

export async function markAllAsRead(userId: string) {
    try {
        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", userId)
            .eq("read", false);

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        return true;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at">) {
    try {
        const { data, error } = await supabase
            .from("notifications")
            .insert([notification])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        return data as Notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

export async function getUnreadNotifications(userId: string) {
    try {
        console.log("Getting unread notifications for user:", userId);

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .eq("read", false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error in getUnreadNotifications:", error);
            throw error;
        }

        console.log("Raw unread notifications data:", data);
        return data as Notification[];
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        throw error;
    }
}