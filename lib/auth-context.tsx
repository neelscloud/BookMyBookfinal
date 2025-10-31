"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { hasValidConfig } from "./firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!hasValidConfig)

  useEffect(() => {
    if (!hasValidConfig) {
      return
    }

    const setupAuth = async () => {
      try {
        const { initializeFirebase } = await import("./firebase")
        const { auth } = await initializeFirebase()

        if (!auth) {
          setLoading(false)
          return
        }

        const { onAuthStateChanged } = await import("firebase/auth")

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser)
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Auth setup error:", error)
        setLoading(false)
      }
    }

    let unsubscribe: (() => void) | undefined

    setupAuth().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading, isConfigured: hasValidConfig }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
