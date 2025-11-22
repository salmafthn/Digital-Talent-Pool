"use client"

import type React from "react"

import Image from "next/image"
import clsx from "clsx"

type Props = {
  role: "ai" | "user"
  children: React.ReactNode
  userPhoto?: string | null
}

export function ChatBubble({ role, children, userPhoto }: Props) {
  const isUser = role === "user"
  const avatarSrc = isUser ? userPhoto || "/avatars/placeholder.png" : "/logos/diploy.png"

  return (
    <div className={clsx("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Image
          src={avatarSrc || "/placeholder.svg"}
          alt="AI Assistant"
          width={32}
          height={32}
          className="rounded-full ring-1 ring-white shadow flex-shrink-0"
        />
      )}
      <div
        className={clsx(
          "max-w-[90%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-base",
          isUser ? "bg-white border border-gray-200 text-gray-900" : "bg-blue-100 text-gray-900",
        )}
      >
        {children}
      </div>
      {isUser && (
        <Image
          src={avatarSrc || "/placeholder.svg"}
          alt="User Avatar"
          width={32}
          height={32}
          className="rounded-full ring-1 ring-white shadow flex-shrink-0"
        />
      )}
    </div>
  )
}
