"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type User = { name?: string; photoUrl?: string }

export default function DashboardProfileSnippet() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user")
      if (raw)
        try {
          setUser(JSON.parse(raw))
        } catch {}
    }
  }, [])

  const photoUrl = user?.photoUrl || "/avatars/placeholder.png"
  const name = user?.name || "Nama Pengguna"

  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white rounded-2xl shadow-md p-4 sm:p-6">
      <Image
        src={photoUrl || "/placeholder.svg"}
        alt="User avatar"
        width={48}
        height={48}
        className="rounded-full flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-sm text-gray-600">NIK: 1234567890</p>
      </div>
    </div>
  )
}
