"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown, X } from "lucide-react"
import { updateMyProfile } from "@/services/profileService"
import { useToast } from "@/hooks/use-toast"

export type DataDiriForm = {
  nik: string
  nama: string
  gender: string
  tanggalLahir: string
  email: string
  wa: string
  linkedin: string
  instagram: string
  portofolio: string
  alamat: string
  tentang: string
  keterampilan: string[]
}

type LockedFields = {
  nik?: boolean
  nama?: boolean
  gender?: boolean
  tanggalLahir?: boolean
}

interface Props {
  locked: LockedFields
  onLock: (fields: Partial<LockedFields>) => void
  onNext: () => void
  /** data awal yang datang dari backend (/profile/) */
  initialData?: Partial<DataDiriForm>
}

// daftar skill dari kamu
const SKILL_OPTIONS: string[] = [
  "software development",
  "requirements analysis",
  "software optimization",
  "usability",
  "performance tuning",
  "maintainability",
  "backend development",
  "system design",
  "scalability",
  "collaboration",
  "teamwork",
  "security",
  "reliability",
  "clean code",
  "code efficiency",
  "code review",
  "best practices",
  "error handling",
  "monitoring",
  "continuous learning",
  "backend design",
  "quality assurance",
  "problem solving",
  "service maintenance",
  "service optimization",
  "java programming",
  "object oriented programming",
  "communication",
  "english proficiency",
  "sql",
  "api development",
  "microservices architecture",
  "service oriented architecture",
]

