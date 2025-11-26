"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus } from "lucide-react"

type Pengalaman = {
  id: string
  jenis: string
  jabatan: string
  namaPerusahaan: string
  tanggalMulai: string
  tanggalSelesai: string
  bidangPekerjaan: string
  deskripsi: string
  masihBerlangsung: boolean
}

export function PengalamanSection() {
  const router = useRouter()
  const [items, setItems] = useState<Pengalaman[]>([])
  const [agree, setAgree] = useState(false)

  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("profilePengalaman") : null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Pengalaman[]
        // pastikan field masihBerlangsung selalu ada (kalau data lama)
        setItems(
          parsed.map((item) => ({
            ...item,
            masihBerlangsung: Boolean(item.masihBerlangsung),
          })),
        )
      } catch {
        // abaikan error parse
      }
    }
  }, [])

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        jenis: "",
        jabatan: "",
        namaPerusahaan: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        bidangPekerjaan: "",
        deskripsi: "",
        masihBerlangsung: false,
      },
    ])
  }

  function updateItem<K extends keyof Pengalaman>(
    id: string,
    key: K,
    value: Pengalaman[K],
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        let updated: Pengalaman = { ...item, [key]: value }

        // Aturan khusus kalau jenis berubah
        if (key === "jenis") {
          if (value === "Tidak/belum bekerja") {
            // Isi semua kolom lain dengan "-" dan matikan masihBerlangsung
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
            // Kalau sebelumnya "Tidak/belum bekerja" lalu diganti ke jenis lain,
            // kosongkan lagi kolom-kolomnya
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

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleSubmit() {
    if (!agree) {
      alert("Mohon centang pernyataan terlebih dahulu.")
      return
    }
    localStorage.setItem("profilePengalaman", JSON.stringify(items))
    const event = new CustomEvent("toast", {
      detail: {
        title: "Profil Berhasil Disimpan",
        description: "Anda akan diarahkan ke chatbot untuk konsultasi kompetensi.",
        duration: 3000,
      },
    })
    window.dispatchEvent(event)
    setTimeout(() => {
      router.push("/chatbot")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isTidakBekerja = item.jenis === "Tidak/belum bekerja"

        return (
          <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Jenis</label>
                <select
                  value={item.jenis}
                  onChange={(e) => updateItem(item.id, "jenis", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Pilih jenis</option>
                  <option value="Kerja">Kerja</option>
                  <option value="Magang">Magang</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Tidak/belum bekerja">Tidak/belum bekerja</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Jabatan</label>
                <Input
                  value={item.jabatan}
                  onChange={(e) => updateItem(item.id, "jabatan", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : "Nama jabatan"}
                  disabled={isTidakBekerja}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nama Perusahaan</label>
                <Input
                  value={item.namaPerusahaan}
                  onChange={(e) =>
                    updateItem(item.id, "namaPerusahaan", e.target.value)
                  }
                  placeholder={isTidakBekerja ? "-" : "Nama perusahaan/organisasi"}
                  disabled={isTidakBekerja}
                />
              </div>
            </div>

            {/* Tanggal Mulai & Tanggal Selesai + checkbox masih berlangsung */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Tanggal Mulai</label>
                <Input
                  type={isTidakBekerja ? "text" : "date"}
                  value={item.tanggalMulai}
                  onChange={(e) => updateItem(item.id, "tanggalMulai", e.target.value)}
                  placeholder={isTidakBekerja ? "-" : undefined}
                  disabled={isTidakBekerja}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Selesai</label>
                <Input
                  type={isTidakBekerja ? "text" : "date"}
                  value={item.tanggalSelesai}
                  onChange={(e) =>
                    updateItem(item.id, "tanggalSelesai", e.target.value)
                  }
                  placeholder={isTidakBekerja ? "-" : undefined}
                  disabled={isTidakBekerja || item.masihBerlangsung}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id={`masih-berlangsung-${item.id}`}
                    checked={item.masihBerlangsung}
                    onCheckedChange={(checked) => {
                      const isChecked = Boolean(checked)
                      updateItem(item.id, "masihBerlangsung", isChecked)
                      if (isChecked) {
                        // kalau masih berlangsung, kosongkan tanggal selesai
                        updateItem(item.id, "tanggalSelesai", "")
                      }
                    }}
                    disabled={isTidakBekerja}
                    className="h-4 w-4 border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor={`masih-berlangsung-${item.id}`}
                    className="text-xs sm:text-sm"
                  >
                    Masih berlangsung
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Bidang Pekerjaan / Area Fungsi</label>
              <select
                value={item.bidangPekerjaan}
                onChange={(e) =>
                  updateItem(item.id, "bidangPekerjaan", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                disabled={isTidakBekerja}
              >
                {/* opsi khusus "-" supaya value "-" tetap tampil saat tidak bekerja */}
                {isTidakBekerja && (
                  <option value="-">-</option>
                )}
                {!isTidakBekerja && (
                  <>
                    <option value="">Pilih bidang pekerjaan</option>
                    <option value="Data Science & Cloud">Data Science & Cloud</option>
                    <option value="Tata Kelola TI">Tata Kelola TI</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="PPD">Pengembangan Produk Digital</option>
                    <option value="Teknologi Informasi">Teknologi Informasi</option>
                    <option value="Layanan TI">Layanan TI</option>
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
                onChange={(e) => updateItem(item.id, "deskripsi", e.target.value)}
                placeholder={
                  isTidakBekerja
                    ? "-"
                    : "Deskripsikan pekerjaan dan tanggung jawab Anda"
                }
                rows={3}
                disabled={isTidakBekerja}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => deleteItem(item.id)}>
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
            onCheckedChange={(checked) => setAgree(checked as boolean)}
            className="mt-1 h-5 w-5 border-2 border-gray-300"
          />
          <span className="leading-relaxed text-sm">
            Dengan mencentang kolom ini, saya menyatakan telah mengisi data dengan
            sebenar-benarnya.
          </span>
        </label>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSubmit} disabled={!agree}>
            Submit Profil &amp; Lanjut ke Chatbot
          </Button>
        </div>
      </div>
    </div>
  )
}