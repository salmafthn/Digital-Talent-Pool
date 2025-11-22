"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import PhotoUpload from "@/components/photo-upload"
import { DataDiriSection } from "@/components/profile/data-diri-section"
import { PendidikanSection } from "@/components/profile/pendidikan-section"
import { SertifikasiSection } from "@/components/profile/sertifikasi-section"
import { PengalamanSection } from "@/components/profile/pengalaman-section"

type LockedFields = {
  nik?: boolean
  nama?: boolean
  gender?: boolean
  tanggalLahir?: boolean
}

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [locked, setLocked] = useState<LockedFields>({})
  const [activeTab, setActiveTab] = useState("data-diri")

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("profileLocked") : null
    if (raw) {
      try {
        setLocked(JSON.parse(raw))
      } catch {}
    }
  }, [])

  function handleLockFields(partial: Partial<LockedFields>) {
    const next = { ...locked, ...partial }
    setLocked(next)
    localStorage.setItem("profileLocked", JSON.stringify(next))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-blue-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <section id="foto-profil">
            <PhotoUpload />
          </section>

          <section className="bg-white rounded-2xl shadow p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">Ayo Lengkapi Profilemu!</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 w-full">
                <TabsTrigger value="data-diri">Data Diri</TabsTrigger>
                <TabsTrigger value="pendidikan">Pendidikan</TabsTrigger>
                <TabsTrigger value="sertifikasi">Sertifikasi</TabsTrigger>
                <TabsTrigger value="pengalaman">Pengalaman</TabsTrigger>
              </TabsList>

              <TabsContent value="data-diri" className="space-y-4">
                <DataDiriSection locked={locked} onLock={handleLockFields} onNext={() => setActiveTab("pendidikan")} />
              </TabsContent>

              <TabsContent value="pendidikan" className="space-y-4">
                <PendidikanSection onNext={() => setActiveTab("sertifikasi")} />
              </TabsContent>

              <TabsContent value="sertifikasi" className="space-y-4">
                <SertifikasiSection onNext={() => setActiveTab("pengalaman")} />
              </TabsContent>

              <TabsContent value="pengalaman" className="space-y-4">
                <PengalamanSection />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
