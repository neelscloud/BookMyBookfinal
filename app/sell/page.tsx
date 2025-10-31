"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export default function SellPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    condition: "Good",
    description: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)
    formDataUpload.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        },
      )
      const data = await response.json()
      setUploadedImageUrl(data.secure_url)
    } catch (error) {
      console.error("Image upload failed:", error)
      alert("Failed to upload image. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "books"), {
        title: formData.title,
        author: formData.author,
        price: Number.parseFloat(formData.price),
        condition: formData.condition,
        description: formData.description,
        image: uploadedImageUrl,
        seller: user.displayName || user.email,
        sellerId: user.uid,
        createdAt: serverTimestamp(),
      })
      alert("Book listed successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error listing book:", error)
      alert("Failed to list book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Sell a Book</CardTitle>
            <CardDescription>List your used book for sale on BookMyBook</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Book Cover Image</label>
                <div className="border-2 border-dashed border-muted-foreground rounded-lg p-6 text-center">
                  {uploadedImageUrl ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImageUrl || "/placeholder.svg"}
                        alt="Book cover"
                        className="h-48 mx-auto object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-input")?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Click to upload book cover image</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-input")?.click()}
                      >
                        Choose Image
                      </Button>
                    </div>
                  )}
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Book Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                  Book Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter book title"
                  required
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label htmlFor="author" className="block text-sm font-medium text-foreground">
                  Author (Optional)
                </label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Enter author name"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-foreground">
                  Price (₹) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price in rupees"
                  required
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label htmlFor="condition" className="block text-sm font-medium text-foreground">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-foreground">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the condition and any notes about the book"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90">
                {isSubmitting ? "Listing Book..." : "List Book for Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
