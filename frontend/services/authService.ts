// frontend/services/authService.ts
import api from "@/lib/api";

export const login = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append("username", email); // FastAPI OAuth2 biasa pakai 'username'
  formData.append("password", password);

  const res = await api.post("/login", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data as {
    access_token: string;
    token_type: string;
  };
};

export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  username: string;
  nik: string;
  gender: string;     // sesuaikan dengan enum BE (mis: "Laki-laki"/"Perempuan" atau "MALE"/"FEMALE")
  birth_date: string; // format "YYYY-MM-DD"
};

export const register = async (payload: RegisterPayload) => {
  const res = await api.post("/register", payload);
  return res.data;
};