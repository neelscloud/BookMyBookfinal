"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
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

      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">📚</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">BookMyBook</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy and sell used books with ease. Connect with book lovers in your community and find your next great
              read.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-semibold text-lg">Find Books</h3>
              <p className="text-muted-foreground">Browse thousands of used books from sellers near you</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">💰</div>
              <h3 className="font-semibold text-lg">Great Prices</h3>
              <p className="text-muted-foreground">Save money by buying used books at affordable prices</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="font-semibold text-lg">Easy Selling</h3>
              <p className="text-muted-foreground">List your books and start earning money today</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
