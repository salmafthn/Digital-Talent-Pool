"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

// Update Interface: Tambah Status
interface CompetencyLevel {
  level_kompetensi: number;
  kecocokan: number;
  status: string; // <--- Baru (lulus / gagal / unassessed)
}

interface MappingResponse {
  success: boolean;
  message: string;
  data: Record<string, CompetencyLevel | null>;
}

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [result, setResult] = useState<{
    area: string;
    level: number;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMapping = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("http://localhost:8001/ai/mapping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) throw new Error("Gagal mengambil data mapping.");

        const json: MappingResponse = await response.json();

        if (json.data) {
          let foundArea = "Belum Terpetakan";
          let foundLevel = 0;
          let foundStatus = "unassessed";

          for (const [key, value] of Object.entries(json.data)) {
            if (value && value.level_kompetensi > 0) {
              foundArea = key.replace(/_/g, " ");
              foundLevel = value.level_kompetensi;
              foundStatus = value.status || "unassessed"; // Ambil status dari BE
              break;
            }
          }

          setResult({
            area: foundArea,
            level: foundLevel,
            status: foundStatus,
          });
        }
      } catch (err: any) {
        console.error(err);
        setError("Gagal memuat data. Pastikan sudah interview.");
      } finally {
        setLoading(false);
      }
    };

    fetchMapping();
  }, [router]);

  const handleGoToAssessment = () => {
    if (result) {
      router.push(`/assessment?area=${encodeURIComponent(result.area)}`);
    }
  };

  // --- Helper Warna Badge ---
  const getStatusBadge = (status: string) => {
    if (status === "lulus") {
      return (
        <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-bold border border-green-300">
          LULUS
        </span>
      );
    } else if (status === "gagal") {
      return (
        <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-300">
          BELUM LULUS
        </span>
      );
    } else {
      return (
        <span className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 font-bold border border-gray-300">
          UNASSESSED
        </span>
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Kompetensi
            </h1>
            <p className="text-gray-600 mt-2">
              Status assessment Anda saat ini
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50"></div>

            {error ? (
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => router.push("/interview")}>
                  Mulai Interview
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Bagian Level & Status */}
                <div className="relative">
                  <div className="h-40 w-40 rounded-full bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center border-[6px] border-blue-100 shadow-inner">
                    <span className="text-xs font-bold text-blue-500 tracking-widest mb-1">
                      LEVEL
                    </span>
                    <span className="text-6xl font-extrabold text-blue-700">
                      {result?.level}
                    </span>
                  </div>
                  {/* Badge Status Melayang di Bawah Level */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 shadow-md rounded-full">
                    {getStatusBadge(result?.status || "unassessed")}
                  </div>
                </div>

                {/* Nama Area */}
                <div className="pt-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {result?.area}
                  </h2>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                    {result?.status === "lulus"
                      ? "Selamat! Kompetensi Anda telah tervalidasi di level ini."
                      : "Selesaikan assessment untuk memvalidasi level kompetensi Anda."}
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="w-full max-w-xs">
                  {result?.status === "lulus" ? (
                    <Button
                      className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 font-bold shadow-lg"
                      disabled
                    >
                      ✅ Assessment Selesai
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGoToAssessment}
                      className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 font-bold text-lg shadow-lg shadow-blue-200"
                    >
                      {result?.status === "gagal"
                        ? "Coba Lagi"
                        : "Mulai Assessment"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
