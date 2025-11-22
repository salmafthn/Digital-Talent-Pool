import { create } from "zustand"

export type AreaKey = "DSC" | "TKTI" | "CYBER" | "PPD" | "TI" | "LTI"
export type AreaStatus = "Assessed" | "Unassessed"

export interface Recommendation {
  title: string
  description?: string
  href?: string
}

export interface Area {
  key: AreaKey
  name: string
  level: number
  progress: number
  status: AreaStatus
  description?: string
  jobs?: Recommendation[]
  learnings?: Recommendation[]
}

interface AssessmentStore {
  areas: Area[]
  activeArea: AreaKey
  setActiveArea: (key: AreaKey) => void
  completeAssessment: (key: AreaKey) => void
}

const initialAreas: Area[] = [
  {
    key: "DSC",
    name: "Data Science & Cloud",
    level: 7,
    progress: 30,
    status: "Assessed",
    jobs: [
      { title: "AI Engineer", description: "Kembangkan solusi AI dan machine learning" },
      { title: "ML Engineer", description: "Bangun model prediktif yang canggih" },
    ],
    learnings: [
      { title: "Modul 1: Python untuk Data Science", href: "https://dts.kominfo.go.id" },
      { title: "Modul 2: Machine Learning Fundamentals", href: "https://dts.kominfo.go.id" },
    ],
  },
  {
    key: "TKTI",
    name: "Tata Kelola TI",
    level: 3,
    progress: 50,
    status: "Unassessed",
    description:
      "Tingkatkan pengetahuan tentang tata kelola teknologi informasi. Fokus pada COBIT framework dan best practices IT governance untuk meningkatkan level kompetensi Anda.",
  },
  {
    key: "CYBER",
    name: "Cybersecurity",
    level: 2,
    progress: 0,
    status: "Unassessed",
    description:
      "Perluas wawasan tentang keamanan cyber dan perlindungan data. Ikuti modul pelatihan untuk mencapai sertifikasi cyber security.",
  },
  {
    key: "PPD",
    name: "Pengembangan Produk Digital",
    level: 4,
    progress: 0,
    status: "Unassessed",
    description: "Pelajari metodologi pengembangan produk digital modern termasuk UX/UI design dan agile development.",
  },
  {
    key: "TI",
    name: "Transformasi Digital",
    level: 3,
    progress: 0,
    status: "Unassessed",
    description: "Pahami strategi transformasi digital dan implementasinya dalam organisasi modern.",
  },
  {
    key: "LTI",
    name: "Literasi Teknologi Informasi",
    level: 5,
    progress: 0,
    status: "Unassessed",
    description: "Tingkatkan literasi dasar teknologi informasi untuk meningkatkan produktivitas kerja.",
  },
]

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  areas: initialAreas,
  activeArea: "DSC",
  setActiveArea: (key: AreaKey) => set({ activeArea: key }),
  completeAssessment: (key: AreaKey) =>
    set((state) => ({
      areas: state.areas.map((area) =>
        area.key === key
          ? {
              ...area,
              status: "Assessed" as AreaStatus,
              progress: Math.min(area.progress + 10, 100),
            }
          : area,
      ),
    })),
}))
