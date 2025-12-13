"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  startInterview,
  sendReply,
  getChatHistory,
  type ChatLog,
} from "@/services/aiService";

type Message = {
  id: number;
  role: "ai" | "user";
  text: string;
  kind?: "invite";
};

export default function ChatbotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);

  const [finalMappingResult, setFinalMappingResult] = useState<any>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          setUserPhoto(JSON.parse(raw).photoUrl ?? null);
        } catch {}
      }
    }
    initializeChat();
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // --- FUNGSI PEMBERSIH TEXT ---
  const cleanText = (text: string): string => {
    if (!text) return "";
    // Hapus tag <think> dan </think> saja, tapi biarkan isinya
    // (karena di kasus Anda isinya adalah jawaban yang benar)
    return text
      .replace(/<think>/g, "")
      .replace(/<\/think>/g, "")
      .trim();
  };

  const parseAIResponse = (text: string, id: number): Message => {
    // 1. Bersihkan text dulu dari tag <think>
    let cleanMsg = cleanText(text);

    // 2. Cek apakah sesi selesai (ada tag <RESULT> atau [END OF CHAT])
    const resultMatch = cleanMsg.match(/<RESULT>([\s\S]*?)<\/RESULT>/);
    const hasEndTag = cleanMsg.includes("[END OF CHAT]");

    let kind: "invite" | undefined = undefined;

    // Jika salah satu tanda selesai ditemukan
    if (resultMatch || hasEndTag) {
      setIsInterviewFinished(true);
      kind = "invite";

      // --- PEMBERSIHAN TOTAL ---
      // 1. Hapus blok <RESULT>...</RESULT>
      cleanMsg = cleanMsg.replace(/<RESULT>[\s\S]*?<\/RESULT>/, "");

      // 2. Hapus tag [END OF CHAT] (di manapun posisinya)
      cleanMsg = cleanMsg.replace("[END OF CHAT]", "");

      // 3. Rapikan sisa spasi/enter yang tertinggal
      cleanMsg = cleanMsg.trim();
      // -------------------------

      // Jika ada data JSON result, simpan ke state
      if (resultMatch) {
        try {
          const jsonResult = JSON.parse(resultMatch[1]);
          setFinalMappingResult(jsonResult);
        } catch (e) {
          console.error("Gagal parse JSON result", e);
        }
      }
    }

    return {
      id,
      role: "ai",
      text: cleanMsg, // Teks sekarang dijamin bersih
      kind,
    };
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const history = await getChatHistory();

      if (history && history.length > 0) {
        const formattedMessages: Message[] = [];
        history.forEach((log: ChatLog, index) => {
          // Sembunyikan prompt profil awal (jika backend mengirimnya)
          // Ciri-cirinya: kosong atau diawali "Berikut data..."
          const isProfilePrompt =
            !log.user_prompt || log.user_prompt.startsWith("Berikut data");

          if (!isProfilePrompt && log.user_prompt.trim() !== "") {
            formattedMessages.push({
              id: index * 2 + 1,
              role: "user",
              text: log.user_prompt,
            });
          }

          const aiMsg = parseAIResponse(log.ai_response, index * 2 + 2);
          formattedMessages.push(aiMsg);
        });
        setMessages(formattedMessages);
      } else {
        const res = await startInterview();
        const initialAiMsg = parseAIResponse(res.data.answer, 1);
        setMessages([initialAiMsg]);
      }
    } catch (error) {
      console.error("Gagal memuat chat", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghubungkan ke AI Interviewer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSendMessage(text: string) {
    if (!text.trim()) return;

    const userMsgId = messages.length + 1;
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await sendReply(text);
      const aiMsg = parseAIResponse(res.data.answer, userMsgId + 1);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Gagal mengirim pesan",
        description: "Terjadi kesalahan pada server AI.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCTA() {
    if (finalMappingResult) {
      const oldMappingRaw = localStorage.getItem("mapping");
      let mapping = oldMappingRaw ? JSON.parse(oldMappingRaw) : {};

      let areaKey = "TKTI";
      const areaName = finalMappingResult.area_fungsi || "";
      const level = finalMappingResult.level || 1;

      if (areaName.includes("Data") || areaName.includes("Sains"))
        areaKey = "DSC";
      else if (areaName.includes("Keamanan") || areaName.includes("Siber"))
        areaKey = "CYBER";
      else if (areaName.includes("Produk")) areaKey = "PPD";
      else if (areaName.includes("Layanan")) areaKey = "LTI";
      else if (areaName.includes("Infrastruktur")) areaKey = "TI";

      mapping[areaKey] = {
        area: areaName,
        level: level,
        progress: level * 20,
        status: "Assessed",
        notes: "Hasil penilaian AI Interview.",
      };

      localStorage.setItem("mapping", JSON.stringify(mapping));
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-blue-50 pt-20 sm:pt-24 md:pt-28 pb-10">
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 flex flex-col h-[600px] sm:h-[650px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
              Konsultasi Kompetensi
            </h1>

            <div
              ref={scrollerRef}
              className="flex-1 space-y-4 sm:space-y-6 mb-4 overflow-y-auto pr-1"
            >
              {messages.length === 0 && isLoading && (
                <div className="text-center text-gray-500 mt-10">
                  Memulai sesi interview...
                </div>
              )}

              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} userPhoto={userPhoto}>
                  {msg.text}
                </ChatBubble>
              ))}

              {isLoading && messages.length > 0 && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-blue-50 px-4 py-2 rounded-2xl text-xs text-blue-500">
                    AI sedang mengetik...
                  </div>
                </div>
              )}

              {isInterviewFinished && (
                <div className="pt-4 flex justify-center">
                  <Button
                    onClick={handleCTA}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-full"
                  >
                    LIHAT HASIL PEMETAAN
                  </Button>
                </div>
              )}
            </div>

            {!isInterviewFinished && (
              <div className="border-t pt-4 mt-4">
                <ChatInput onSend={handleSendMessage} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
