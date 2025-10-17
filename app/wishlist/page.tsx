"use client"

import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Item, WishlistItem } from "@/lib/types"
import { Heart, Trash2 } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { item?: Item })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchWishlist = async () => {
      try {
        const q = query(collection(db, "wishlist"), where("userId", "==", user.id))
        const snapshot = await getDocs(q)
        const wishlistData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WishlistItem[]

        // Fetch item details for each wishlist item
        const itemsWithDetails = await Promise.all(
          wishlistData.map(async (wItem) => {
            const itemDoc = await getDocs(query(collection(db, "items"), where("id", "==", wItem.itemId)))
            return {
              ...wItem,
              item: itemDoc.docs[0]?.data() as Item,
            }
          }),
        )

        setWishlistItems(itemsWithDetails.filter((item) => item.item))
      } catch (error) {
        console.error("Error fetching wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user, router])

  const handleRemove = async (wishlistId: string) => {
    try {
      await deleteDoc(doc(db, "wishlist", wishlistId))
      setWishlistItems(wishlistItems.filter((item) => item.id !== wishlistId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary fill-primary" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Link href="/marketplace">
            <Button>Browse Items</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((wItem) => (
            <Card key={wItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {wItem.item?.imageURL && (
                <img
                  src={wItem.item.imageURL || "/placeholder.svg"}
                  alt={wItem.item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{wItem.item?.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{wItem.item?.description}</p>
                <div className="flex gap-2">
                  <Link href={`/item/${wItem.item?.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Item
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(wItem.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
