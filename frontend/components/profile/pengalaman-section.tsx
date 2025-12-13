"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  addExperience,
  deleteExperience,
  getMyProfile,
  type ExperienceResponse,
  type JobType,
  type FunctionalArea,
} from "@/services/profileService"

type JenisUi = JobType | "Tidak/belum bekerja" | ""

type PengalamanItem = {
  uiId: string
  backendId?: number

  jenis: JenisUi
  jabatan: string
  namaPerusahaan: string
  tanggalMulai: string // YYYY-MM-DD
  tanggalSelesai: string // YYYY-MM-DD
  bidangPekerjaan: FunctionalArea | "" | "-"
  deskripsi: string
  masihBerlangsung: boolean
}

function emptyItem(): PengalamanItem {
  return {
    uiId: Date.now().toString(),
    jenis: "",
    jabatan: "",
    namaPerusahaan: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    bidangPekerjaan: "",
    deskripsi: "",
    masihBerlangsung: false,
  }
}

const FUNCTIONAL_AREA_OPTIONS: { label: string; value: FunctionalArea }[] = [
  {
    label: "Tata Kelola TI (IT Governance)",
    value: "Tata Kelola Teknologi Informasi (IT Governance)",
  },
  {
    label: "Pengembangan Produk Digital",
    value: "Pengembangan Produk Digital (Digital Product Development)",
  },
  {
    label: "Sains Data - AI",
    value: "Sains Data-Kecerdasan Artifisial (Data Science-AI)",
  },
  {
    label: "Keamanan Informasi dan Siber",
    value: "Keamanan Informasi dan Siber",
  },
  {
    label: "Teknologi dan Infrastruktur",
    value: "Teknologi dan Infrastruktur",
  },
  {
    label: "Layanan Teknologi Informasi",
    value: "Layanan Teknologi Informasi",
  },
]

function mapApiToUi(list: ExperienceResponse[]): PengalamanItem[] {
  if (!Array.isArray(list) || list.length === 0) return [emptyItem()]

  const mapped = list.map((e) => ({
    uiId: `saved-${e.id}`,
    backendId: e.id,

    jenis: e.job_type as JobType,
    jabatan: e.position ?? "",
    namaPerusahaan: e.company_name ?? "",
    tanggalMulai: e.start_date ?? "",
    tanggalSelesai: e.end_date ?? "",
    bidangPekerjaan: (e.functional_area ?? "") as any,
    deskripsi: e.description ?? "",
    masihBerlangsung: Boolean(e.is_current),
  }))

  // tambahin 1 draft kosong biar bisa tambah lagi
  return [...mapped, emptyItem()]
}

