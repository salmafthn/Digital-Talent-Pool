"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

type PendidikanItem = {
  id: number
  jenjang: string
  namaInstitusi: string
  fakultas: string
  jurusan: string
  tahunMasuk: string
  tahunLulus: string
  ipk: string
  judulTugasAkhir: string
  masihMenempuh: boolean
}

interface Props {
  onNext: () => void
}

const STORAGE_KEY = "profilePendidikan"
const MAX_PENDIDIKAN = 3

function createEmptyItem(id: number): PendidikanItem {
  return {
    id,
    jenjang: "",
    namaInstitusi: "",
    fakultas: "",
    jurusan: "",
    tahunMasuk: "",
    tahunLulus: "",
    ipk: "",
    judulTugasAkhir: "",
    masihMenempuh: false,
  }
}

export function PendidikanSection({ onNext }: Props) {
  const [items, setItems] = useState<PendidikanItem[]>([createEmptyItem(1)])

  // Load dari localStorage
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setItems(
          parsed.map((item: any, index: number) => ({
            id: item.id ?? index + 1,
            jenjang: item.jenjang ?? "",
            namaInstitusi: item.namaInstitusi ?? "",
            fakultas: item.fakultas ?? "",
            jurusan: item.jurusan ?? "",
            tahunMasuk: item.tahunMasuk ?? "",
            tahunLulus: item.tahunLulus ?? "",
            ipk: item.ipk ?? "",
            judulTugasAkhir: item.judulTugasAkhir ?? "",
            masihMenempuh: Boolean(item.masihMenempuh),
          })),
        )
      } else if (parsed && typeof parsed === "object") {
        // fallback kalau dulu pernah nyimpan single object
        setItems([
          {
            id: 1,
            jenjang: parsed.jenjang ?? "",
            namaInstitusi: parsed.namaInstitusi ?? "",
            fakultas: parsed.fakultas ?? "",
            jurusan: parsed.jurusan ?? "",
            tahunMasuk: parsed.tahunMasuk ?? "",
            tahunLulus: parsed.tahunLulus ?? "",
            ipk: parsed.ipk ?? "",
            judulTugasAkhir: parsed.judulTugasAkhir ?? "",
            masihMenempuh: Boolean(parsed.masihMenempuh),
          },
        ])
      }
    } catch {
      // abaikan error parse
    }
  }, [])

  function applyBusinessRules(item: PendidikanItem): PendidikanItem {
    const isLainnya = item.jenjang === "LAINNYA"
    let next = { ...item }

    if (isLainnya) {
      next = {
        ...next,
        namaInstitusi: "-",
        fakultas: "-",
        jurusan: "-",
        tahunMasuk: "-",
        tahunLulus: "-",
        ipk: "-",
        judulTugasAkhir: "-",
        masihMenempuh: false,
      }
    } else {
      if (next.masihMenempuh) {
        next.tahunLulus = "-"
      }
    }

    return next
  }

  function updateItem<K extends keyof PendidikanItem>(
    id: number,
    key: K,
    value: PendidikanItem[K],
  ) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        let updated = { ...item, [key]: value }
        if (key === "jenjang" || key === "masihMenempuh") {
          updated = applyBusinessRules(updated)
        }

        return updated
      }),
    )
  }

  function addItem() {
    setItems((prev) => {
      if (prev.length >= MAX_PENDIDIKAN) return prev
      return [...prev, createEmptyItem(prev.length + 1)]
    })
  }

  function removeItem(id: number) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)))
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    onNext()
  }

  // VALIDASI: minimal pendidikan pertama terisi
  // Aturan:
  // - Jenjang wajib diisi
  // - Kalau jenjang "LAINNYA" → cukup jenjang saja (field lain auto "-")
  // - Selain itu, Nama Institusi juga wajib diisi
  const isFirstItemValid = (() => {
    const first = items[0]
    if (!first) return false
    if (!first.jenjang) return false

    if (first.jenjang === "LAINNYA") {
      return true
    }

    if (!first.namaInstitusi.trim()) return false

    return true
  })()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Pendidikan</h2>
        <p className="text-sm text-muted-foreground">
          Tambahkan riwayat pendidikanmu. Kamu bisa mengisi lebih dari satu (misalnya S1, S2, S3).
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => {
          const isSMA = item.jenjang === "SMA/SMK"
          const isLainnya = item.jenjang === "LAINNYA"

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Pendidikan {index + 1}</h3>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => removeItem(item.id)}
                  >
                    Hapus
                  </Button>
                )}
              </div>

              {/* Jenjang + Nama Institusi */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Jenjang</label>
                  <select
                    value={item.jenjang}
                    onChange={(e) => updateItem(item.id, "jenjang", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Pilih pendidikan</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Nama Institusi</label>
                  <Input
                    value={item.namaInstitusi}
                    onChange={(e) => updateItem(item.id, "namaInstitusi", e.target.value)}
                    placeholder={isLainnya ? "-" : "Universitas/Sekolah"}
                    disabled={isLainnya}
                  />
                </div>
              </div>

              {/* Fakultas + Jurusan */}
              <div className="grid gap-4 sm:grid-cols-2">
                {!isSMA && (
                  <div>
                    <label className="text-sm font-medium">Fakultas</label>
                    <Input
                      value={item.fakultas}
                      onChange={(e) => updateItem(item.id, "fakultas", e.target.value)}
                      placeholder={isLainnya ? "-" : "Nama fakultas"}
                      disabled={isLainnya}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Jurusan</label>
                  <Input
                    value={item.jurusan}
                    onChange={(e) => updateItem(item.id, "jurusan", e.target.value)}
                    placeholder={isLainnya ? "-" : "Nama jurusan"}
                    disabled={isLainnya}
                  />
                </div>
              </div>

              {/* Tahun Masuk - Tahun Lulus - IPK */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Tahun Masuk</label>
                  <Input
                    type={isLainnya ? "text" : "number"}
                    value={item.tahunMasuk}
                    onChange={(e) => updateItem(item.id, "tahunMasuk", e.target.value)}
                    placeholder={isLainnya ? "-" : "YYYY"}
                    disabled={isLainnya}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tahun Lulus</label>
                  <Input
                    type={isLainnya || item.masihMenempuh ? "text" : "number"}
                    value={item.tahunLulus}
                    onChange={(e) => updateItem(item.id, "tahunLulus", e.target.value)}
                    placeholder={isLainnya || item.masihMenempuh ? "-" : "YYYY"}
                    disabled={isLainnya || item.masihMenempuh}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Checkbox
                      id={`masih-menempuh-${item.id}`}
                      checked={item.masihMenempuh}
                      disabled={isLainnya}
                      onCheckedChange={(checked) =>
                        updateItem(item.id, "masihMenempuh", Boolean(checked))
                      }
                      className="h-4 w-4 border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <label
                      htmlFor={`masih-menempuh-${item.id}`}
                      className="text-xs sm:text-sm font-normal"
                    >
                      Saya masih menempuh pendidikan ini
                    </label>
                  </div>
                </div>

                {!isSMA && (
                  <div>
                    <label className="text-sm font-medium">IPK</label>
                    <Input
                      type={isLainnya ? "text" : "number"}
                      step="0.01"
                      value={item.ipk}
                      onChange={(e) => updateItem(item.id, "ipk", e.target.value)}
                      placeholder={isLainnya ? "-" : "3.50"}
                      disabled={isLainnya}
                    />
                  </div>
                )}
              </div>

              {!isSMA && (
                <div>
                  <label className="text-sm font-medium">Judul Tugas Akhir</label>
                  <Textarea
                    value={item.judulTugasAkhir}
                    onChange={(e) => updateItem(item.id, "judulTugasAkhir", e.target.value)}
                    placeholder={isLainnya ? "-" : "Judul skripsi/thesis"}
                    rows={2}
                    disabled={isLainnya}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tombol Tambah + Simpan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-col gap-1">
          {items.length < MAX_PENDIDIKAN ? (
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pendidikan
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Maksimal 3 riwayat pendidikan.
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={!isFirstItemValid}  //  abu-abu kalau pendidikan pertama belum terisi minimal
        >
          Simpan &amp; Lanjut ke Sertifikasi
        </Button>
      </div>
    </div>
  )
}