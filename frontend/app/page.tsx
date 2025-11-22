import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="bg-[#E3F2FD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
                Selamat Datang di Diploy
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
                Platform terhubung untuk talenta berbakat dan perusahaan terkemuka. Temukan peluang magang, lowongan
                kerja, dan kelas mentoring terbaik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
                  >
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="rounded-full border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 font-semibold px-6 py-3"
                  >
                    Masuk
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
