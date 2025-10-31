"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BookCard from "@/components/book-card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { collection, query, getDocs } from "firebase/firestore"

interface Book {
  id: string
  title: string
  author: string
  price: number
  image: string
  condition: string
  seller: string
  sellerId: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(true)

  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "books"))
        const querySnapshot = await getDocs(q)
        const booksData: Book[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          booksData.push({
            id: doc.id,
            title: data.title,
            author: data.author,
            price: data.price,
            image: data.image,
            condition: data.condition,
            seller: data.seller,
            sellerId: data.sellerId,
          })
        })

        setBooks(booksData)
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setIsLoadingBooks(false)
      }
    }

    fetchBooks()
  }, [user])

  useEffect(() => {
    const filtered = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())

      const minPrice = priceRange.min ? Number.parseFloat(priceRange.min) : 0
      const maxPrice = priceRange.max ? Number.parseFloat(priceRange.max) : Number.POSITIVE_INFINITY
      const matchesPrice = book.price >= minPrice && book.price <= maxPrice

      const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(book.condition)

      return matchesSearch && matchesPrice && matchesCondition
    })

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    setFilteredBooks(filtered)
  }, [searchQuery, books, priceRange, selectedConditions, sortBy])

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    )
  }

  if (loading || isLoadingBooks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Browse Books</h1>
            <p className="text-muted-foreground text-lg">
              Discover thousands of used books from sellers in your community
            </p>
          </div>

          {/* Search Section */}
          <div className="flex gap-4">
            <Input
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Link href="/sell">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Sell a Book</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Price Range (₹)</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="w-1/2"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {priceRange.min ? `₹${priceRange.min}` : "Any"} - {priceRange.max ? `₹${priceRange.max}` : "Any"}
                  </p>
                </div>
              </div>

              {/* Condition Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Condition</h3>
                <div className="space-y-2">
                  {["Like New", "Good", "Fair", "Poor"].map((condition) => (
                    <label key={condition} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition)}
                        onChange={() => handleConditionToggle(condition)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-sm text-foreground">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title">Title: A to Z</option>
                </select>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setPriceRange({ min: "", max: "" })
                  setSelectedConditions([])
                  setSortBy("newest")
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>

            {/* Books Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">No books found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
