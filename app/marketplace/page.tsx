"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { Item } from "@/lib/types"
import { Search, Heart, MapPin } from "lucide-react"

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Books", "Electronics", "Furniture", "Clothing", "Kitchen", "Sports", "Other"]

  useEffect(() => {
    if (authLoading) return

    setLoading(true)
    const itemsRef = collection(db, "items")
    const q = query(itemsRef, where("status", "==", "available"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[]
      setItems(itemsData)
      setLoading(false)
    })

    return unsubscribe
  }, [authLoading])

  useEffect(() => {
    let filtered = items

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, selectedCategory])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view the marketplace</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/add-item">
              <Button className="gap-2">
                <Heart className="w-4 h-4" />
                Donate Item
              </Button>
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items found. Be the first to donate!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/item/${item.id}`}>
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    {item.imageURL ? (
                      <img
                        src={item.imageURL || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.category}</span>
                      <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                        {item.condition}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.location || "Location not specified"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">By {item.ownerName}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
