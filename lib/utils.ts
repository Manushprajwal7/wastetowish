import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLeaderboardRank(entries: any[]) {
  return entries.sort((a, b) => b.ecoPoints - a.ecoPoints)
}

export function getAverageRating(ratings: number[]) {
  if (ratings.length === 0) return 0
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function isItemExpired(expiresAt?: number) {
  if (!expiresAt) return false
  return Date.now() > expiresAt
}

export function getTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval)
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? "s" : ""} ago`
    }
  }
  return "just now"
}
