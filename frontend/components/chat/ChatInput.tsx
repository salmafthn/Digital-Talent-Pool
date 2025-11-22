"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("")

  function handleSend() {
    if (value.trim()) {
      onSend(value.trim())
      setValue("")
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ketik pesan…"
        className="rounded-full"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            handleSend()
          }
        }}
      />
      <Button
        onClick={handleSend}
        className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex-shrink-0"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  )
}
