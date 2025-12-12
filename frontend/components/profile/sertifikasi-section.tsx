"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  addCertification,
  deleteCertification,
  getMyProfile,
  type CertificationResponse,
} from "@/services/profileService"

type SertifikasiItem = {
  // kalau sudah tersimpan di BE, ada id
  id?: number

  namaProgram: string
  penyelenggara: string
  tahun: string
  keterangan: string
  bidangKeahlian: string

  // upload file untuk draft
  file: File | null

  // link file dari BE (kalau sudah tersimpan)
  proof_url?: string | null
}

interface Props {
  onNext: () => void
}

const MAX_ITEMS = 3

const BIDANG_KEAHLIAN_OPTIONS: string[] = [
  "Hardware & Digital Peripherals",
  "Operation & System Tools",
  "IT Governance & Management",
  "IT Services Management System",
  "IT & Computing Facilities Management",
  "IT Mobility And Internet Of Things",
  "Integration Application System",
  "Akses",
  "Wireless",
  "Wireline",
  "Fiber Optic",
  "Package Switch",
  "CircuIT Switch",
  "IMS & VAS",
  "Ground Segment Satellite",
  "Space Segment Satellite",
  "Animasi",
  "Fotografi",
  "Kehumasan",
  "Multimedia",
  "Penerbitan",
  "Penyiaran Radio",
  "Penyiaran TV",
  "Perposan",
  "General Services",
  "Legal",
  "Procurement",
  "Tenaga Pendidik",
  "Tenaga Kesehatan",
  "Marketing",
  "Customer Support",
  "Finance",
  "Konsultan",
  "Trainer",
  "Translator",
  "Auditor",
  "Accounting",
  "Teknisi",
  "Support",
  "Copywriter",
  "Content Creator",
  "Manager",
  "Other",
  "Programing & Software Development",
  "Network & Infrastructure",
  "Data Management System",
  "IT Consultancy & Advisory",
  "Desain Komunikasi Visual",
  "IT Security & Compliance",
  "Administrasi",
  "Sales",
  "Information System & Technology Development",
  "IT Enterprise Architecture",
  "Engineering",
  "IT Multimedia",
  "Periklanan",
  "IT Project Management",
]

function emptyItem(): SertifikasiItem {
  return {
    namaProgram: "",
    penyelenggara: "",
    tahun: "",
    keterangan: "",
    bidangKeahlian: "",
    file: null,
    proof_url: null,
  }
}

function mapApiToUi(list: CertificationResponse[]): SertifikasiItem[] {
  const mapped = (Array.isArray(list) ? list : []).slice(0, MAX_ITEMS).map((c) => ({
    id: c.id,
    namaProgram: c.name ?? "",
    penyelenggara: c.organizer ?? "",
    tahun: String(c.year ?? ""),
    keterangan: c.description ?? "",
    bidangKeahlian: (c.bidang_keahlian ?? "") as string,
    file: null,
    proof_url: c.proof_url ?? null,
  }))

  // selalu sisakan 1 draft kosong di bawah (biar user bisa nambah)
  return mapped.length > 0 ? [...mapped, emptyItem()] : [emptyItem()]
}

