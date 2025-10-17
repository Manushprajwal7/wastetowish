"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import type { Conversation, Message } from "@/lib/types"
import { ArrowLeft, Send } from "lucide-react"

export default function ChatDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState("")
  const [error, setError] = useState("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!conversationId) return

    const fetchConversation = async () => {
      try {
        const docRef = doc(db, "conversations", conversationId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setConversation({
            id: docSnap.id,
            ...docSnap.data(),
          } as Conversation)
        } else {
          setError("Conversation not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load conversation")
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return

    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("conversationId", "==", conversationId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(messagesData.sort((a, b) => a.createdAt - b.createdAt))
    })

    return unsubscribe
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !messageText.trim() || !conversation) return

    setSending(true)
    setError("")

    try {
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user.id,
        senderName: user.name,
        text: messageText,
        createdAt: serverTimestamp(),
      })

      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      })

      setMessageText("")
    } catch (err: any) {
      setError(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center py-12">
            <p className="text-lg text-destructive">{error || "Conversation not found"}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view messages</p>
      </div>
    )
  }

  const otherParticipant = conversation.participantNames.find((name) => name !== user.name)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold">{otherParticipant}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${message.senderId === user.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !messageText.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
