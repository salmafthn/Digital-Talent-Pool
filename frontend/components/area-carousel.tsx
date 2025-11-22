"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Area } from "@/lib/store"

interface AreaCarouselProps {
  areas: Area[]
  activeArea: string
  onSelectArea: (key: string) => void
}

export default function AreaCarousel({ areas, activeArea, onSelectArea }: AreaCarouselProps) {
  const [startIndex, setStartIndex] = useState(0)

  const getItemsPerPage = () => {
    if (typeof window === "undefined") return 3
    const width = window.innerWidth
    if (width < 768) return 1
    if (width < 1024) return 2
    return 3
  }

  const [itemsPerPage] = useState(getItemsPerPage())
  const totalPages = Math.ceil(areas.length / itemsPerPage)
  const currentItems = areas.slice(startIndex, startIndex + itemsPerPage)

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? (totalPages - 1) * itemsPerPage : prev - itemsPerPage))
  }

  const handleNext = () => {
    setStartIndex((prev) => (prev + itemsPerPage >= areas.length ? 0 : prev + itemsPerPage))
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <button
        onClick={handlePrev}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {currentItems.map((area) => (
          <button
            key={area.key}
            onClick={() => onSelectArea(area.key)}
            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-left ${
              activeArea === area.key ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <p className="font-semibold text-sm sm:text-base text-gray-900">{area.name}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Level {area.level}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  )
}
