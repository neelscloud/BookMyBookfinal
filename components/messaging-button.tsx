"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface MessagingButtonProps {
  sellerId: string
  sellerName: string
  bookTitle: string
}

export default function MessagingButton({ sellerId, sellerName, bookTitle }: MessagingButtonProps) {
  return (
    <Link href={`/messages/${sellerId}?book=${encodeURIComponent(bookTitle)}`}>
      <Button className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
        💬 Message Seller
      </Button>
    </Link>
  )
}
