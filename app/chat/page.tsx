"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Conversation } from "@/lib/types"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    setLoading(true)
    const conversationsRef = collection(db, "conversations")
    const q = query(conversationsRef, where("participants", "array-contains", user.id))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[]
      setConversations(conversationsData.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0)))
      setLoading(false)
    })

    return unsubscribe
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
          <p className="text-lg mb-4">Please sign in to view messages</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start chatting by requesting an item or accepting a request
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherParticipant = conversation.participantNames.find((name) => name !== user.name)
              return (
                <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                  <div className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{otherParticipant}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      {conversation.lastMessageTime && (
                        <p className="text-xs text-muted-foreground ml-4">
                          {new Date(conversation.lastMessageTime).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
