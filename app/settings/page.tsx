"use client"

import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Bell, Lock, Trash2 } from "lucide-react"
import Link from "next/link"

// Dynamically import Firebase only on client side
let signOut: any = null;
let auth: any = null;

if (typeof window !== "undefined") {
  try {
    const firebaseAuth = require("firebase/auth");
    const firebase = require("@/lib/firebase");
    
    signOut = firebaseAuth.signOut;
    auth = firebase.auth;
  } catch (error) {
    console.warn("Firebase not available during build time");
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleLogout = async () => {
    // Skip if Firebase is not available
    if (!auth || !signOut) {
      console.warn("Firebase not available, skipping logout");
      router.push("/");
      return;
    }
    
    await signOut(auth)
    router.push("/")
  }

  const handleDeleteAccount = async () => {
    // In production, implement proper account deletion with backend
    console.log("Account deletion initiated")
    await handleLogout()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about requests and messages</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Privacy & Security</h3>
            </div>
            <div className="space-y-3">
              <Link href="/auth/reset-password">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Change Password
                </Button>
              </Link>
              <Link href="/blocked-users">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Manage Blocked Users
                </Button>
              </Link>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent">
                Logout
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full justify-start bg-transparent text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <h3 className="font-semibold text-destructive mb-3">Delete Account?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleDeleteAccount} variant="destructive" className="flex-1">
                  Delete Permanently
                </Button>
                <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}