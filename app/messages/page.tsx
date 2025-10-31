"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import Link from "next/link"

interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  lastMessage: string
  lastMessageTime: any
  unread: boolean
}

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [indexError, setIndexError] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "conversations"), where("participants", "array-contains", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const convs: Conversation[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          const otherUserId = data.participants.find((id: string) => id !== user.uid)
          convs.push({
            id: doc.id,
            otherUserId,
            otherUserName: data.otherUserName || "Unknown",
            lastMessage: data.lastMessage || "No messages yet",
            lastMessageTime: data.lastMessageTime,
            unread: data.unreadBy?.includes(user.uid) || false,
          })
        })

        convs.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate?.()?.getTime() || 0
          const timeB = b.lastMessageTime?.toDate?.()?.getTime() || 0
          return timeB - timeA
        })

        setConversations(convs)
        setIsLoading(false)
        setIndexError(false)
      },
      (error) => {
        console.error("Error fetching conversations:", error)
        if (error.code === "failed-precondition") {
          setIndexError(true)
        }
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground mt-2">Chat with buyers and sellers</p>
          </div>

          {indexError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">Index setup is in progress. Please refresh the page in a moment.</p>
              </CardContent>
            </Card>
          )}

          {conversations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No conversations yet. Start messaging with sellers!</p>
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">Browse Books</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.otherUserId}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${conv.unread ? "text-primary" : "text-foreground"}`}>
                            {conv.otherUserName}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {conv.lastMessageTime?.toDate?.()?.toLocaleDateString() || ""}
                          </p>
                          {conv.unread && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
