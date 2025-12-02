"use client"

import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useMapping } from "@/lib/use-mapping"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const mapping = useMapping()

  // Hanya tampilkan 3 area di dashboard
  const areaKeys = ["DSC", "TKTI", "CYBER"] as (keyof typeof mapping)[]
  const [activeKey, setActiveKey] = useState<(typeof areaKeys)[number]>("DSC")

  const keys = areaKeys
  const currentIdx = keys.indexOf(activeKey)
  const active = mapping[activeKey]

  const handlePrevArea = () => {
    setActiveKey(keys[(currentIdx - 1 + keys.length) % keys.length])
  }

  const handleNextArea = () => {
    setActiveKey(keys[(currentIdx + 1) % keys.length])
  }

  const handleGoToProfile = () => router.push("/profile")
  const handleGoToAssessment = () =>
    router.push(`/assessment?area=${encodeURIComponent(activeKey)}`)
  const handleGoToDTS = () =>
    window.open("https://digitalent.kominfo.go.id", "_blank")

  // Rekomendasi pembelajaran (dummy)
  const recommendedMaterials: string[] = [
    "Dasar Data Science",
    "Python untuk Analisis Data",
    "Machine Learning Dasar",
    "Machine Learning Lanjutan",
    "Data Visualization",
    "Deployment Model",
  ]

  // Profil tidak bisa dimapping kalau masih Unassessed & level = 0
  const isUnmappable = active.status === "Unassessed" && active.level === 0

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          {/* Area Navigation */}
          <div className="mb-8 sm:mb-10">
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
                      idx === currentIdx ? "bg-blue-600" : "bg-gray-300",
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

            <div className="mt-4 text-center text-sm font-medium text-gray-700">
              {active.area}
            </div>
          </div>

          {/* Active Area Panel */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
            {/* === CASE 1: Assessed === */}
            {active.status === "Assessed" ? (
              <div className="space-y-6">
                {/* Header level + status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                      LEVEL {active.level}
                    </span>
                    <h2 className="text-lg sm:text-2xl font-semibold">{active.area}</h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold whitespace-nowrap">
                    Assessed
                  </span>
                </div>

                {/* Progress bar – hidden, bisa dihidupkan lagi kalau perlu */}
                {false && (
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
                )}

                {/* Rekomendasi Pembelajaran (bullet points) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Rekomendasi Pembelajaran
                    </h3>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                    {recommendedMaterials.map((materi) => (
                      <li key={materi}>{materi}</li>
                    ))}
                  </ul>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Lakukan pembelajaran sebelum melakukan upgrade level. Kamu
                    dapat mengakses DTS untuk melihat beberapa pembelajaran yang
                    mungkin cocok dengan profilmu.
                  </p>
                </div>

                {/* Dua tombol: DTS (biru) & Update Profil (outline) */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t">
                  <Button
                    className="sm:flex-1 rounded-full font-semibold"
                    onClick={handleGoToDTS}
                  >
                    Go to DTS
                  </Button>
                  <Button
                    variant="outline"
                    className="sm:flex-1 rounded-full font-semibold"
                    onClick={handleGoToProfile}
                  >
                     Upgrade Level
                  </Button>
                </div>
              </div>
            ) : (
              /* === CASE 2: Unassessed === */
              <>
                {isUnmappable ? (
                  /* 2A. Profil tidak bisa dimapping (level 0) */
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        {/* Tidak tampilkan level karena belum terpetakan */}
                        <h2 className="text-lg sm:text-2xl font-semibold">
                          {active.area}
                        </h2>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold">
                        Belum Terpetakan
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      Mohon maaf, profilmu saat ini belum dapat dipetakan ke area
                      fungsi dan level manapun. Coba lengkapi atau perbarui data
                      profilmu, dan pertimbangkan untuk mengikuti pelatihan atau
                      sertifikasi yang relevan sebelum melakukan assessment
                      kembali.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        className="sm:flex-1 rounded-full font-semibold"
                        onClick={handleGoToProfile}
                      >
                        Perbarui Profil
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 2B. Unassessed biasa (masih bisa assessment) */
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
                        Unassessed
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      {active.notes ||
                        "Perlu assessment untuk validasi level dan rekomendasi lanjutan."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        className="sm:flex-1 rounded-full font-semibold"
                        onClick={handleGoToAssessment}
                      >
                        Go to Assessment
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}