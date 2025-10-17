"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Request } from "@/lib/types"
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RequestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent")

  useEffect(() => {
    if (authLoading || !user) return

    setLoading(true)
    const requestsRef = collection(db, "requests")

    // Query based on active tab
    const q =
      activeTab === "sent"
        ? query(requestsRef, where("senderId", "==", user.id))
        : query(requestsRef, where("receiverId", "==", user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[]
      setRequests(requestsData.sort((a, b) => b.createdAt - a.createdAt))
      setLoading(false)
    })

    return unsubscribe
  }, [user, authLoading, activeTab])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "accepted",
      })
    } catch (err) {
      console.error("Failed to accept request:", err)
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: "declined",
      })
    } catch (err) {
      console.error("Failed to decline request:", err)
    }
  }

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
          <p className="text-lg mb-4">Please sign in to view requests</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "declined":
        return <XCircle className="w-5 h-5 text-destructive" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 border-green-200"
      case "declined":
        return "bg-destructive/10 border-destructive/20"
      default:
        return "bg-yellow-50 border-yellow-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Requests</h1>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "sent"
                ? "text-primary border-b-2 border-primary -mb-[1px]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sent Requests
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "received"
                ? "text-primary border-b-2 border-primary -mb-[1px]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Received Requests
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {activeTab === "sent" ? "You haven't sent any requests yet" : "No requests received yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className={`border rounded-lg p-6 ${getStatusColor(request.status)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold">
                        {activeTab === "sent"
                          ? `Request to ${request.receiverId}`
                          : `Request from ${request.senderName}`}
                      </h3>
                    </div>
                    {request.message && <p className="text-sm text-muted-foreground mb-3">{request.message}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>

                  {activeTab === "received" && request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
                        Decline
                      </Button>
                    </div>
                  )}

                  {request.status !== "pending" && (
                    <div className="text-sm font-medium capitalize">
                      {request.status === "accepted" ? (
                        <span className="text-green-600">Accepted</span>
                      ) : (
                        <span className="text-destructive">Declined</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
