"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"

type Sertifikasi = {
  id: string
  namaProgram: string
  penyelenggara: string
  tahun: string
  bukti: string
  keterangan: string
}

interface Props {
  onNext: () => void
}

export function SertifikasiSection({ onNext }: Props) {
  const [items, setItems] = useState<Sertifikasi[]>([])

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("profileSertifikasi") : null
    if (raw) {
      try {
        setItems(JSON.parse(raw))
      } catch {}
    }
  }, [])

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        namaProgram: "",
        penyelenggara: "",
        tahun: new Date().getFullYear().toString(),
        bukti: "",
        keterangan: "",
      },
    ])
  }

  function updateItem<K extends keyof Sertifikasi>(id: string, key: K, value: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleSave() {
    localStorage.setItem("profileSertifikasi", JSON.stringify(items))
    onNext()
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-slate-50">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nama Program</label>
              <Input
                value={item.namaProgram}
                onChange={(e) => updateItem(item.id, "namaProgram", e.target.value)}
                placeholder="Nama program/sertifikasi"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Penyelenggara</label>
              <Input
                value={item.penyelenggara}
                onChange={(e) => updateItem(item.id, "penyelenggara", e.target.value)}
                placeholder="Lembaga penyelenggara"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tahun</label>
              <select
                value={item.tahun}
                onChange={(e) => updateItem(item.id, "tahun", e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {Array.from({ length: 31 }, (_, i) => 2000 + i).map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Bukti/Link</label>
              <Input
                value={item.bukti}
                onChange={(e) => updateItem(item.id, "bukti", e.target.value)}
                placeholder="URL atau file link"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea
              value={item.keterangan}
              onChange={(e) => updateItem(item.id, "keterangan", e.target.value)}
              placeholder="Deskripsi singkat"
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => deleteItem(item.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sertifikasi
        </Button>
        <Button className="ml-auto" onClick={handleSave}>
          Simpan & Lanjut ke Pengalaman
        </Button>
      </div>
    </div>
  )
}
