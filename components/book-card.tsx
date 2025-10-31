"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface BookCardProps {
  book: {
    id: string
    title: string
    author: string
    price: number
    image: string
    condition: string
    seller: string
    sellerId: string
  }
}

export default function BookCard({ book }: BookCardProps) {
  const { user } = useAuth()
  const isOwnBook = user?.uid === book.sellerId

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={book.image || "/placeholder.svg"}
          alt={book.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
          ₹{book.price}
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
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Seller:</span>
          <span className="font-medium">{book.seller}</span>
        </div>
        <div className="flex gap-2">
          {!isOwnBook && (
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">Buy Now</Button>
          )}
          <Link href={`/book/${book.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
          </Link>
          {!isOwnBook && (
            <Link href={`/messages/${book.sellerId}?book=${encodeURIComponent(book.title)}`} className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2 bg-transparent">
                💬 Message
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
