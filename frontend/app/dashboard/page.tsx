"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getChatHistory } from "@/services/aiService"

type AreaKey = "DSC" | "TKTI" | "PPD" | "CYBER" | "TI" | "LTI" | "NON_TIK"
type AssessStatus = "Assessed" | "Unassessed"

type DashboardArea = {
  key: AreaKey
  title: string
  level?: number
  status?: AssessStatus
  recommendations?: string[]
  rawArea?: string
}

const LS_ASSESS_PREFIX = "assessment_status_" // contoh: assessment_status_DSC = "assessed"

// 🔧 Kamu bisa sesuaikan konten rekomendasi per area
const RECOMMENDATIONS: Record<
  Exclude<AreaKey, "NON_TIK">,
  { title: string; recommendations: string[] }
> = {
  DSC: {
    title: "Data Science & Cloud",
    recommendations: [
      "Dasar Data Science",
      "Python untuk Analisis Data",
      "Machine Learning Dasar",
      "Machine Learning Lanjutan",
      "Data Visualization",
      "Deployment Model",
    ],
  },
  TKTI: {
    title: "IT Governance",
    recommendations: [
      "Dasar IT Governance",
      "COBIT / ITIL Overview",
      "Risk & Compliance",
      "Policy & Audit Dasar",
      "Service Strategy & KPI",
    ],
  },
  PPD: {
    title: "Digital Product Development",
    recommendations: [
      "Product Discovery",
      "User Research Dasar",
      "PRD & Requirement",
      "Agile/Scrum",
      "Roadmap & Prioritization",
    ],
  },
  CYBER: {
    title: "Cybersecurity",
    recommendations: [
      "Fundamental Security",
      "Network Security Dasar",
      "OWASP Top 10",
      "Incident Response",
      "Security Awareness",
    ],
  },
  TI: {
    title: "Teknologi & Infrastruktur",
    recommendations: [
      "Dasar Infrastruktur",
      "Linux Fundamental",
      "Networking Dasar",
      "Cloud Fundamental",
      "Monitoring & Logging",
    ],
  },
  LTI: {
    title: "Layanan Teknologi Informasi",
    recommendations: [
      "IT Service Management Dasar",
      "Incident vs Request",
      "SLA & Prioritization",
      "Change Management Dasar",
      "Komunikasi dengan User",
    ],
  },
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[–—-]/g, "-")
    .trim()
}

function mapAreaToKey(areaFungsi: string): AreaKey {
  const a = normalize(areaFungsi)

  // Non TIK
  if (a.includes("non tik") || a.includes("non-tik")) return "NON_TIK"

  // alias mapping (buat variasi output model)
  const alias: Array<[string, AreaKey]> = [
    ["data science", "DSC"],
    ["sains data", "DSC"],
    ["kecerdasan artifisial", "DSC"],
    ["ai", "DSC"],
    ["cloud", "DSC"],

    ["tata kelola", "TKTI"],
    ["it governance", "TKTI"],
    ["governance", "TKTI"],

    ["pengembangan produk digital", "PPD"],
    ["digital product", "PPD"],
    ["product development", "PPD"],

    ["keamanan informasi", "CYBER"],
    ["siber", "CYBER"],
    ["cyber", "CYBER"],
    ["cybersecurity", "CYBER"],

    ["teknologi dan infrastruktur", "TI"],
    ["infrastruktur", "TI"],
    ["infrastructure", "TI"],

    ["layanan teknologi informasi", "LTI"],
    ["layanan ti", "LTI"],
    ["it service", "LTI"],
    ["it services", "LTI"],
  ]

  for (const [needle, key] of alias) {
    if (a.includes(needle)) return key
  }

  // kalau gak ketemu, anggap Non TIK biar UI aman
  return "NON_TIK"
}

function extractResultTag(text: string): string | null {
  if (!text) return null
  const matches = Array.from(text.matchAll(/<RESULT>([\s\S]*?)<\/RESULT>/g))
  if (matches.length === 0) return null
  return matches[matches.length - 1][1]?.trim() ?? null
}

function safeJsonParse(raw: string): any | null {
  if (!raw) return null

  // kandidat 1: langsung parse
  try {
    return JSON.parse(raw)
  } catch {}

  // kandidat 2: unescape model output seperti {\"area_fungsi\":\"...\"}
  const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\")
  try {
    return JSON.parse(unescaped)
  } catch {}

  return null
}

