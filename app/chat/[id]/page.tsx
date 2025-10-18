"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import type { Conversation, Message } from "@/lib/types";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";

export default function ChatDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  // Remove auto-scroll by not calling this on every message update
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  // }

  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages])

  const fetchConversation = async () => {
    if (!conversationId) return;

    try {
      setError("");
      setRetrying(true);
      const docRef = doc(db, "conversations", conversationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setConversation({
          id: docSnap.id,
          ...docSnap.data(),
        } as Conversation);
      } else {
        setError("Conversation not found");
      }
    } catch (err: any) {
      console.error("Error fetching conversation:", err);
      if (err.code === "unavailable" || err.message?.includes("offline")) {
        setError(
          "You are currently offline. Please check your internet connection and try again."
        );
      } else {
        setError(
          err.message ||
            "Failed to load conversation. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("conversationId", "==", conversationId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        // Sort messages by createdAt timestamp
        setMessages(
          messagesData.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        );
      },
      (error) => {
        console.error("Error listening to messages:", error);
        if (
          error.code === "unavailable" ||
          error.message?.includes("offline")
        ) {
          setError(
            "You are currently offline. Please check your internet connection and try again."
          );
        } else {
          setError(
            "Failed to receive messages. Please check your connection and try again."
          );
        }
      }
    );

    return unsubscribe;
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim() || !conversation) return;

    setSending(true);
    setError("");

    try {
      // Create a temporary message with a client-side ID for immediate display
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user.id,
        senderName: user.name || "User",
        text: messageText,
        createdAt: Date.now(),
      };

      // Add to UI immediately for better UX
      setMessages((prev) => [...prev, tempMessage]);
      setMessageText("");

      // Save to Firestore
      const docRef = await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user.id,
        senderName: user.name,
        text: messageText,
        createdAt: serverTimestamp(),
      });

      // Update conversation last message
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
      });

      // Replace temporary message with the real one from Firestore
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...tempMessage, id: docRef.id } : msg
        )
      );
    } catch (err: any) {
      console.error("Error sending message:", err);
      // Remove the temporary message from UI if failed to send
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));

      if (err.code === "unavailable" || err.message?.includes("offline")) {
        setError(
          "Message failed to send - you are currently offline. Please check your connection and try again."
        );
      } else {
        setError(
          err.message ||
            "Failed to send message. Please check your connection and try again."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    fetchConversation();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-center py-12">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Connection Error
              </h3>
              <p className="text-destructive mb-4">
                {error || "Conversation not found"}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="flex items-center gap-2"
                >
                  {retrying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Retry Connection
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Chats
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to view messages</p>
      </div>
    );
  }

  const otherParticipant = conversation.participantNames.find(
    (name) => name !== user.name
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-xl font-bold">{otherParticipant}</h1>
            <div></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Messages Container - Centered and properly styled */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/30 py-6">
        <div className="max-w-2xl mx-auto px-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.senderId === user.id
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card border border-border rounded-tl-none"
                    }`}
                  >
                    {message.senderId !== user.id && (
                      <p className="text-xs font-semibold mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.senderId === user.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sending..."}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="py-5 px-4 rounded-full"
            />
            <Button
              type="submit"
              disabled={sending || !messageText.trim()}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
