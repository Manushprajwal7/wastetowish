"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { Item } from "@/lib/types"
import { MapPin, ArrowLeft, Heart, Star, Flag } from "lucide-react"

export default function ItemDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inWishlist, setInWishlist] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    if (!itemId) return

    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", itemId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setItem({
            id: docSnap.id,
            ...docSnap.data(),
          } as Item)

          const reviewsQuery = query(collection(db, "reviews"), where("itemId", "==", itemId))
          const reviewsSnapshot = await getDocs(reviewsQuery)
          setReviews(reviewsSnapshot.docs.map((doc) => doc.data()))

          if (user) {
            const wishlistQuery = query(
              collection(db, "wishlist"),
              where("userId", "==", user.id),
              where("itemId", "==", itemId),
            )
            const wishlistSnapshot = await getDocs(wishlistQuery)
            setInWishlist(wishlistSnapshot.docs.length > 0)
          }
        } else {
          setError("Item not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId, user])

  const handleRequestItem = () => {
    if (!user) {
      router.push("/login")
      return
    }

    router.push(`/request/${itemId}`)
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      if (inWishlist) {
        const wishlistQuery = query(
          collection(db, "wishlist"),
          where("userId", "==", user.id),
          where("itemId", "==", itemId),
        )
        const wishlistSnapshot = await getDocs(wishlistQuery)
        for (const doc of wishlistSnapshot.docs) {
          await deleteDoc(doc.ref)
        }
      } else {
        await addDoc(collection(db, "wishlist"), {
          userId: user.id,
          itemId,
          addedAt: serverTimestamp(),
        })
      }
      setInWishlist(!inWishlist)
    } catch (error) {
      console.error("Error updating wishlist:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-lg text-destructive">{error || "Item not found"}</p>
            <Link href="/marketplace" className="mt-4 inline-block">
              <Button>Return to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwnItem = user?.id === item.ownerId

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {item.imageURL ? (
                <img
                  src={item.imageURL || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground text-center">
                  <p>No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{item.category}</span>
                    <span className="text-sm bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full">
                      {item.condition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {item.location && (
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>{item.location}</span>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">About the Donor</h3>
              <p className="text-muted-foreground mb-4">{item.ownerName}</p>
              {!isOwnItem && (
                <p className="text-sm text-muted-foreground">Contact the donor to arrange pickup or delivery</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border pt-6 flex gap-3">
              {isOwnItem ? (
                <Button disabled className="flex-1">
                  Your Item
                </Button>
              ) : (
                <>
                  <Button onClick={handleRequestItem} className="flex-1 gap-2">
                    <Heart className="w-4 h-4" />
                    Request Item
                  </Button>
                  <Button
                    variant={inWishlist ? "default" : "outline"}
                    size="icon"
                    onClick={handleAddToWishlist}
                    title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
                  </Button>
                  <Link href={`/report?itemId=${itemId}`}>
                    <Button variant="outline" size="icon" title="Report item">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {isOwnItem && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">This is your item. You can manage it from your dashboard.</p>
              </div>
            )}
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.reviewerName}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
