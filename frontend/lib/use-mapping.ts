"use client"

import { useEffect, useState } from "react"

type AreaKey = "DSC" | "TKTI" | "CYBER" | "PPD" | "TI" | "LTI"

export type AreaInfo = {
  area: string
  level: number
  progress: number
  status: "Assessed" | "Unassessed"
  notes?: string
}

export type Mapping = Record<AreaKey, AreaInfo>

const DEFAULT_MAPPING: Mapping = {
  DSC: { area: "Data Science & Cloud", level: 0, progress: 0, status: "Unassessed", notes: "" },
  TKTI: { area: "Tata Kelola TI", level: 0, progress: 0, status: "Unassessed", notes: "" },
  CYBER: { area: "Cybersecurity", level: 0, progress: 0, status: "Unassessed", notes: "" },
  PPD: { area: "PPD", level: 0, progress: 0, status: "Unassessed", notes: "" },
  TI: { area: "Teknologi Informasi", level: 0, progress: 0, status: "Unassessed", notes: "" },
  LTI: { area: "Layanan TI", level: 0, progress: 0, status: "Unassessed", notes: "" },
}

export function useMapping(): Mapping {
  const [mapping, setMapping] = useState<Mapping>(DEFAULT_MAPPING)

  useEffect(() => {
    if (typeof window === "undefined") return

    const raw = localStorage.getItem("mapping")
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Mapping
        setMapping(parsed)
      } catch {
        setMapping(DEFAULT_MAPPING)
      }
    } else {
      setMapping(DEFAULT_MAPPING)
    }
  }, [])

  return mapping
}
