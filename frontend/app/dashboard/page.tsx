"use client"

import { useRouter } from 'next/navigation'
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useMapping } from "@/lib/use-mapping"
import { useState } from "react"
import DashboardProfileSnippet from "@/components/dashboard-profile-snippet"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const mapping = useMapping()
  const [activeKey, setActiveKey] = useState<keyof typeof mapping>("DSC")

  const keys = Object.keys(mapping) as (keyof typeof mapping)[]
  const currentIdx = keys.indexOf(activeKey)
  const active = mapping[activeKey]

  const handlePrevArea = () => {
    setActiveKey(keys[(currentIdx - 1 + keys.length) % keys.length])
  }

  const handleNextArea = () => {
    setActiveKey(keys[(currentIdx + 1) % keys.length])
  }

  const handleUpgradeLevel = () => {
    router.push("/profile")
  }

  const handleGoToAssessment = () => {
    router.push(`/assessment?area=${encodeURIComponent(activeKey)}`)
  }

  const handleProbing = () => {
    router.push("/chatbot")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          {/* Profile snippet */}
          <DashboardProfileSnippet />

          {/* Area Navigation with Circular Buttons and Dot Indicators */}
          <div className="mb-8 sm:mb-10 mt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-sm flex-shrink-0"
                onClick={handlePrevArea}
                aria-label="Previous area"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 justify-center">
                {keys.map((key, idx) => (
                  <span
                    key={key}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      idx === currentIdx ? "bg-blue-600" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-sm flex-shrink-0"
                onClick={handleNextArea}
                aria-label="Next area"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Area name reference below dots */}
            <div className="mt-4 text-center text-sm font-medium text-gray-700">
              {active.area}
            </div>
          </div>

          {/* Active Area Panel */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
            {active.status === "Assessed" ? (
              <div className="space-y-6">
                {/* Header with level, name, and status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                      LEVEL {active.level}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-semibold">
                      {active.area}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                    Dinilai
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all"
                      style={{ width: `${active.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {active.progress}%
                  </span>
                </div>

                {/* Rekomendasi Pekerjaan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Rekomendasi Pekerjaan
                    </h3>
                    <span className="text-xs text-slate-400">
                      berdasarkan profil & jawabanmu
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="font-semibold text-sm">AI Engineer</div>
                      <p className="mt-2 text-xs text-slate-600">
                        Mengembangkan dan mengimplementasikan model AI untuk solusi bisnis.
                      </p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="font-semibold text-sm">ML Engineer</div>
                      <p className="mt-2 text-xs text-slate-600">
                        Membangun pipeline data dan model machine learning siap produksi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Pembelajaran */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Rekomendasi Pembelajaran
                    </h3>
                    <span className="text-xs text-slate-400">
                      tersambung ke platform DTS
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border p-4 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-sm">Modul 1 – Dasar Data Science</div>
                        <p className="mt-2 text-xs text-slate-600">
                          Pengantar statistik, Python untuk analisis data, dan visualisasi.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-3 w-full text-xs"
                        onClick={() => window.open("https://digitalent.kominfo.go.id", "_blank")}
                      >
                        Go to DTS
                      </Button>
                    </div>
                    <div className="rounded-xl border p-4 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-sm">Modul 2 – Machine Learning Lanjutan</div>
                        <p className="mt-2 text-xs text-slate-600">
                          Pemodelan supervised/unsupervised dan deployment sederhana.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-3 w-full text-xs"
                        onClick={() => window.open("https://digitalent.kominfo.go.id", "_blank")}
                      >
                        Go to DTS
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Upgrade Level button */}
                <div className="pt-4 flex justify-center border-t">
                  <Button
                    className="px-8 rounded-full font-semibold"
                    onClick={handleUpgradeLevel}
                  >
                    UPGRADE LEVEL
                  </Button>
                </div>
              </div>
            ) : (
              // Existing code for non-assessed areas
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                      LEVEL {active.level}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-semibold">
                      {active.area}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold">
                    Belum Dinilai
                  </span>
                </div>

                <p className="text-sm text-slate-600">
                  {active.notes || "Perlu assessment untuk validasi level dan rekomendasi lanjutan."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    className="sm:flex-1 rounded-full font-semibold"
                    onClick={handleGoToAssessment}
                  >
                    Go to Assessment
                  </Button>
                  <Button
                    variant="outline"
                    className="sm:flex-1 rounded-full font-semibold"
                    onClick={handleProbing}
                  >
                    Probing
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
