"use client"
import { useEffect, useState } from "react"
import { useUserHook } from "@/hooks/useUser"
import { getNotifications, type Notification } from "@/actions/notifications"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

const NotificationsPage = () => {
  const { userData } = useUserHook()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userData) {
      fetchAllNotifications()
    } else {
      setLoading(false)
    }
  }, [userData])

  const fetchAllNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getNotifications(userData.id)
      setNotifications(data)
    } catch (err) {
      console.error("Error fetching all notifications:", err)
      setError("Failed to load notifications.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-black text-white">
      {error && <div className="p-4 text-center text-red-500">{error}</div>}
      {loading ? (
        <div className="p-4 text-center text-gray-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-400">No notifications found.</div>
      ) : (
        <div className="max-h-screen overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id} className="flex items-start px-8 py-6 border-b border-zinc-800/50">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-[#F9DB6F] rounded-full flex items-center justify-center">
                  <Image alt="notification" src="/logo/pohloh.svg" height={20} width={20} />
                </div>
              </div>
              <div className="flex-grow">
                <p className="text-white text-base">{notification.message}</p>
                {notification.subtext && <p className="text-[#A2A2A2] text-base mt-1">{notification.subtext}</p>}
              </div>
              <div className="flex-shrink-0 text-sm text-gray-400 ml-4">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
