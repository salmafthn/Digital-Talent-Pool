"use client"

import type React from "react"

import { useRef, useState } from "react"

export default function PhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function fileToDataURL(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement("canvas")
    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")!
    const scale = Math.min(size / bitmap.width, size / bitmap.height)
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)
    const x = Math.floor((size - w) / 2)
    const y = Math.floor((size - h) / 2)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(bitmap, x, y, w, h)
    return canvas.toDataURL("image/jpeg", 0.85)
  }

  function handleClick() {
    inputRef.current?.click()
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const valid = ["image/png", "image/jpeg"].includes(file.type)
    if (!valid) {
      alert("Format tidak didukung. Gunakan PNG atau JPG.")
      e.currentTarget.value = ""
      return
    }

    const max = 3 * 1024 * 1024
    if (file.size > max) {
      alert("Ukuran file maksimal 3MB.")
      e.currentTarget.value = ""
      return
    }

    // Convert file to base64 Data URL with compression
    const dataUrl = await fileToDataURL(file)
    setPreview(dataUrl)

    const raw = localStorage.getItem("user")
    const user = raw ? JSON.parse(raw) : { name: "Pengguna" }
    user.photoUrl = dataUrl
    localStorage.setItem("user", JSON.stringify(user))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "user",
        newValue: JSON.stringify(user),
      }),
    )
  }

  return (
    <div className="w-full">
      <label className="block text-lg font-semibold text-foreground mb-4">Upload Foto Profil</label>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        className="relative flex flex-col items-center justify-center h-56 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 hover:bg-blue-50 transition cursor-pointer"
      >
        {!preview ? (
          <div className="text-center">
            <div className="text-5xl font-light text-gray-400">+</div>
            <div className="mt-2 font-medium text-foreground">Click to upload</div>
            <div className="text-xs text-muted-foreground">PNG or JPG (max 3MB)</div>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
            <img src={preview || "/placeholder.svg"} alt="Preview foto profil" className="object-cover w-full h-full" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={handleChange}
          aria-label="Upload foto profil"
        />
      </div>
    </div>
  )
}
