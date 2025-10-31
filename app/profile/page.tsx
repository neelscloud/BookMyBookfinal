"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import Link from "next/link"

interface UserBook {
  id: string
  title: string
  author: string
  price: number
  image: string
  condition: string
  createdAt: any
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "books"), where("sellerId", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const books: UserBook[] = []
        querySnapshot.forEach((doc) => {
          books.push({
            id: doc.id,
            ...doc.data(),
          } as UserBook)
        })
        setUserBooks(books.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.() || 0))
        setError(null)
      } catch (error) {
        console.error("Error fetching user books:", error)
        setError("Unable to load your books. Please check your internet connection and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserBooks()
  }, [user])

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    setDeletingId(bookId)
    try {
      await deleteDoc(doc(db, "books", bookId))
      setUserBooks(userBooks.filter((book) => book.id !== bookId))
    } catch (error) {
      console.error("Error deleting book:", error)
      alert("Failed to delete book. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading || isLoading) {
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground mt-2">{user?.email}</p>
              </div>
              <Link href="/sell">
                <Button className="bg-accent hover:bg-accent/90">List New Book</Button>
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Books Listed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{userBooks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  ₹{userBooks.reduce((sum, book) => sum + book.price, 0).toFixed(0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Listings */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">My Listings</h2>
            {userBooks.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">You haven't listed any books yet.</p>
                  <Link href="/sell">
                    <Button className="bg-accent hover:bg-accent/90">List Your First Book</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={book.image || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        ₹{book.price.toFixed(0)}
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                      <CardDescription className="text-sm">{book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="font-medium">{book.condition}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeleteBook(book.id)}
                          disabled={deletingId === book.id}
                        >
                          {deletingId === book.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