export default function DashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [areas, setAreas] = useState<DashboardArea[]>([
    {
      key: "NON_TIK",
      title: "Memuat hasil...",
    },
  ])
  const [activeIndex, setActiveIndex] = useState(0)

  const keys = useMemo(() => areas.map((a) => a.key), [areas])
  const active = areas[activeIndex] ?? areas[0]

  // ambil status assessed/unassessed dari localStorage (plan cadangan)
  function getAssessStatus(areaKey: AreaKey): AssessStatus | undefined {
    if (areaKey === "NON_TIK") return undefined
    if (typeof window === "undefined") return "Unassessed"

    const v = localStorage.getItem(`${LS_ASSESS_PREFIX}${areaKey}`)
    return v === "assessed" ? "Assessed" : "Unassessed"
  }

  async function loadFromChatHistory() {
    setLoading(true)
    try {
      const history = await getChatHistory()

      // ambil log terakhir (by id terbesar)
      const latest = [...(history ?? [])].sort((a, b) => a.id - b.id).at(-1)

      const raw = latest ? extractResultTag(latest.ai_response) : null
      if (!raw) {
        setAreas([
          {
            key: "NON_TIK",
            title: "Hasil belum tersedia",
            rawArea: "",
          },
        ])
        setActiveIndex(0)
        return
      }

      const parsed = safeJsonParse(raw)
      const area_fungsi = String(parsed?.area_fungsi ?? "")
      const levelNum =
        typeof parsed?.level === "number"
          ? parsed.level
          : Number.isFinite(Number(parsed?.level))
            ? Number(parsed.level)
            : undefined

      const key = mapAreaToKey(area_fungsi)

      if (key === "NON_TIK" || !area_fungsi || !levelNum) {
        setAreas([
          {
            key: "NON_TIK",
            title: "Non TIK",
            rawArea: area_fungsi || "Non TIK",
          },
        ])
        setActiveIndex(0)
        return
      }

      const meta = RECOMMENDATIONS[key]
      const status = getAssessStatus(key)

      setAreas([
        {
          key,
          title: meta.title,
          level: levelNum,
          status,
          recommendations: meta.recommendations,
          rawArea: area_fungsi,
        },
      ])
      setActiveIndex(0)
    } catch (e) {
      console.error("Gagal load dashboard mapping:", e)
      setAreas([
        {
          key: "NON_TIK",
          title: "Gagal memuat hasil",
          rawArea: "",
        },
      ])
      setActiveIndex(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFromChatHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrev = () => setActiveIndex((i) => (i - 1 + keys.length) % keys.length)
  const handleNext = () => setActiveIndex((i) => (i + 1) % keys.length)

  const handleGoToProfile = () => router.push("/profile")
  const handleGoToAssessment = () => router.push(`/assessment?area=${active.key}`)
  const handleGoToDTS = () => window.open("https://digitalent.kominfo.go.id/", "_blank")

  const isNonTik = active.key === "NON_TIK"
  const isAssessed = active.status === "Assessed"

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
        {/* dots */}
        <div className="flex justify-center mb-3 gap-2">
          {keys.map((k, idx) => (
            <span
              key={`${k}-${idx}`}
              className={`w-2 h-2 rounded-full ${
                idx === activeIndex ? "bg-blue-600" : "bg-blue-200"
              }`}
            />
          ))}
        </div>

        <div className="relative">
          {/* arrows (disable kalau cuma 1) */}
          <button
            onClick={handlePrev}
            disabled={keys.length <= 1}
            className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow disabled:opacity-40"
            aria-label="Prev"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            disabled={keys.length <= 1}
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow disabled:opacity-40"
            aria-label="Next"
          >
            <ChevronRight />
          </button>

          <Card className="rounded-2xl shadow-md border border-blue-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!isNonTik && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {loading ? "..." : `LEVEL ${active.level ?? "-"}`}
                    </span>
                  )}

                  <h2 className="text-2xl font-bold">
                    {loading ? "Memuat..." : active.title}
                  </h2>
                </div>

                {!isNonTik && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isAssessed
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-yellow-50 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    {loading ? "..." : isAssessed ? "Assessed" : "Unassessed"}
                  </span>
                )}
              </div>

              <div className="mt-6 border-t pt-6">
                {isNonTik ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700">
                      Hasil chatbot belum dapat memetakan Anda ke area TIK.
                      {active.rawArea ? (
                        <>
                          {" "}
                          Output: <b>{active.rawArea}</b>
                        </>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-600">
                      Saran: lengkapi/unggah pelatihan atau sertifikasi di profil, lalu coba lagi.
                    </p>

                    <div className="pt-2">
                      <Button onClick={handleGoToProfile} className="rounded-full px-8">
                        Update Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2">Rekomendasi Pembelajaran</h3>

                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                      {(active.recommendations ?? []).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>

                    <p className="text-xs text-slate-500 mt-4">
                      Lakukan pembelajaran sebelum melakukan upgrade level.
                      Kamu dapat mengakses DTS untuk melihat beberapa pembelajaran yang mungkin cocok dengan profilmu.
                    </p>

                    <div className="mt-6 flex gap-4">
                      {!isAssessed ? (
                        <Button
                          onClick={handleGoToAssessment}
                          className="rounded-full px-8 flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Kerjakan Assessment
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleGoToDTS}
                            className="rounded-full px-8 flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Go to DTS
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleGoToProfile}
                            className="rounded-full px-8 flex-1 border-blue-200"
                          >
                            Upgrade Level
                          </Button>
                        </>
                      )}
                    </div>

                    {/* optional: link refresh */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={loadFromChatHistory}
                        className="text-xs text-blue-600 underline"
                      >
                        Refresh hasil dari chatbot
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isNonTik ? (
            <span>Jika sudah update profil, kembali ke chatbot untuk pemetaan ulang.</span>
          ) : (
            <span>Area sumber: {active.rawArea ?? "-"}</span>
          )}
        </div>

        {/* link balik */}
        <div className="mt-6 text-center">
          <Link href="/chatbot" className="text-sm text-blue-600 underline">
            Kembali ke Chatbot
          </Link>
        </div>
      </div>
    </div>
  )
}