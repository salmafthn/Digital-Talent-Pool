"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getChatHistory } from "@/services/aiService";

type AreaKey = "DSC" | "TKTI" | "PPD" | "CYBER" | "TI" | "LTI" | "NON_TIK";
// Update Type Status
type AssessStatus = "Lulus" | "Gagal" | "Unassessed";

type DashboardArea = {
  key: AreaKey;
  title: string;
  level?: number;
  status?: AssessStatus;
  recommendations?: string[];
  rawArea?: string;
};

// 🔧 Konten rekomendasi per area (TETAP SAMA)
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
};

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").replace(/[–—-]/g, "-").trim();
}

function mapAreaToKey(areaFungsi: string): AreaKey {
  const a = normalize(areaFungsi);
  if (a.includes("non tik") || a.includes("non-tik")) return "NON_TIK";
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
  ];
  for (const [needle, key] of alias) {
    if (a.includes(needle)) return key;
  }
  return "NON_TIK";
}

function extractResultTag(text: string): string | null {
  if (!text) return null;
  const matches = Array.from(text.matchAll(/<RESULT>([\s\S]*?)<\/RESULT>/g));
  if (matches.length === 0) return null;
  return matches[matches.length - 1][1]?.trim() ?? null;
}

function safeJsonParse(raw: string): any | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}
  const unescaped = raw.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  try {
    return JSON.parse(unescaped);
  } catch {}
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState<DashboardArea[]>([
    { key: "NON_TIK", title: "Memuat hasil..." },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const keys = useMemo(() => areas.map((a) => a.key), [areas]);
  const active = areas[activeIndex] ?? areas[0];

  async function loadFromChatHistory() {
    setLoading(true);
    try {
      const history = await getChatHistory();
      const latest = [...(history ?? [])].sort((a, b) => a.id - b.id).at(-1);

      const raw = latest ? extractResultTag(latest.ai_response) : null;
      if (!raw) {
        setAreas([
          { key: "NON_TIK", title: "Hasil belum tersedia", rawArea: "" },
        ]);
        setActiveIndex(0);
        return;
      }

      const parsed = safeJsonParse(raw);
      const area_fungsi = String(parsed?.area_fungsi ?? "");
      const levelNum =
        typeof parsed?.level === "number"
          ? parsed.level
          : Number.isFinite(Number(parsed?.level))
          ? Number(parsed.level)
          : undefined;

      const key = mapAreaToKey(area_fungsi);

      if (key === "NON_TIK" || !area_fungsi || !levelNum) {
        setAreas([
          {
            key: "NON_TIK",
            title: "Non TIK",
            rawArea: area_fungsi || "Non TIK",
          },
        ]);
        setActiveIndex(0);
        return;
      }

      const meta = RECOMMENDATIONS[key];

      // --- LOGIC STATUS BARU ---
      // Backend mengirim "Lulus", "Gagal", "Unassessed", atau "Assessed" (legacy)
      const rawStatus = String(parsed?.status ?? "Unassessed");

      let finalStatus: AssessStatus = "Unassessed";
      if (rawStatus.toLowerCase() === "lulus") finalStatus = "Lulus";
      else if (rawStatus.toLowerCase() === "gagal") finalStatus = "Gagal";
      else if (rawStatus.toLowerCase() === "assessed") finalStatus = "Lulus"; // Fallback jika data lama

      setAreas([
        {
          key,
          title: meta.title,
          level: levelNum,
          status: finalStatus,
          recommendations: meta.recommendations,
          rawArea: area_fungsi,
        },
      ]);
      setActiveIndex(0);
    } catch (e) {
      console.error("Gagal load dashboard mapping:", e);
      setAreas([{ key: "NON_TIK", title: "Gagal memuat hasil", rawArea: "" }]);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFromChatHistory();
  }, []);

  const handlePrev = () =>
    setActiveIndex((i) => (i - 1 + keys.length) % keys.length);
  const handleNext = () => setActiveIndex((i) => (i + 1) % keys.length);
  const handleGoToProfile = () => router.push("/profile");
  const handleGoToAssessment = () =>
    router.push(`/assessment?area=${active.key}`);
  const handleGoToDTS = () =>
    window.open("https://digitalent.kominfo.go.id/", "_blank");

  const isNonTik = active.key === "NON_TIK";
  const isPassed = active.status === "Lulus";
  const isFailed = active.status === "Gagal";

  // Helper Warna Badge
  const getBadgeColor = (status?: AssessStatus) => {
    if (status === "Lulus")
      return "bg-green-50 text-green-700 border border-green-200";
    if (status === "Gagal")
      return "bg-red-50 text-red-700 border border-red-200";
    return "bg-yellow-50 text-yellow-800 border border-yellow-200";
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl">
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
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgeColor(
                      active.status
                    )}`}
                  >
                    {loading ? "..." : active.status}
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
                    <div className="pt-2">
                      <Button
                        onClick={handleGoToProfile}
                        className="rounded-full px-8"
                      >
                        Update Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2">
                      Rekomendasi Pembelajaran
                    </h3>
                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                      {(active.recommendations ?? []).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>

                    <div className="mt-6 flex gap-4">
                      {/* Tombol berubah tergantung status Lulus/Gagal */}
                      {isPassed ? (
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
                      ) : (
                        <Button
                          onClick={handleGoToAssessment}
                          className="rounded-full px-8 flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {isFailed
                            ? "Coba Lagi Assessment"
                            : "Kerjakan Assessment"}
                        </Button>
                      )}
                    </div>

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
          {isNonTik
            ? "Jika sudah update profil, kembali ke chatbot."
            : `Area sumber: ${active.rawArea ?? "-"}`}
        </div>
        <div className="mt-6 text-center">
          <Link href="/chatbot" className="text-sm text-blue-600 underline">
            Kembali ke Chatbot
          </Link>
        </div>
      </div>
    </div>
  );
}
