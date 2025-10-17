export interface User {
  id: string
  name: string
  email: string
  photoURL?: string
  ecoPoints: number
  createdAt: number
  emailVerified?: boolean
  rating?: number
  reviewCount?: number
  bio?: string
  location?: string
  joinedDate?: number
  totalDonations?: number
  totalRequests?: number
  blockedUsers?: string[]
}

export interface Item {
  id: string
  title: string
  description: string
  category: string
  condition: "Like New" | "Good" | "Fair" | "Poor"
  imageURL?: string
  ownerId: string
  ownerName: string
  status: "available" | "requested" | "completed"
  createdAt: number
  location?: string
  expiresAt?: number
  archived?: boolean
  tags?: string[]
}

export interface Request {
  id: string
  itemId: string
  senderId: string
  senderName: string
  receiverId: string
  status: "pending" | "accepted" | "declined" | "completed"
  message?: string
  createdAt: number
}

export interface Notification {
  id: string
  userId: string
  type: "request" | "accepted" | "declined" | "new_item" | "message" | "review"
  title: string
  message: string
  read: boolean
  createdAt: number
  relatedId?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  createdAt: number
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageTime?: number
  createdAt: number
}

export interface Review {
  id: string
  itemId: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment: string
  createdAt: number
}

export interface UserRating {
  id: string
  ratedUserId: string
  raterUserId: string
  raterName: string
  rating: number
  comment: string
  createdAt: number
}

export interface WishlistItem {
  id: string
  userId: string
  itemId: string
  addedAt: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  ecoPoints: number
  itemsDonated: number
  rating: number
  rank: number
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId?: string
  reportedItemId?: string
  reason: string
  description: string
  status: "pending" | "reviewed" | "resolved"
  createdAt: number
}

export interface AdminUser extends User {
  isAdmin?: boolean
  itemsCount?: number
  requestsCount?: number
}
