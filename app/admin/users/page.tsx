"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import type { AdminUser } from "@/lib/types"
import { Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user?.email?.includes("admin")) {
      setIsAdmin(true)
    }
  }, [user])

  useEffect(() => {
    if (!isAdmin) return

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminUser[]
        setUsers(usersData.sort((a, b) => b.createdAt - a.createdAt))
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [isAdmin])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      await deleteDoc(doc(db, "users", userId))
      setUsers(users.filter((u) => u.id !== userId))
    } catch (err) {
      console.error("Failed to delete user:", err)
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

        <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Eco Points</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm">{u.name}</td>
                    <td className="px-6 py-4 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-sm font-medium">{u.ecoPoints}</td>
                    <td className="px-6 py-4 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(u.id)}
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

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
