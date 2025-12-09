// frontend/services/profileService.ts
import api from "@/lib/api";

// Nanti tipe-tipe ini bisa kamu rapihin lagi kalau mau
export const getMyProfile = async () => {
  const res = await api.get("/profile/");
  return res.data; // ProfileFullResponse
};

export const updateMyProfile = async (data: any) => {
  const res = await api.put("/profile/", data);
  return res.data;
};

export const addEducation = async (data: any) => {
  const res = await api.post("/profile/education", data);
  return res.data;
};

export const deleteEducation = async (id: number) => {
  const res = await api.delete(`/profile/education/${id}`);
  return res.data;
};

export const addExperience = async (data: any) => {
  const res = await api.post("/profile/experience", data);
  return res.data;
};

export const deleteExperience = async (id: number) => {
  const res = await api.delete(`/profile/experience/${id}`);
  return res.data;
};

export const addCertification = async (payload: {
  name: string;
  organizer: string;
  year: number;
  description: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("organizer", payload.organizer);
  formData.append("year", String(payload.year));
  formData.append("description", payload.description);
  formData.append("file", payload.file);

  const res = await api.post("/profile/certification", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteCertification = async (id: number) => {
  const res = await api.delete(`/profile/certification/${id}`);
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteAvatar = async () => {
  const res = await api.delete("/profile/avatar");
  return res.data;
};