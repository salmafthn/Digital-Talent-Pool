"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from 'next/navigation'
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ChatBubble } from "@/components/chat/ChatBubble"
import { ChatInput } from "@/components/chat/ChatInput"
import { Button } from "@/components/ui/button"

type Message = { id: number; role: "ai" | "user"; text: string; kind?: "invite" }

const seedMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Halo! Selamat datang di Diploy. Berdasarkan profil Anda, saya telah menganalisis kompetensi Anda di area Data Science & Cloud dengan level sementara 4. Anda sudah memiliki dasar yang baik dalam beberapa aspek.",
  },
  {
    id: 2,
    role: "ai",
    text: "Untuk memberikan rekomendasi yang lebih akurat, saya ingin tahu: Tool atau teknologi apa saja yang sudah Anda kuasai? Misalnya: SQL, Python, Power BI, TensorFlow, atau yang lainnya?",
  },
  {
    id: 3,
    role: "user",
    text: "Saya sudah familiar dengan Python, SQL, dan Power BI. Saya juga sedang belajar machine learning dengan TensorFlow.",
  },
  {
    id: 4,
    role: "ai",
    text: "Bagus! Dengan pengalaman tersebut, saya merekomendasikan Anda untuk mengikuti assessment lebih lanjut guna menentukan level yang tepat di berbagai area fungsi TI. Hasilnya akan membantu Anda menemukan jalur karir yang paling sesuai.",
    kind: "invite",
  },
]

export default function ChatbotPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [userHasTyped, setUserHasTyped] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user")
      if (raw)
        try {
          setUserPhoto(JSON.parse(raw).photoUrl ?? null)
        } catch {}
    }
  }, [])

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  const lastMessage = messages[messages.length - 1]
  const showCTA = userHasTyped && lastMessage?.role === "ai" && lastMessage?.kind === "invite"

  function handleSendMessage(text: string) {
    setUserHasTyped(true)
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      text,
    }
    setMessages((prev) => [...prev, userMessage])

    setTimeout(() => {
      const botReply: Message = {
        id: messages.length + 2,
        role: "ai",
        text: "Terima kasih atas informasinya. Untuk mendapatkan penilaian yang akurat, saya merekomendasikan Anda segera mengikuti assessment untuk menentukan level kompetensi Anda di berbagai area fungsi TI.",
        kind: "invite",
      }
      setMessages((prev) => [...prev, botReply])
    }, 500)
  }

  function handleCTA() {
    const mapping = {
      DSC: { area: "Data Science & Cloud", level: 7, progress: 30, status: "Assessed", notes: "Kompeten – rekomendasi pekerjaan & pembelajaran tersedia." },
      TKTI: { area: "Tata Kelola TI", level: 3, progress: 50, status: "Unassessed", notes: "Perlu assessment untuk validasi level." },
      CYBER: { area: "Cybersecurity", level: 2, progress: 20, status: "Unassessed", notes: "Perlu assessment untuk validasi level." },
      PPD: { area: "PPD", level: 1, progress: 10, status: "Unassessed", notes: "" },
      TI: { area: "Teknologi Informasi", level: 4, progress: 40, status: "Unassessed", notes: "" },
      LTI: { area: "Layanan TI", level: 5, progress: 60, status: "Unassessed", notes: "" },
    };
    localStorage.setItem("mapping", JSON.stringify(mapping));
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-10">
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 flex flex-col h-[600px] sm:h-[650px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
              Konsultasi Kompetensi
            </h1>

            <div ref={scrollerRef} className="flex-1 space-y-4 sm:space-y-6 mb-4 overflow-y-auto pr-1">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} userPhoto={userPhoto}>
                  {msg.text}
                </ChatBubble>
              ))}

              {showCTA && (
                <div className="pt-4 flex justify-center">
                  <Button
                    onClick={handleCTA}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-full"
                  >
                    LIHAT HASIL PEMETAAN
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
