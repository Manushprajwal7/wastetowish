"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import type { Message } from "@/lib/types";
import { ArrowLeft, Send, Bot } from "lucide-react";
import { generateChatResponse } from "@/lib/gemini-client";

export default function AIAssistantChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Initialize with a welcome message from the AI
    const welcomeMessage: Message = {
      id: "welcome",
      conversationId: "ai-assistant",
      senderId: "ai-assistant",
      senderName: "AI Assistant",
      text: "Hello! I'm your AI assistant. How can I help you today with your donations or requests?",
      createdAt: Date.now(),
    };

    setMessages([welcomeMessage]);
    setLoading(false);
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim()) return;

    setSending(true);
    setError("");

    try {
      // Add user message to the chat
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversationId: "ai-assistant",
        senderId: user.id,
        senderName: user.name || "User",
        text: messageText,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessageText("");

      // Generate AI response
      const aiResponseText = await generateChatResponse(messages, messageText);

      // Add AI response to the chat
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        conversationId: "ai-assistant",
        senderId: "ai-assistant",
        senderName: "AI Assistant",
        text: aiResponseText,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
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
            <p className="text-lg">
              Please sign in to chat with the AI assistant
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Ask me anything about donations, requests, or how to use this
            platform
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user.id
                      ? "bg-primary text-primary-foreground"
                      : message.senderId === "ai-assistant"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.senderId !== user.id &&
                    message.senderId !== "ai-assistant" && (
                      <p className="text-xs font-semibold mb-1">
                        {message.senderName}
                      </p>
                    )}
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === user.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {error && (
            <div className="text-sm text-destructive mb-4">{error}</div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ask the AI assistant..."
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={sending || !messageText.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Google Gemini
          </p>
        </div>
      </div>
    </div>
  );
}
