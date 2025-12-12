import api from "@/lib/api";

export interface ChatLog {
  id: number;
  user_prompt: string;
  ai_response: string;
}

export interface InterviewResponse {
  success: boolean;
  message: string;
  data: {
    answer: string;
  };
}
 
export const startInterview = async () => {
  const res = await api.post("/ai/interview/start");
  return res.data as InterviewResponse;
};
 
export const sendReply = async (prompt: string) => {
  const res = await api.post("/ai/interview", { prompt });
  return res.data as InterviewResponse;
};

// 3. Mengambil Riwayat Chat (Saat refresh halaman)
export const getChatHistory = async () => {
  const res = await api.get("/ai/history");
  return res.data as ChatLog[];
};
