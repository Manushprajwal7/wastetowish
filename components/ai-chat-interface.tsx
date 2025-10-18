"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/types";
import { Send, Bot, User } from "lucide-react";
import { generateChatResponse } from "@/lib/gemini-client";

interface AIChatInterfaceProps {
  onBack?: () => void;
}

export default function AIChatInterface({ onBack }: AIChatInterfaceProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
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
      text: "Hello! I'm your Waste To Wish AI assistant. How can I help you today with your donations or requests?",
      createdAt: Date.now(),
    };

    setMessages([welcomeMessage]);
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
      const aiResponseText = await generateChatResponse(
        [...messages, userMessage],
        messageText
      );

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

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Please sign in to chat with the AI assistant</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Assistant</h1>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="sm">
                Back to Chats
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container - Fixed height with scrollable content */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/30 p-4"
      >
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user.id ? "justify-end" : "justify-start"
              }`}
            >
              {message.senderId !== user.id && (
                <div className="flex-shrink-0 mr-3 mt-1">
                  {message.senderId === "ai-assistant" ? (
                    <div className="bg-primary rounded-full p-2">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="bg-secondary rounded-full p-2">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              )}
              <div
                className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  message.senderId === user.id
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : message.senderId === "ai-assistant"
                    ? "bg-card border border-border rounded-tl-none"
                    : "bg-secondary text-secondary-foreground rounded-tl-none"
                }`}
              >
                {message.senderId !== user.id && (
                  <p className="text-xs font-semibold mb-1">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
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
              {message.senderId === user.id && (
                <div className="flex-shrink-0 ml-3 mt-1">
                  <div className="bg-secondary rounded-full p-2">
                    <User className="w-5 h-5 text-secondary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {error && (
          <div className="text-sm text-destructive mb-4 p-3 bg-destructive/10 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ask the AI assistant..."
              disabled={sending}
              className="py-5 px-4 rounded-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
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
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Powered by Google Gemini • AI responses may contain inaccuracies
        </p>
      </div>
    </div>
  );
}
