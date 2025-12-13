"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAssessmentStore } from "@/lib/store";

// Definisi Tipe Data dari Backend
interface BackendQuestion {
  nomor_soal: number;
  soal: string;
  opsi_jawaban: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}

// Definisi Tipe Data untuk Frontend (Format Lama)
interface FrontendQuestion {
  id: number;
  question: string;
  options: string[];
}

export default function AssessmentPage() {
  const router = useRouter();
  // Ambil activeArea dari Store (misal: "Sains Data...")
  const { activeArea, completeAssessment } = useAssessmentStore();

  const [questions, setQuestions] = useState<FrontendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. FETCH QUESTIONS DARI BACKEND ---
  useEffect(() => {
    const fetchQuestions = async () => {
      // Cek apakah user punya token (Login dulu!)
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Cek apakah area sudah dipilih
      if (!activeArea) {
        setError("Silakan pilih area assessment terlebih dahulu di dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Hit ke Backend DTP (Gunakan Port 8001 sesuai setup terakhir)
        const response = await fetch("http://localhost:8001/ai/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Backend butuh ini
          },
          body: JSON.stringify({
            area_fungsi: activeArea, // Dikirim dinamis sesuai pilihan user
            level_kompetensi: 1, // Default level 1 dulu
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Gagal mengambil soal");
        }

        const data = await response.json();

        // Mapping Data: Backend Format -> Frontend Format
        // Backend return: { success: true, data: { kumpulan_soal: [...] } }
        if (data.data && data.data.kumpulan_soal) {
          const mappedQuestions = data.data.kumpulan_soal.map(
            (q: BackendQuestion) => ({
              id: q.nomor_soal,
              question: q.soal,
              options: [
                q.opsi_jawaban.a,
                q.opsi_jawaban.b,
                q.opsi_jawaban.c,
                q.opsi_jawaban.d,
              ],
            })
          );
          setQuestions(mappedQuestions);
        } else {
          throw new Error("Format respon backend tidak sesuai");
        }
      } catch (err: any) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Terjadi kesalahan sistem (Cek koneksi AI)");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [activeArea, router]);

  // --- LOGIC BAWAAN (TIDAK BERUBAH BANYAK) ---
  const handleAnswerChange = (answer: string) => {
    if (!questions[currentQuestion]) return;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }));
  };

  const handleNavigateQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion(currentQuestion + 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // TODO: Kirim jawaban ke Backend di sini (POST /ai/assessment/submit)
    // Untuk sekarang kita simpan state lokal saja
    completeAssessment(activeArea);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  // --- RENDER LOADING STATE ---
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">
          Sedang meminta AI membuatkan soal...
        </p>
      </div>
    );
  }

  // --- RENDER ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Jika error server/AI, coba kembali nanti.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Jika soal kosong
  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-blue-50">
        <p>Tidak ada soal yang tersedia.</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Assessment: {activeArea}
            </h1>

            {/* Navigasi Nomor Soal */}
            <div className="mb-6 sm:mb-8 pb-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max sm:flex-wrap">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleNavigateQuestion(idx)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                      currentQuestion === idx
                        ? "bg-blue-600 text-white"
                        : answers[q.id]
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Konten Soal */}
            <div className="mb-8 pb-8 border-b">
              <p className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
                {question.question}
              </p>

              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={handleAnswerChange}
              >
                <div className="space-y-3 sm:space-y-4">
                  {question.options.map((option: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <RadioGroupItem
                        value={option}
                        id={`option-${idx}`}
                        className="mt-1"
                      />
                      <label
                        htmlFor={`option-${idx}`}
                        className="text-sm sm:text-base text-gray-700 cursor-pointer leading-relaxed"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Tombol Navigasi Bawah */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="w-full sm:w-auto px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Sebelumnya
              </button>

              <span className="text-sm text-gray-600">
                Pertanyaan {currentQuestion + 1} dari {questions.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className="w-full sm:w-auto px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>

            {/* Submit button */}
            <div className="text-center border-t pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 sm:px-12 py-3 rounded-full"
              >
                {isSubmitting ? "Mengirim..." : "KUMPULKAN"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
