"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      router.push("/login")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-blue-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-16">
          <h1 className="text-3xl font-bold text-center text-foreground mb-8">Registrasi Akun</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Type here..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-border"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Type here..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-border"
              />
              <Link href="#" className="text-sm text-primary hover:text-primary/80 inline-block">
                Forgot password?
              </Link>
            </div>

            {/* Register Button */}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
              DAFTAR
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
                Log in here!
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
