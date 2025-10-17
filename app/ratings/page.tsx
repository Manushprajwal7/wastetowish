"use client"

import { useAuth } from "@/components/auth-context"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserRating } from "@/lib/types"
import { Star } from "lucide-react"

export default function RatingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchRatings = async () => {
      try {
        const q = query(collection(db, "userRatings"), where("ratedUserId", "==", user.id))
        const snapshot = await getDocs(q)
        const ratingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserRating[]

        setRatings(ratingsData)

        if (ratingsData.length > 0) {
          const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
          setAverageRating(Math.round(avg * 10) / 10)
        }
      } catch (error) {
        console.error("Error fetching ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Ratings & Reviews</h1>

      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{averageRating}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{ratings.length} reviews</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {ratings.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No ratings yet. Start sharing items to get reviews!</p>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{rating.raterName}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-muted-foreground">{rating.comment}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