export function SertifikasiSection({ onNext }: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState<SertifikasiItem[]>([emptyItem()])
  const [saving, setSaving] = useState(false)

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear()
    const years: number[] = []
    for (let y = now + 5; y >= now - 5; y--) years.push(y)
    return years
  }, [])

  async function loadFromBE() {
    const profile = await getMyProfile()
    setItems(mapApiToUi(profile.certifications ?? []))
  }

  // ✅ load dari backend saat tab dibuka / refresh
  useEffect(() => {
    loadFromBE().catch((err) => {
      console.error("Gagal load sertifikasi:", err)
      setItems([emptyItem()])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateItem<K extends keyof SertifikasiItem>(index: number, key: K, value: SertifikasiItem[K]) {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  function addItem() {
    setItems((prev) => {
      // hitung item yang “editable” (draft + saved)
      if (prev.length >= MAX_ITEMS + 1) return prev // +1 karena ada draft kosong
      return [...prev, emptyItem()]
    })
  }

  async function handleDelete(index: number) {
    const item = items[index]
    try {
      // kalau sudah ada id -> delete ke BE
      if (item.id) {
        await deleteCertification(item.id)
        toast({ title: "Sertifikasi dihapus" })
        await loadFromBE()
        return
      }

      // kalau draft -> hapus lokal saja
      setItems((prev) => {
        const next = prev.filter((_, i) => i !== index)
        return next.length > 0 ? next : [emptyItem()]
      })
    } catch (err: any) {
      console.error("Gagal hapus sertifikasi:", err)
      toast({
        variant: "destructive",
        title: "Gagal menghapus",
        description: err?.response?.data?.message ?? "Coba lagi ya.",
      })
    }
  }

  async function handleSave() {
    try {
      setSaving(true)

      // ambil draft yang benar-benar diisi
      const drafts = items.filter(
        (it) =>
          !it.id &&
          (it.namaProgram.trim() ||
            it.penyelenggara.trim() ||
            it.tahun ||
            it.keterangan.trim() ||
            it.bidangKeahlian ||
            it.file),
      )

      if (drafts.length === 0) {
        onNext()
        return
      }

      for (const it of drafts) {
        if (!it.namaProgram.trim() || !it.penyelenggara.trim() || !it.tahun || !it.keterangan.trim()) {
          toast({
            variant: "destructive",
            title: "Form belum lengkap",
            description: "Nama Program, Penyelenggara, Tahun, dan Keterangan wajib diisi.",
          })
          return
        }
        if (!it.bidangKeahlian) {
          toast({
            variant: "destructive",
            title: "Bidang keahlian wajib diisi",
            description: "Pilih bidang keahlian terlebih dahulu.",
          })
          return
        }
        if (!it.file) {
          toast({
            variant: "destructive",
            title: "Bukti belum diupload",
            description: "Upload bukti sertifikasi (JPG/PNG/PDF).",
          })
          return
        }
      }

      // submit satu-satu
      for (const it of drafts) {
        await addCertification({
          name: it.namaProgram.trim(),
          organizer: it.penyelenggara.trim(),
          year: Number(it.tahun),
          description: it.keterangan.trim(),
          file: it.file!,
          bidang_keahlian: it.bidangKeahlian, // kirim kalau BE butuh
        })
      }

      toast({
        title: "Sertifikasi tersimpan",
        description: "Data pelatihan/sertifikasi berhasil disimpan.",
      })

      // reload dari backend biar tampil persist
      await loadFromBE()

      onNext()
    } catch (err: any) {
      console.error("Gagal simpan sertifikasi:", err)

      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Terjadi kesalahan saat menyimpan sertifikasi."

      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: typeof detail === "string" ? detail : "Coba lagi ya.",
      })
    } finally {
      setSaving(false)
    }
  }

  const canAddMore = items.length < MAX_ITEMS + 1

  return (
    <div className="space-y-6">
      {items.map((item, idx) => {
        const isSaved = Boolean(item.id)

        return (
          <div key={`${item.id ?? "draft"}-${idx}`} className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Nama Program</label>
                <Input
                  value={item.namaProgram}
                  onChange={(e) => updateItem(idx, "namaProgram", e.target.value)}
                  placeholder="Nama program/sertifikasi"
                  disabled={isSaved}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Penyelenggara</label>
                <Input
                  value={item.penyelenggara}
                  onChange={(e) => updateItem(idx, "penyelenggara", e.target.value)}
                  placeholder="Lembaga penyelenggara"
                  disabled={isSaved}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Tahun</label>
                <select
                  value={item.tahun}
                  onChange={(e) => updateItem(idx, "tahun", e.target.value)}
                  disabled={isSaved}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih tahun</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Bukti (Upload File)</label>

                {isSaved ? (
                  <div className="mt-2 text-sm">
                    {item.proof_url ? (
                      <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        Lihat file bukti
                      </a>
                    ) : (
                      <span className="text-slate-500">Tidak ada file.</span>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      className="mt-2 block w-full text-sm"
                      onChange={(e) => updateItem(idx, "file", e.target.files?.[0] ?? null)}
                    />
                    {item.file && (
                      <p className="mt-1 text-xs text-slate-500">File dipilih: {item.file.name}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bidang Keahlian</label>
              <select
                value={item.bidangKeahlian}
                onChange={(e) => updateItem(idx, "bidangKeahlian", e.target.value)}
                disabled={isSaved}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih bidang keahlian</option>
                {BIDANG_KEAHLIAN_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Keterangan</label>
              <p className="mt-1 text-xs text-slate-500">
                Tuliskan ringkasan kegiatan, materi yang dipelajari, dan peran Anda selama program.
              </p>
              <Textarea
                className="mt-2"
                value={item.keterangan}
                onChange={(e) => updateItem(idx, "keterangan", e.target.value)}
                placeholder="Tuliskan ringkasan kegiatan, materi yang dipelajari, dan peran Anda selama program."
                rows={3}
                disabled={isSaved}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" type="button" onClick={() => handleDelete(idx)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )
      })}

      <div className="flex gap-3 items-center">
        {canAddMore ? (
          <Button variant="outline" type="button" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Sertifikasi
          </Button>
        ) : (
          <p className="text-xs text-slate-500">Maksimal {MAX_ITEMS} sertifikasi.</p>
        )}

        <Button className="ml-auto" type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan & Lanjut ke Pengalaman"}
        </Button>
      </div>
    </div>
  )
}