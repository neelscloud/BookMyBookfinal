"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useState } from "react"
import Image from "next/image"

export default function Navigation() {
  const { user } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/bookmybook-logo.png" alt="BookMyBook Logo" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold text-primary">BookMyBook</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Browse
              </Link>
              <Link href="/profile" className="text-foreground hover:text-primary transition-colors">
                My Listings
              </Link>
              <Link
                href="/messages"
                className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                💬 Messages
              </Link>
              <Link href="/sell">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Sell Book</Button>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-foreground hidden sm:inline">{user.email?.split("@")[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-foreground hover:bg-muted transition-colors">
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