export function DataDiriSection({ locked, onLock, onNext, initialData }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState<DataDiriForm>({
    nik: "",
    nama: "",
    gender: "",
    tanggalLahir: "",
    email: "",
    wa: "",
    linkedin: "",
    instagram: "",
    portofolio: "",
    alamat: "",
    tentang: "",
    keterampilan: [],
  })

  const [skillsOpen, setSkillsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // ⬇️ Isi awal form dari props `initialData` (BUKAN dari localStorage lagi)
  useEffect(() => {
    if (!initialData) return

    setForm((prev) => ({
      ...prev,
      ...initialData,
      keterampilan: Array.isArray(initialData.keterampilan)
        ? initialData.keterampilan
        : prev.keterampilan,
    }))
  }, [initialData])

  function handleChange<K extends keyof DataDiriForm>(
    key: K,
    value: DataDiriForm[K] extends string[] ? never : string,
  ) {
    setForm((prev) => ({ ...prev, [key]: value as string }))
  }

  function toggleSkill(skill: string) {
    setForm((prev) => {
      const exists = prev.keterampilan.includes(skill)
      const keterampilan = exists
        ? prev.keterampilan.filter((s) => s !== skill)
        : [...prev.keterampilan, skill]
      return { ...prev, keterampilan }
    })
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({
      ...prev,
      keterampilan: prev.keterampilan.filter((s) => s !== skill),
    }))
  }

  // 🔥 Simpan ke BACKEND (PUT /profile/)
  async function handleSave() {
    if (!form.nik.trim() || !form.nama.trim() || !form.gender || !form.tanggalLahir) {
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: "NIK, Nama, Gender, dan Tanggal lahir wajib diisi.",
      })
      return
    }

    try {
      setSaving(true)

      // ⚠️ SESUAIKAN field ini dengan schema ProfileUpdate di backend
      await updateMyProfile({
        phone: form.wa,
        linkedin_url: form.linkedin,
        instagram_username: form.instagram,
        portfolio_url: form.portofolio,
        address: form.alamat,
        bio: form.tentang,
        skills: form.keterampilan,
      })


      toast({
        title: "Profil tersimpan",
        description: "Data diri kamu berhasil diperbarui.",
      })

      // Kunci field identitas utama
      onLock({ nik: true, nama: true, gender: true, tanggalLahir: true })

      // Lanjut ke tab Pendidikan
      onNext()
    } catch (err: any) {
      console.error("Gagal update profil:", err)
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Terjadi kesalahan saat menyimpan profil."

      toast({
        variant: "destructive",
        title: "Gagal menyimpan profil",
        description: typeof detail === "string" ? detail : "Silakan coba lagi beberapa saat lagi.",
      })
    } finally {
      setSaving(false)
    }
  }

  const readOnlyCls = "bg-slate-100 cursor-not-allowed"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            NIK<span className="text-red-500">*</span>
          </label>
          <Input
            value={form.nik}
            onChange={(e) => handleChange("nik", e.target.value)}
            disabled={locked.nik}
            className={cn(locked.nik && readOnlyCls)}
            placeholder="Nomor Induk Kependudukan"
          />
          {locked.nik && (
            <p className="mt-1 text-xs text-slate-500">
              Field ini tidak dapat diubah setelah disimpan.
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Nama Lengkap<span className="text-red-500">*</span>
          </label>
          <Input
            value={form.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
            disabled={locked.nama}
            className={cn(locked.nama && readOnlyCls)}
            placeholder="Masukkan nama lengkap"
          />
          {locked.nama && (
            <p className="mt-1 text-xs text-slate-500">
              Field ini tidak dapat diubah setelah disimpan.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">
            Gender<span className="text-red-500">*</span>
          </label>
          <select
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            disabled={locked.gender}
            className={cn(
              "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
              locked.gender && readOnlyCls,
            )}
          >
            <option value="">Pilih gender</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          {locked.gender && (
            <p className="mt-1 text-xs text-slate-500">
              Field ini tidak dapat diubah setelah disimpan.
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">
            Tanggal lahir<span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.tanggalLahir}
            onChange={(e) => handleChange("tanggalLahir", e.target.value)}
            disabled={locked.tanggalLahir}
            className={cn(locked.tanggalLahir && readOnlyCls)}
          />
          {locked.tanggalLahir && (
            <p className="mt-1 text-xs text-slate-500">
              Field ini tidak dapat diubah setelah disimpan.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Email</label><span className="text-red-500">*</span>
          <Input
            type="email"
            value={form.email}
            // Hapus onChange atau biarkan (tidak akan ngefek karena disabled)
            disabled // <-- INI YANG BIKIN TIDAK BISA DIEDIT
            className="bg-slate-100 cursor-not-allowed"
            placeholder="Email aktif"
          />
          {/* Opsional: Tambahkan keterangan kecil di bawahnya */}
          <p className="mt-1 text-xs text-slate-500">
            Email terdaftar tidak dapat diubah.
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">No. WhatsApp</label>
          <Input
            value={form.wa}
            onChange={(e) => handleChange("wa", e.target.value)}
            placeholder="Nomor WhatsApp"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">LinkedIn</label>
          <Input
            value={form.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            placeholder="URL profil"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Instagram</label>
          <Input
            value={form.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder="@username"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Link Portofolio</label>
          <Input
            value={form.portofolio}
            onChange={(e) => handleChange("portofolio", e.target.value)}
            placeholder="URL portofolio"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Alamat</label>
        <Textarea
          value={form.alamat}
          onChange={(e) => handleChange("alamat", e.target.value)}
          placeholder="Alamat domisili"
          rows={2}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Tentang Saya</label>
        <Textarea
          value={form.tentang}
          onChange={(e) => handleChange("tentang", e.target.value)}
          placeholder="Ceritakan secara singkat tentang diri Anda"
          rows={4}
        />
      </div>

      {/* Keterampilan */}
      <div className="relative">
        <label className="text-sm font-medium">Keterampilan</label>
        <p className="mt-1 text-xs text-slate-500">
          Pilih beberapa keterampilan yang paling menggambarkan profilmu.
        </p>

        <div
          className="mt-2 min-h-[44px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm flex items-center gap-2 flex-wrap cursor-pointer"
          onClick={() => setSkillsOpen((o) => !o)}
        >
          {form.keterampilan.length === 0 && (
            <span className="text-xs text-slate-400">
              Pilih keterampilan dari daftar
            </span>
          )}

          {form.keterampilan.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-800"
            >
              {skill}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeSkill(skill)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          <span className="ml-auto">
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </span>
        </div>

        {skillsOpen && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow-lg">
            {SKILL_OPTIONS.map((skill) => {
              const selected = form.keterampilan.includes(skill)
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs hover:bg-slate-50",
                    selected && "bg-blue-50 text-blue-700 font-medium",
                  )}
                >
                  {skill}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan & Lanjut ke Pendidikan"}
        </Button>
      </div>
    </div>
  )
}