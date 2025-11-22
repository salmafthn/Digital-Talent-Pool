"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DataDiriForm = {
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
}

export function DataDiriSection({ locked, onLock, onNext }: Props) {
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
  })

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("profileDataDiri") : null
    if (raw) {
      try {
        setForm(JSON.parse(raw))
      } catch {}
    }
  }, [])

  function handleChange<K extends keyof DataDiriForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!form.nik.trim() || !form.nama.trim() || !form.gender || !form.tanggalLahir) {
      alert("NIK, Nama, Gender, dan Tanggal lahir wajib diisi.")
      return
    }
    localStorage.setItem("profileDataDiri", JSON.stringify(form))
    onLock({ nik: true, nama: true, gender: true, tanggalLahir: true })
    onNext()
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
          {locked.nik && <p className="mt-1 text-xs text-slate-500">Field ini tidak dapat diubah setelah disimpan.</p>}
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
          {locked.nama && <p className="mt-1 text-xs text-slate-500">Field ini tidak dapat diubah setelah disimpan.</p>}
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
            <p className="mt-1 text-xs text-slate-500">Field ini tidak dapat diubah setelah disimpan.</p>
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
            <p className="mt-1 text-xs text-slate-500">Field ini tidak dapat diubah setelah disimpan.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Email aktif"
          />
        </div>
        <div>
          <label className="text-sm font-medium">No. WhatsApp</label>
          <Input value={form.wa} onChange={(e) => handleChange("wa", e.target.value)} placeholder="Nomor WhatsApp" />
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

      <div className="pt-2 flex justify-end">
        <Button onClick={handleSave}>Simpan & Lanjut ke Pendidikan</Button>
      </div>
    </div>
  )
}
