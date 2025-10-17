"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Trophy, Leaf } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<(User & { rank: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("ecoPoints", "desc"), limit(100))
        const snapshot = await getDocs(q)
        const users = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          rank: index + 1,
        })) as (User & { rank: number })[]

        setLeaderboard(users)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Eco Points Leaderboard</h1>
      </div>

      <div className="space-y-2">
        {leaderboard.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {user.rank <= 3 ? (
                    <Trophy
                      className={`w-5 h-5 ${user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-gray-400" : "text-orange-600"}`}
                    />
                  ) : (
                    <span className="font-bold text-primary">{user.rank}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">{user.ecoPoints}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
