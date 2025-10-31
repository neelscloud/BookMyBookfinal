"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, addDoc, serverTimestamp, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { useParams } from "next/navigation"

interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: any
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params.userId as string
  const bookTitle = searchParams.get("book") || ""

  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [otherUserName, setOtherUserName] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !userId) return

    const fetchMessages = async () => {
      try {
        // Create a conversation ID (sorted user IDs)
        const conversationId = [user.uid, userId].sort().join("_")

        const q = query(collection(db, "messages"), where("conversationId", "==", conversationId))

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const msgs: Message[] = []
          querySnapshot.forEach((doc) => {
            msgs.push({
              id: doc.id,
              ...doc.data(),
            } as Message)
          })
          msgs.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.()?.getTime() || 0
            const timeB = b.timestamp?.toDate?.()?.getTime() || 0
            return timeA - timeB
          })
          setMessages(msgs)
          setIsLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error("Error fetching messages:", error)
        setIsLoading(false)
      }
    }

    const unsubscribe = fetchMessages()
    return () => {
      unsubscribe?.then((unsub) => unsub?.())
    }
  }, [user, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !user) return

    setIsSending(true)
    try {
      const conversationId = [user.uid, userId].sort().join("_")

      // Add message
      await addDoc(collection(db, "messages"), {
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        text: messageText,
        timestamp: serverTimestamp(),
      })

      // Update conversation metadata
      const conversationRef = doc(db, "conversations", conversationId)
      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadBy: [userId],
      }).catch(() => {
        // Create conversation if it doesn't exist
        addDoc(collection(db, "conversations"), {
          id: conversationId,
          participants: [user.uid, userId],
          otherUserName: otherUserName || "User",
          lastMessage: messageText,
          lastMessageTime: serverTimestamp(),
          unreadBy: [userId],
        })
      })

      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col">
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Chat</h2>
            {bookTitle && <p className="text-sm text-muted-foreground">About: {bookTitle}</p>}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp?.toDate?.()?.toLocaleTimeString() || ""}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  )
}
