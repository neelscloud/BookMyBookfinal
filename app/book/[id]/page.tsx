"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Link from "next/link"

interface Book {
  id: string
  title: string
  author: string
  price: number
  image: string
  condition: string
  seller: string
  sellerId: string
  description: string
  publishYear?: string
  genre?: string
}

export default function BookDetailsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return

      try {
        setIsLoading(true)
        const bookRef = doc(db, "books", bookId)
        const bookSnap = await getDoc(bookRef)

        if (bookSnap.exists()) {
          const data = bookSnap.data()
          setBook({
            id: bookSnap.id,
            title: data.title,
            author: data.author,
            price: data.price,
            image: data.image,
            condition: data.condition,
            seller: data.seller,
            sellerId: data.sellerId,
            description: data.description || "No description provided",
            publishYear: data.publishYear,
            genre: data.genre,
          })
        } else {
          setError("Book not found")
        }
      } catch (err) {
        console.error("Error fetching book details:", err)
        setError("Failed to load book details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookDetails()
  }, [bookId])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">{error || "Book not found"}</h1>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Back to Browse</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const isOwnBook = user?.uid === book.sellerId

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Book Image */}
          <div className="md:col-span-1">
            <div className="relative bg-muted rounded-lg overflow-hidden h-96">
              <img src={book.image || "/placeholder.svg"} alt={book.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-lg">
                ₹{book.price}
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">{book.title}</h1>
              <p className="text-xl text-muted-foreground">by {book.author}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-semibold text-foreground">{book.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Genre</p>
                    <p className="font-semibold text-foreground">{book.genre || "Not specified"}</p>
                  </div>
                  {book.publishYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="font-semibold text-foreground">{book.publishYear}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{book.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-semibold">{book.seller}</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isOwnBook && (
                <>
                  <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">Buy Now</Button>
                  <Link href={`/messages/${book.sellerId}?book=${encodeURIComponent(book.title)}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      💬 Message Seller
                    </Button>
                  </Link>
                </>
              )}
              {isOwnBook && (
                <Button variant="outline" className="w-full bg-transparent">
                  Edit Listing
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
