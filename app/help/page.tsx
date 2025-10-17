"use client"

import { Card } from "@/components/ui/card"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HelpPage() {
  const router = useRouter()

  const faqs = [
    {
      question: "How do I donate an item?",
      answer:
        "Click on 'Donate Item' from your dashboard, fill in the item details including title, description, category, and condition, then upload a photo. Your item will be listed on the marketplace immediately.",
    },
    {
      question: "How do I request an item?",
      answer:
        "Browse the marketplace, find an item you're interested in, and click 'Request Item'. You can add a message to the donor explaining why you'd like the item. The donor will review your request and accept or decline.",
    },
    {
      question: "How do eco points work?",
      answer:
        "You earn eco points for every successful donation and completed request. These points reflect your contribution to sustainability and can be used to unlock achievements and climb the leaderboard.",
    },
    {
      question: "Can I message other users?",
      answer:
        "Yes! Once a request is accepted, you can chat directly with the other user to arrange pickup or delivery. You can also start conversations from the Messages section.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Click the flag icon on any item or user profile to submit a report. Our moderation team will review it and take appropriate action.",
    },
    {
      question: "What should I do if I have a dispute?",
      answer:
        "Contact our support team with details of the issue. We'll help mediate and find a fair resolution. You can also block users if needed.",
    },
    {
      question: "How do ratings and reviews work?",
      answer:
        "After a successful exchange, you can rate and review the other user. This helps build trust in the community and helps others make informed decisions.",
    },
    {
      question: "Can I delete my account?",
      answer:
        "Yes, you can delete your account from Settings. This will permanently remove all your data. Please note that this action cannot be undone.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Help & FAQ</h1>
          </div>
          <p className="text-muted-foreground">Find answers to common questions about Waste to Wish</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-6">
              <h3 className="font-semibold mb-3 text-lg">{faq.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            If you can't find the answer you're looking for, please contact our support team.
          </p>
          <Button>Contact Support</Button>
        </Card>
      </div>
    </div>
  )
}
