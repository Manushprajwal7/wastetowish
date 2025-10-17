"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/lib/types"

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return

    const notificationsRef = collection(db, "notifications")
    const q = query(notificationsRef, where("userId", "==", user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[]
      setNotifications(notificationsData.sort((a, b) => b.createdAt - a.createdAt))
    })

    return unsubscribe
  }, [user])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      })
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setShowDropdown(!showDropdown)} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
