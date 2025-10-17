"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import type { Item } from "@/lib/types"
import { Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminItemsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user?.email?.includes("admin")) {
      setIsAdmin(true)
    }
  }, [user])

  useEffect(() => {
    if (!isAdmin) return

    const fetchItems = async () => {
      try {
        const itemsSnapshot = await getDocs(collection(db, "items"))
        const itemsData = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]
        setItems(itemsData.sort((a, b) => b.createdAt - a.createdAt))
      } catch (err) {
        console.error("Failed to fetch items:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [isAdmin])

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await deleteDoc(doc(db, "items", itemId))
      setItems(items.filter((i) => i.id !== itemId))
    } catch (err) {
      console.error("Failed to delete item:", err)
    }
  }

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Manage Items</h1>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Owner</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm font-medium">{item.title}</td>
                    <td className="px-6 py-4 text-sm">{item.ownerName}</td>
                    <td className="px-6 py-4 text-sm">{item.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === "available"
                            ? "bg-green-100 text-green-800"
                            : item.status === "requested"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found</p>
          </div>
        )}
      </div>
    </div>
  )
}
