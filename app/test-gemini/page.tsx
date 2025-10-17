"use client"

import { useState } from "react"
import { generateChatResponse } from "@/lib/gemini-client"
import type { Message } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestGeminiPage() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTest = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError("")
    setResponse("")

    try {
      // Create a mock message history
      const mockMessages: Message[] = [
        {
          id: "1",
          conversationId: "test",
          senderId: "user",
          senderName: "Test User",
          text: "Hello, I'm testing the AI assistant",
          createdAt: Date.now() - 1000,
        }
      ]

      const result = await generateChatResponse(mockMessages, input)
      setResponse(result)
    } catch (err: any) {
      setError(err.message || "Failed to generate response")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Gemini Integration</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a test message..."
                disabled={loading}
              />
              <Button onClick={handleTest} disabled={loading || !input.trim()}>
                {loading ? "Testing..." : "Test"}
              </Button>
            </div>
            
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                Error: {error}
              </div>
            )}
            
            {response && (
              <div className="p-4 bg-secondary rounded">
                <h3 className="font-semibold mb-2">AI Response:</h3>
                <p>{response}</p>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>To use this test:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Make sure you have added your Gemini API key to the .env file</li>
                <li>Enter a message in the input field</li>
                <li>Click the Test button to see the AI response</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}