"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import type { Item } from "@/lib/types"
import { ArrowLeft } from "lucide-react"

export default function RequestItemPage() {
  const { user, firebaseUser } = useAuth()
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

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
  }, [itemId])

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !firebaseUser || !item) return

    setSubmitting(true)
    setError("")

    try {
      // Create request document
      const requestRef = await addDoc(collection(db, "requests"), {
        itemId,
        senderId: firebaseUser.uid,
        senderName: user.name,
        receiverId: item.ownerId,
        status: "pending",
        message,
        createdAt: serverTimestamp(),
      })

      // Create notification for item owner
      await addDoc(collection(db, "notifications"), {
        userId: item.ownerId,
        type: "request",
        title: `New request for "${item.title}"`,
        message: `${user.name} requested your item`,
        read: false,
        createdAt: serverTimestamp(),
        relatedId: requestRef.id,
      })

      router.push("/requests")
    } catch (err: any) {
      setError(err.message || "Failed to submit request")
    } finally {
      setSubmitting(false)
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-lg text-destructive">{error || "Item not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">Please sign in to request items</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Request Item</h1>
          <p className="text-muted-foreground mb-8">Send a request to {item.ownerName} for this item</p>

          <div className="bg-muted rounded-lg p-4 mb-8">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the donor why you're interested in this item..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                The donor will receive a notification about your request. They can accept or decline your request.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Sending..." : "Send Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
