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
  bidangKeahlian: string
}

interface Props {
  onNext: () => void
}

const STORAGE_KEY = "profileSertifikasi"
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

export function SertifikasiSection({ onNext }: Props) {
  const [items, setItems] = useState<Sertifikasi[]>([])

  // load dari localStorage
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as any[]
        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((item) => ({
              id: item.id ?? Date.now().toString(),
              namaProgram: item.namaProgram ?? "",
              penyelenggara: item.penyelenggara ?? "",
              tahun: item.tahun ?? new Date().getFullYear().toString(),
              bukti: item.bukti ?? "",
              keterangan: item.keterangan ?? "",
              bidangKeahlian: item.bidangKeahlian ?? "",
            })),
          )
        }
      } catch {
        // abaikan error parse
      }
    }
  }, [])

  function addItem() {
    setItems((prev) => {
      if (prev.length >= MAX_ITEMS) return prev
      return [
        ...prev,
        {
          id: Date.now().toString(),
          namaProgram: "",
          penyelenggara: "",
          tahun: "2025",
          bukti: "",
          keterangan: "",
          bidangKeahlian: "",
        },
      ]
    })
  }

  function updateItem<K extends keyof Sertifikasi>(
    id: string,
    key: K,
    value: Sertifikasi[K],
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    )
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    onNext()
  }

  const canAddMore = items.length < MAX_ITEMS

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 space-y-4 bg-slate-50"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nama Program</label>
              <Input
                value={item.namaProgram}
                onChange={(e) =>
                  updateItem(item.id, "namaProgram", e.target.value)
                }
                placeholder="Nama program/sertifikasi"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Penyelenggara</label>
              <Input
                value={item.penyelenggara}
                onChange={(e) =>
                  updateItem(item.id, "penyelenggara", e.target.value)
                }
                placeholder="Lembaga penyelenggara"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Tahun</label>
              <select
                value={item.tahun}
                onChange={(e) =>
                  updateItem(item.id, "tahun", e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
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
                onChange={(e) =>
                  updateItem(item.id, "bukti", e.target.value)
                }
                placeholder="URL atau file link"
              />
            </div>
          </div>

          {/* Bidang Keahlian */}
          <div>
            <label className="text-sm font-medium">Bidang Keahlian</label>
            <select
              value={item.bidangKeahlian}
              onChange={(e) =>
                updateItem(item.id, "bidangKeahlian", e.target.value)
              }
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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
              Contoh: Sertifikasi Cloud Practitioner yang mencakup pengenalan
              layanan cloud, keamanan, pengelolaan resource, dan arsitektur
              dasar. Selama program, saya mengerjakan latihan konfigurasi
              server, membuat storage bucket, dan mensimulasikan deployment
              aplikasi sederhana.
            </p>
            <Textarea
              className="mt-2"
              value={item.keterangan}
              onChange={(e) =>
                updateItem(item.id, "keterangan", e.target.value)
              }
              placeholder="Tuliskan ringkasan kegiatan, materi yang dipelajari, dan peran Anda selama program."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      ))}

      <div className="flex gap-3 items-center">
        {canAddMore && (
          <Button variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Sertifikasi
          </Button>
        )}
        {!canAddMore && (
          <p className="text-xs text-slate-500">
            Maksimal {MAX_ITEMS} sertifikasi.
          </p>
        )}
        <Button className="ml-auto" onClick={handleSave}>
          Simpan &amp; Lanjut ke Pengalaman
        </Button>
      </div>
    </div>
  )
}