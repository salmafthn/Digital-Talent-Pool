"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // reset error tiap submit
    setErrorMessage(null);

    // validasi form kosong
    if (!email || !password) {
      const msg = "Email dan password wajib diisi.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: msg,
      });
      return;
    }

    try {
      setIsLoading(true);

      const data = await login(email, password);

      // simpan token ke localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
      }

      toast({
        title: "Berhasil login",
        description: "Selamat datang kembali!",
      });

      router.push("/profile");
    } catch (err: any) {
      console.error("LOGIN ERROR", err?.response?.status, err?.response?.data);

      let msg = "Email atau password salah, atau server sedang bermasalah.";

      // kalau backend balas 401 → kredensial salah
      if (err?.response?.status === 401) {
        msg = "Email atau password salah.";
      } else if (typeof err?.response?.data?.detail === "string") {
        // kalau backend mengirim detail sebagai string
        msg = err.response.data.detail;
      }

      setErrorMessage(msg);

      toast({
        variant: "destructive",
        title: "Login gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-blue-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-16">
          <h1 className="text-3xl font-bold text-center text-foreground mb-8">
            Log In Akun
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="Type here..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-border"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Type here..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-border"
              />
              <Link
                href="#"
                className="text-sm text-primary hover:text-primary/80 inline-block"
              >
                Forgot password?
              </Link>
            </div>

            {/* Pesan error di halaman (kalau ada) */}
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "LOGIN"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Sign up here!
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}