export function PengalamanSection() {
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<PengalamanItem[]>([emptyItem()])
  const [agree, setAgree] = useState(false)
  const [saving, setSaving] = useState(false)

  async function refetchFromBE() {
    const profile = await getMyProfile()
    setItems(mapApiToUi(profile.experiences ?? []))
  }

  // ✅ saat tab dibuka: hydrate dari BE
  useEffect(() => {
    refetchFromBE().catch((err) => {
      console.error("Gagal fetch pengalaman:", err)
      // fallback: tetap tampilkan minimal 1 form kosong
      setItems((prev) => (prev.length > 0 ? prev : [emptyItem()]))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function updateItem<K extends keyof PengalamanItem>(
    uiId: string,
    key: K,
    value: PengalamanItem[K],
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.uiId !== uiId) return item

        let updated: PengalamanItem = { ...item, [key]: value }

        // aturan khusus kalau jenis berubah
        if (key === "jenis") {
          if (value === "Tidak/belum bekerja") {
            updated = {
              ...updated,
              jabatan: "-",
              namaPerusahaan: "-",
              tanggalMulai: "-",
              tanggalSelesai: "-",
              bidangPekerjaan: "-",
              deskripsi: "-",
              masihBerlangsung: false,
            }
          } else if (item.jenis === "Tidak/belum bekerja") {
            updated = {
              ...updated,
              jabatan: "",
              namaPerusahaan: "",
              tanggalMulai: "",
              tanggalSelesai: "",
              bidangPekerjaan: "",
              deskripsi: "",
              masihBerlangsung: false,
            }
          }
        }

        return updated
      }),
    )
  }

  async function handleDelete(item: PengalamanItem) {
    try {
      // kalau sudah tersimpan di BE
      if (item.backendId) {
        await deleteExperience(item.backendId)
        toast({ title: "Pengalaman dihapus" })
        await refetchFromBE()
        return
      }

      // draft doang
      setItems((prev) => {
        const next = prev.filter((x) => x.uiId !== item.uiId)
        return next.length > 0 ? next : [emptyItem()]
      })
    } catch (err: any) {
      console.error("Gagal hapus pengalaman:", err)
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Gagal menghapus pengalaman."
      toast({
        variant: "destructive",
        title: "Gagal",
        description: typeof detail === "string" ? detail : "Coba lagi ya.",
      })
    }
  }

  async function syncDraftsToBE() {
    // ambil draft yang belum ada backendId, dan bukan "Tidak/belum bekerja"
    const drafts = items.filter(
      (it) => !it.backendId && it.jenis && it.jenis !== "Tidak/belum bekerja",
    )

    // kalau user belum isi apa-apa, gak usah submit
    const filledDrafts = drafts.filter(
      (it) =>
        it.jenis ||
        it.jabatan.trim() ||
        it.namaPerusahaan.trim() ||
        it.tanggalMulai ||
        it.tanggalSelesai ||
        (it.bidangPekerjaan && it.bidangPekerjaan !== "-") ||
        it.deskripsi.trim(),
    )

    // validasi minimal (sesuai BE required fields)
    for (const it of filledDrafts) {
      if (!it.jenis || it.jenis === "Tidak/belum bekerja") {
        throw new Error("Jenis pekerjaan wajib dipilih.")
      }
      if (!it.jabatan.trim()) throw new Error("Jabatan wajib diisi.")
      if (!it.namaPerusahaan.trim()) throw new Error("Nama perusahaan wajib diisi.")
      if (!it.tanggalMulai || it.tanggalMulai === "-")
        throw new Error("Tanggal mulai wajib diisi.")
      if (it.bidangPekerjaan === "" || it.bidangPekerjaan === "-")
        throw new Error("Bidang pekerjaan/area fungsi wajib dipilih.")
      if (!it.deskripsi.trim()) throw new Error("Deskripsi wajib diisi.")

      if (!it.masihBerlangsung) {
        if (!it.tanggalSelesai || it.tanggalSelesai === "-") {
          throw new Error("Tanggal selesai wajib diisi jika tidak masih berlangsung.")
        }
      }
    }

    // submit satu per satu
    for (const it of filledDrafts) {
      const payload = {
        job_type: it.jenis as JobType,
        position: it.jabatan.trim(),
        company_name: it.namaPerusahaan.trim(),
        functional_area: it.bidangPekerjaan as FunctionalArea,
        start_date: it.tanggalMulai,
        end_date: it.masihBerlangsung ? null : it.tanggalSelesai,
        is_current: Boolean(it.masihBerlangsung),
        description: it.deskripsi.trim(),
      }

      await addExperience(payload)
    }
  }

  async function handleSubmit() {
    if (!agree) {
      toast({
        variant: "destructive",
        title: "Belum dicentang",
        description: "Mohon centang pernyataan terlebih dahulu.",
      })
      return
    }

    try {
      setSaving(true)

      await syncDraftsToBE()
      await refetchFromBE()

      toast({
        title: "Profil tersimpan",
        description: "Pengalaman berhasil disimpan. Mengarahkan ke chatbot...",
      })

      router.push("/chatbot")
    } catch (err: any) {
      console.error("Gagal submit pengalaman:", err)

      const detail =
        err?.message ??
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Terjadi kesalahan saat menyimpan pengalaman."

      toast({
        variant: "destructive",
        title: "Gagal menyimpan pengalaman",
        description: typeof detail === "string" ? detail : "Coba lagi ya.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isTidakBekerja = item.jenis === "Tidak/belum bekerja"
        const isSaved = Boolean(item.backendId)

        return (
          <div
            key={item.uiId}
            className="border rounded-lg p-4 space-y-4 bg-slate-50"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Jenis</label>
                <select
                  value={item.jenis}
                  onChange={(e) => updateItem(item.uiId, "jenis", e.target.value as JenisUi)}
                  disabled={isSaved}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih jenis</option>
                  <option value="Kerja">Kerja (Full Time)</option>
                  <option value="Magang">Magang</option>
                  <option value="Freelance">Freelance / Kontrak</option>
                  <option value="Tidak/belum bekerja">Tidak/belum bekerja</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Jabatan</label>
                <Input
                  value={item.jabatan}
                  onChange={(e) => updateItem(item.uiId, "jabatan", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : "Nama jabatan"}
                  disabled={isTidakBekerja || isSaved}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nama Perusahaan</label>
                <Input
                  value={item.namaPerusahaan}
                  onChange={(e) => updateItem(item.uiId, "namaPerusahaan", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : "Nama perusahaan/organisasi"}
                  disabled={isTidakBekerja || isSaved}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Tanggal Mulai</label>
                <Input
                  type={isTidakBekerja ? "text" : "date"}
                  value={item.tanggalMulai}
                  onChange={(e) => updateItem(item.uiId, "tanggalMulai", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : undefined}
                  disabled={isTidakBekerja || isSaved}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tanggal Selesai</label>
                <Input
                  type={isTidakBekerja ? "text" : "date"}
                  value={item.tanggalSelesai}
                  onChange={(e) => updateItem(item.uiId, "tanggalSelesai", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : undefined}
                  disabled={isTidakBekerja || item.masihBerlangsung || isSaved}
                />

                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id={`masih-berlangsung-${item.uiId}`}
                    checked={item.masihBerlangsung}
                    onCheckedChange={(checked) => {
                      const isChecked = Boolean(checked)
                      updateItem(item.uiId, "masihBerlangsung", isChecked)
                      if (isChecked) updateItem(item.uiId, "tanggalSelesai", "")
                    }}
                    disabled={isTidakBekerja || isSaved}
                    className="h-4 w-4 border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label htmlFor={`masih-berlangsung-${item.uiId}`} className="text-xs sm:text-sm">
                    Masih berlangsung
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bidang Pekerjaan / Area Fungsi</label>
              <select
                value={item.bidangPekerjaan}
                onChange={(e) => updateItem(item.uiId, "bidangPekerjaan", e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                disabled={isTidakBekerja || isSaved}
              >
                {isTidakBekerja ? (
                  <option value="-">-</option>
                ) : (
                  <>
                    <option value="">Pilih bidang pekerjaan</option>
                    {FUNCTIONAL_AREA_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">
                Deskripsi (Tugas &amp; Tanggung Jawab)
              </label>
              <Textarea
                value={item.deskripsi}
                onChange={(e) => updateItem(item.uiId, "deskripsi", e.target.value)}
                placeholder={isTidakBekerja ? "-" : "Deskripsikan pekerjaan dan tanggung jawab Anda"}
                rows={3}
                disabled={isTidakBekerja || isSaved}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleDelete(item)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )
      })}

      <div className="flex gap-3 pb-6">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengalaman
        </Button>
      </div>

      <div className="space-y-4 border-t pt-6">
        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={(checked) => setAgree(Boolean(checked))}
            className="mt-1 h-5 w-5 border-2 border-gray-300"
          />
          <span className="leading-relaxed text-sm">
            Dengan mencentang kolom ini, saya menyatakan telah mengisi data dengan
            sebenar-benarnya.
          </span>
        </label>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={!agree || saving}>
            {saving ? "Menyimpan..." : "Submit Profil & Lanjut ke Chatbot"}
          </Button>
        </div>
      </div>
    </div>
  )
}