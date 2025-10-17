"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, countFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Item } from "@/lib/types"
import { Heart, Package, MessageSquare, TrendingUp, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState({
    itemsDonated: 0,
    requestsReceived: 0,
    requestsSent: 0,
    ecoPoints: 0,
  })
  const [recentItems, setRecentItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchDashboardData = async () => {
      try {
        // Get items donated
        const itemsQuery = query(collection(db, "items"), where("ownerId", "==", user.id))
        const itemsSnapshot = await getDocs(itemsQuery)
        const items = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]

        // Get requests received
        const receivedQuery = query(collection(db, "requests"), where("receiverId", "==", user.id))
        const receivedSnapshot = await countFromServer(receivedQuery)

        // Get requests sent
        const sentQuery = query(collection(db, "requests"), where("senderId", "==", user.id))
        const sentSnapshot = await countFromServer(sentQuery)

        setStats({
          itemsDonated: items.length,
          requestsReceived: receivedSnapshot.data().count,
          requestsSent: sentSnapshot.data().count,
          ecoPoints: user.ecoPoints || 0,
        })

        setRecentItems(items.slice(0, 3).sort((a, b) => b.createdAt - a.createdAt))
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your dashboard</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here's your sustainability impact at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Items Donated</h3>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.itemsDonated}</p>
            <p className="text-xs text-muted-foreground mt-2">Total items shared</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Requests Received</h3>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.requestsReceived}</p>
            <p className="text-xs text-muted-foreground mt-2">People interested in your items</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Requests Sent</h3>
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.requestsSent}</p>
            <p className="text-xs text-muted-foreground mt-2">Items you've requested</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Eco Points</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.ecoPoints}</p>
            <p className="text-xs text-muted-foreground mt-2">Sustainability score</p>
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Items</h2>
            <Link href="/my-items">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No items donated yet</p>
              <Link href="/add-item">
                <Button>Donate Your First Item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.category}</span>
                      <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                        {item.condition}
                      </span>
                    </div>
                  </div>
                  <Link href={`/item/${item.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/add-item">
            <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
              <Package className="w-6 h-6" />
              <span>Donate Item</span>
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
            >
              <Heart className="w-6 h-6" />
              <span>Browse Items</span>
            </Button>
          </Link>
          <Link href="/requests">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
            >
              <MessageSquare className="w-6 h-6" />
              <span>View Requests</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
