import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function blockUser(userId: string, blockedUserId: string) {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      blockedUsers: arrayUnion(blockedUserId),
    })
    return { success: true }
  } catch (error) {
    console.error("Error blocking user:", error)
    return { success: false, error }
  }
}

export async function unblockUser(userId: string, blockedUserId: string) {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      blockedUsers: arrayRemove(blockedUserId),
    })
    return { success: true }
  } catch (error) {
    console.error("Error unblocking user:", error)
    return { success: false, error }
  }
}

export async function isUserBlocked(userId: string, otherUserId: string) {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    const blockedUsers = userSnap.data()?.blockedUsers || []
    return blockedUsers.includes(otherUserId)
  } catch (error) {
    console.error("Error checking blocked status:", error)
    return false
  }
}
