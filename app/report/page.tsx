"use client"

import type React from "react"

import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AlertCircle } from "lucide-react"

export default function ReportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reportedUserId = searchParams.get("userId")
  const reportedItemId = searchParams.get("itemId")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user.id,
        reportedUserId: reportedUserId || null,
        reportedItemId: reportedItemId || null,
        reason,
        description,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setSubmitted(true)
      setTimeout(() => router.back(), 2000)
    } catch (error) {
      console.error("Error submitting report:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
          <p className="text-muted-foreground">
            Thank you for helping keep our community safe. Our team will review your report shortly.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Report a Problem</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="">Select a reason</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="fraud">Fraud or Scam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Please provide details about your report..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-32"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
