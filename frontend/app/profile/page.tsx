"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import PhotoUpload from "@/components/photo-upload"
import { DataDiriSection, type DataDiriForm } from "@/components/profile/data-diri-section"
import { PendidikanSection } from "@/components/profile/pendidikan-section"
import { SertifikasiSection } from "@/components/profile/sertifikasi-section"
import { PengalamanSection } from "@/components/profile/pengalaman-section"
import { getMyProfile, type ProfileFullResponse } from "@/services/profileService"

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

  const [profile, setProfile] = useState<ProfileFullResponse | null>(null)

  const [dataDiriInitial, setDataDiriInitial] = useState<Partial<DataDiriForm> | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // 1) Guard: kalau belum ada token, paksa ke /login
  useEffect(() => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [router])

  // 2) Ambil status field yang dikunci dari localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("profileLocked")
    if (!raw) return
    try {
      setLocked(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true)
      const data = await getMyProfile()
      setProfile(data)

      // mapping ke DataDiriForm
      const mapped: Partial<DataDiriForm> = {
        nik: data.nik ?? "",
        nama: data.full_name ?? "",
        gender: data.gender ?? "",
        tanggalLahir: data.birth_date ?? "",
        email: data.email ?? "",
        wa: data.phone ?? "",
        linkedin: data.linkedin_url ?? "",
        instagram: data.instagram_username ?? "",
        portofolio: data.portfolio_url ?? "",
        alamat: data.address ?? "",
        tentang: data.bio ?? "",
        keterampilan: Array.isArray(data.skills) ? data.skills : [],
      }
      setDataDiriInitial(mapped)

      // sinkronkan navbar
      if (typeof window !== "undefined") {
        const userData = {
          name: data.full_name || "Pengguna",
          email: data.email || "",
        }
        const userJson = JSON.stringify(userData)
        localStorage.setItem("user", userJson)
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "user",
            newValue: userJson,
          }),
        )
      }
    } catch (error) {
      console.error("Gagal memuat profil dari backend", error)
      toast({
        variant: "destructive",
        title: "Gagal memuat profil",
        description: "Profil sementara masih kosong. Coba lagi nanti.",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }, [toast])

  // 3) Fetch profil dari backend
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  function handleLockFields(partial: Partial<LockedFields>) {
    const next = { ...locked, ...partial }
    setLocked(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("profileLocked", JSON.stringify(next))
    }
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
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
              Ayo Lengkapi Profilemu!
            </h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 w-full">
                <TabsTrigger value="data-diri">Data Diri</TabsTrigger>
                <TabsTrigger value="pendidikan">Pendidikan</TabsTrigger>
                <TabsTrigger value="sertifikasi">Pelatihan dan Sertifikasi</TabsTrigger>
                <TabsTrigger value="pengalaman">Pengalaman</TabsTrigger>
              </TabsList>

              <TabsContent value="data-diri" className="space-y-4">
                {isLoadingProfile && !dataDiriInitial ? (
                  <p className="text-sm text-slate-500">Memuat data profil...</p>
                ) : (
                  <DataDiriSection
                    locked={locked}
                    onLock={handleLockFields}
                    onNext={() => setActiveTab("pendidikan")}
                    initialData={dataDiriInitial || undefined}
                  />
                )}
              </TabsContent>

              <TabsContent value="pendidikan" className="space-y-4">
                <PendidikanSection
                  onNext={() => setActiveTab("sertifikasi")}
                  initialItems={profile?.educations ?? []}
                  onSaved={fetchProfile}
                />
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