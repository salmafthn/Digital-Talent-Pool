import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Recommendation } from "@/lib/store"

interface CardGridProps {
  title: string
  cards: Recommendation[]
  isLearning?: boolean
}

export default function CardGrid({ title, cards, isLearning = false }: CardGridProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
            <p className="font-semibold text-gray-900 mb-2">{card.title}</p>
            {card.description && <p className="text-sm text-gray-600 mb-3">{card.description}</p>}
            {isLearning && card.href && (
              <Link
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 font-semibold flex items-center gap-2 hover:text-blue-700"
              >
                Go to DTS <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
