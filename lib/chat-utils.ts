import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Conversation } from "@/lib/types"

export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  userName1: string,
  userName2: string,
): Promise<string> {
  const conversationsRef = collection(db, "conversations")
  const q = query(conversationsRef, where("participants", "array-contains", userId1))

  const snapshot = await getDocs(q)
  const existing = snapshot.docs.find((doc) => {
    const data = doc.data() as Conversation
    return data.participants.includes(userId2)
  })

  if (existing) {
    return existing.id
  }

  const newConversation = await addDoc(conversationsRef, {
    participants: [userId1, userId2],
    participantNames: [userName1, userName2],
    createdAt: serverTimestamp(),
  })

  return newConversation.id
}
