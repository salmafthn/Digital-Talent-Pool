"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAssessmentStore } from "@/lib/store"

const questions = [
  {
    id: 1,
    question: "Apa itu Big Data?",
    options: [
      "Data yang berukuran sangat besar dan kompleks",
      "Data yang disimpan di cloud",
      "Data yang dienkripsi",
      "Data yang real-time",
    ],
  },
  {
    id: 2,
    question: "Bahasa pemrograman mana yang paling populer untuk machine learning?",
    options: ["Python", "Java", "C++", "JavaScript"],
  },
  {
    id: 3,
    question: "TensorFlow adalah library untuk apa?",
    options: ["Web development", "Machine learning", "Database management", "Mobile development"],
  },
  {
    id: 4,
    question: "Apa itu API?",
    options: [
      "Application Programming Interface",
      "Automated Process Integration",
      "Advanced Python Interface",
      "Application Process Integration",
    ],
  },
  {
    id: 5,
    question: "Apa fungsi utama dari supervised learning?",
    options: [
      "Memprediksi output berdasarkan input yang telah berlabel",
      "Menemukan pola tersembunyi dalam data",
      "Mengklasifikasikan data tanpa label",
      "Mengurangi dimensi data",
    ],
  },
  {
    id: 6,
    question: "Mana yang bukan bagian dari data science pipeline?",
    options: ["Data collection", "Data cleaning", "Model training", "Content writing"],
  },
  {
    id: 7,
    question: "Apa singkatan dari REST?",
    options: [
      "Representational State Transfer",
      "Remote Execution Service Technology",
      "Real-time Event Streaming Tool",
      "Resource Exchange Security Token",
    ],
  },
  {
    id: 8,
    question: "Database mana yang termasuk NoSQL?",
    options: ["MongoDB", "PostgreSQL", "MySQL", "Oracle"],
  },
  {
    id: 9,
    question: "Apa itu cloud computing?",
    options: [
      "Penyediaan resource komputasi melalui internet",
      "Penyimpanan file di laptop lokal",
      "Jaringan komputer fisik di gedung",
      "Software yang diinstal offline",
    ],
  },
  {
    id: 10,
    question: "Mana yang merupakan framework frontend?",
    options: ["React", "Django", "Flask", "Spring"],
  },
  {
    id: 11,
    question: "Apa kepanjangan dari CI/CD?",
    options: [
      "Continuous Integration / Continuous Deployment",
      "Code Integration / Code Development",
      "Continuous Input / Continuous Data",
      "Cloud Integration / Cloud Deployment",
    ],
  },
  {
    id: 12,
    question: "Docker digunakan untuk apa?",
    options: ["Containerization aplikasi", "Version control", "Database management", "Project planning"],
  },
  {
    id: 13,
    question: "Mana yang merupakan database relasional?",
    options: ["MySQL", "Redis", "Elasticsearch", "Cassandra"],
  },
  {
    id: 14,
    question: "Apa itu microservices?",
    options: [
      "Arsitektur aplikasi berbasis service kecil independen",
      "Database berukuran kecil",
      "Service gratis dari cloud provider",
      "Versi terbaru dari software",
    ],
  },
  {
    id: 15,
    question: "Framework mana untuk backend dengan Python?",
    options: ["Django", "Vue", "Angular", "Svelte"],
  },
  {
    id: 16,
    question: "Apa fungsi utama dari Git?",
    options: ["Version control dan collaboration", "Database management", "Project scheduling", "Email communication"],
  },
  {
    id: 17,
    question: "Mana yang termasuk cloud provider?",
    options: ["AWS", "Mozilla Firefox", "Visual Studio", "Photoshop"],
  },
  {
    id: 18,
    question: "Apa itu API REST?",
    options: [
      "Web service yang menggunakan HTTP methods",
      "Database untuk menyimpan file",
      "Framework untuk membuat website",
      "Tools untuk debugging",
    ],
  },
  {
    id: 19,
    question: "Bahasa query mana untuk database relasional?",
    options: ["SQL", "Python", "JavaScript", "Go"],
  },
  {
    id: 20,
    question: "Apa keuntungan menggunakan cloud computing?",
    options: [
      "Skalabilitas, fleksibilitas, dan cost efficiency",
      "Lebih mahal dari server lokal",
      "Lebih lambat dari komputer desktop",
      "Hanya untuk perusahaan besar",
    ],
  },
]

export default function AssessmentPage() {
  const router = useRouter()
  const { activeArea, completeAssessment } = useAssessmentStore()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }))
  }

  const handleNavigateQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    completeAssessment(activeArea)
    setTimeout(() => {
      router.push("/dashboard")
    }, 500)
  }

  const question = questions[currentQuestion]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Selesaikan Assessment</h1>

            <div className="mb-6 sm:mb-8 pb-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max sm:flex-wrap">
                {questions.map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handleNavigateQuestion(idx)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                      currentQuestion === idx
                        ? "bg-blue-600 text-white"
                        : answers[questions[idx].id]
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 pb-8 border-b">
              <p className="text-base sm:text-lg font-semibold text-gray-900 mb-6">{question.question}</p>

              <RadioGroup value={answers[question.id] || ""} onValueChange={handleAnswerChange}>
                <div className="space-y-3 sm:space-y-4">
                  {question.options.map((option: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <RadioGroupItem value={option} id={`option-${idx}`} className="mt-1" />
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
  )
}
