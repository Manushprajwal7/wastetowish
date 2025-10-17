"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import type { Request } from "@/lib/types"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user?.email?.includes("admin")) {
      setIsAdmin(true)
    }
  }, [user])

  useEffect(() => {
    if (!isAdmin) return

    const fetchRequests = async () => {
      try {
        const requestsSnapshot = await getDocs(collection(db, "requests"))
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Request[]
        setRequests(requestsData.sort((a, b) => b.createdAt - a.createdAt))
      } catch (err) {
        console.error("Failed to fetch requests:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Access Denied</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === "pending").length
  const acceptedRequests = requests.filter((r) => r.status === "accepted").length
  const declinedRequests = requests.filter((r) => r.status === "declined").length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Request Reports</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Pending</h3>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold">{pendingRequests}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Accepted</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{acceptedRequests}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Declined</h3>
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold">{declinedRequests}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">From</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Message</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm">{request.senderName}</td>
                    <td className="px-6 py-4 text-sm">{request.receiverId}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm truncate max-w-xs">{request.message || "—"}</td>
                    <td className="px-6 py-4 text-sm">{new Date(request.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}
