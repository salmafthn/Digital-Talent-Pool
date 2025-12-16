"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAssessmentStore } from "@/lib/store";

 
interface BackendQuestion {
  nomor_soal: number;
  soal: string;
  opsi_jawaban: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  jawaban_benar: string;
}
 
interface FrontendQuestion {
  id: number;
  question: string;
  options: string[];
  raw_options: { a: string; b: string; c: string; d: string };
  correct_key: string;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { activeArea, completeAssessment } = useAssessmentStore();

  const [questions, setQuestions] = useState<FrontendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- TAMBAHAN: Ref untuk mencegah double fetch ---
  const hasFetched = useRef(false);
  // --- 1. FETCH QUESTIONS DENGAN AUTO-RETRY ---
  useEffect(() => {
    // Fungsi Fetch yang bisa dipanggil ulang
    const fetchQuestions = async (retryCount = 0) => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (!activeArea) {
        setError("Silakan pilih area assessment terlebih dahulu di dashboard.");
        setLoading(false);
        return;
      }

      // Mapping Area (Pastikan ini ada)
      const AREA_MAPPING_FE: Record<string, string> = {
        DSC: "Data Science",
        TKTI: "IT Governance",
        PPD: "Digital Product Management",
        CYBER: "Cyber Security",
        TI: "Teknologi Infrastruktur",
        LTI: "Layanan TI",
      };
      const areaToSend = AREA_MAPPING_FE[activeArea] || activeArea;

      try {
        setLoading(true);
        console.log(`🚀 Percobaan ke-${retryCount + 1}. Mengirim:`, areaToSend);

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"
          }/ai/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              area_fungsi: areaToSend,
              level_kompetensi: 1,
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          // Jika errornya dari AI (NoneType), kita anggap "Bad Luck" dan coba lagi
          throw new Error(errData.detail || "Gagal mengambil soal");
        }

        const data = await response.json();

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
              raw_options: q.opsi_jawaban,
              correct_key: q.jawaban_benar,
            })
          );
          setQuestions(mappedQuestions);
          setLoading(false); // Sukses! Stop loading.
        } else {
          throw new Error("Format respon backend tidak sesuai");
        }
      } catch (err: any) {
        console.error(`Gagal percobaan ke-${retryCount + 1}:`, err);

        // --- LOGIC AUTO RETRY ---
        // Jika gagal dan belum mencoba 3 kali, coba lagi!
        if (retryCount < 2) {
          // Maksimal 3x percobaan (0, 1, 2)
          console.log("♻️ Mencoba request ulang ke AI...");
          setTimeout(() => {
            fetchQuestions(retryCount + 1); // Panggil diri sendiri (Rekursif)
          }, 1000); // Tunggu 1 detik sebelum coba lagi
        } else {
          // Jika sudah 3x tetap gagal, baru tampilkan error ke user
          setError(
            "AI sedang sibuk atau tidak stabil. Silakan refresh halaman."
          );
          setLoading(false);
        }
      }
    };

    // Jalankan fungsi pertama kali
    fetchQuestions();
  }, [activeArea, router]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      // Susun Payload sesuai Schema Backend
      const payload = {
        area_fungsi: activeArea,
        jawaban: questions.map((q) => ({
          nomor_soal: q.id,
          soal: q.question,
          opsi_jawaban: q.raw_options,
          jawaban_user: answers[q.id] || "",
          kunci_jawaban: q.correct_key,
        })),
      };

      const response = await fetch(
        "http://localhost:8001/ai/assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengirim jawaban.");
      }

      // const result = await response.json(); // Data hasil tetap diterima tapi tidak dipakai untuk alert

      // HANYA TAMPILKAN PESAN SUKSES (Tanpa Skor)
      alert(
        "Assessment Selesai! Terima kasih telah mengerjakan. Silakan cek status kelulusan di Dashboard."
      );

      completeAssessment(activeArea);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan jawaban. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
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
