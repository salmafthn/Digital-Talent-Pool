import Image from "next/image"

interface ChatBubbleProps {
  role: "ai" | "user"
  message: string
}

export default function ChatBubble({ role, message }: ChatBubbleProps) {
  const isAI = role === "ai"

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex gap-3 max-w-md ${isAI ? "" : "flex-row-reverse"}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {isAI ? (
            <Image src="/logos/diploy.png" alt="AI Assistant" width={32} height={32} className="object-contain" />
          ) : (
            <div className="w-full h-full bg-blue-600 rounded-full"></div>
          )}
        </div>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isAI ? "bg-blue-100 text-gray-900" : "bg-white border border-gray-200 text-gray-900"
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  )
}
