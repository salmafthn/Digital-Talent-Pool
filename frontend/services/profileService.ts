// frontend/services/profileService.ts
import api from "@/lib/api"

// =========================
// EDUCATION (sesuai BE)
// =========================
export type EducationLevel =
  | "SMA/SMK"
  | "D3"
  | "D4"
  | "S1"
  | "S2"
  | "S3"
  | "Lainnya"

export interface EducationCreatePayload {
  level: EducationLevel
  institution_name?: string | null
  faculty?: string | null
  major?: string | null
  enrollment_year?: number | null
  graduation_year?: number | null
  is_current?: boolean
  gpa?: string | null
  final_project_title?: string | null
}

export interface EducationResponse extends EducationCreatePayload {
  id: number
}

// =========================
// EXPERIENCE (sesuai BE)
// =========================
export type JobType = "Kerja" | "Magang" | "Freelance" | "Tidak/belum bekerja"

export type FunctionalArea =
  | "Tata Kelola Teknologi Informasi (IT Governance)"
  | "Pengembangan Produk Digital (Digital Product Development)"
  | "Sains Data-Kecerdasan Artifisial (Data Science-AI)"
  | "Keamanan Informasi dan Siber"
  | "Teknologi dan Infrastruktur"
  | "Layanan Teknologi Informasi"

export interface ExperienceCreatePayload {
  job_type: JobType
  position: string
  company_name: string
  functional_area: FunctionalArea
  start_date: string // "YYYY-MM-DD"
  end_date?: string | null // null kalau is_current=true
  is_current?: boolean
  description: string
}

export interface ExperienceResponse extends ExperienceCreatePayload {
  id: number
}

// =========================
// CERTIFICATION (upload file)
// =========================
export interface CertificationResponse {
  id: number
  name: string
  organizer: string
  year: number
  proof_url: string
  description: string
  bidang_keahlian?: string | null
}

export type AddCertificationPayload = {
  name: string
  organizer: string
  year: number
  description: string
  file: File
  bidang_keahlian?: string
}

// =========================
// PROFILE (minimal typed)
// =========================
export interface ProfileUpdatePayload {
  phone?: string | null
  linkedin_url?: string | null
  portfolio_url?: string | null
  instagram_username?: string | null
  address?: string | null
  bio?: string | null
  avatar_url?: string | null
  skills?: string[] | null
}

export interface ProfileFullResponse {
  id: number
  user_id: number

  email?: string | null
  nik?: string | null
  full_name?: string | null
  gender?: string | null
  birth_date?: string | null

  phone?: string | null
  address?: string | null
  bio?: string | null
  linkedin_url?: string | null
  portfolio_url?: string | null
  instagram_username?: string | null

  avatar_url?: string | null
  skills: string[]

  educations: EducationResponse[]
  certifications: CertificationResponse[]
  experiences: ExperienceResponse[]
}

// =========================
// API calls
// =========================
export const getMyProfile = async (): Promise<ProfileFullResponse> => {
  const res = await api.get("/profile/")
  return res.data
}

export const updateMyProfile = async (
  data: ProfileUpdatePayload,
): Promise<ProfileFullResponse> => {
  const res = await api.put("/profile/", data)
  return res.data
}

// ---- education
export const addEducation = async (
  data: EducationCreatePayload,
): Promise<EducationResponse> => {
  const res = await api.post("/profile/education", data)
  return res.data
}

export const deleteEducation = async (id: number) => {
  const res = await api.delete(`/profile/education/${id}`)
  return res.data
}

// ---- experience
export const addExperience = async (
  data: ExperienceCreatePayload,
): Promise<ExperienceResponse> => {
  const res = await api.post("/profile/experience", data)
  return res.data
}

export const deleteExperience = async (id: number) => {
  const res = await api.delete(`/profile/experience/${id}`)
  return res.data
}

// ---- certification (multipart)
export const addCertification = async (
  payload: AddCertificationPayload,
): Promise<CertificationResponse> => {
  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("organizer", payload.organizer)
  formData.append("year", String(payload.year))
  formData.append("description", payload.description)
  formData.append("file", payload.file)

  if (payload.bidang_keahlian) {
    formData.append("bidang_keahlian", payload.bidang_keahlian)
  }

  const res = await api.post("/profile/certification", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export const deleteCertification = async (id: number) => {
  const res = await api.delete(`/profile/certification/${id}`)
  return res.data
}

// ---- avatar
export const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  const res = await api.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export const deleteAvatar = async () => {
  const res = await api.delete("/profile/avatar")
  return res.data
}