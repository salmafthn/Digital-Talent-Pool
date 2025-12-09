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
import { register } from "@/services/authService";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // <-- NEW
  const [nik, setNik] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("SUBMIT REGISTER DIPANGGIL", {
      fullName,
      username,
      nik,
      gender,
      birthDate,
      email,
    });

    // reset error tiap submit
    setErrorMessage(null);

    // === Validasi form kosong ===
    if (
      !fullName ||
      !username ||         // <-- username wajib
      !nik ||
      !gender ||
      !birthDate ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      console.log("VALIDASI: form belum lengkap");
      const msg = "Semua field wajib diisi.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Form belum lengkap",
        description: msg,
      });
      return;
    }

    // === Validasi password & konfirmasi ===
    if (password !== confirmPassword) {
      console.log("VALIDASI: password tidak cocok");
      const msg = "Password dan konfirmasi password harus sama.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Password tidak cocok",
        description: msg,
      });
      return;
    }

    // === Validasi NIK: harus 16 digit angka ===
    if (!/^[0-9]{16}$/.test(nik)) {
      console.log("VALIDASI: NIK tidak 16 digit");
      const msg = "NIK harus terdiri dari tepat 16 digit angka.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "NIK tidak valid",
        description: msg,
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("MENGIRIM KE BACKEND /register ...");

      await register({
        email,
        password,
        full_name: fullName,
        username,        // <-- DIKIRIM KE BACKEND
        nik,             // string 16 digit
        gender,
        birth_date: birthDate,
      });

      console.log("REGISTER BERHASIL, redirect ke /login");

      toast({
        title: "Registrasi berhasil",
        description: "Silakan login dengan akun yang baru dibuat.",
      });

      router.push("/login");
    } catch (err: any) {
      console.error("REGISTER ERROR", err);

      const detail =
        err?.response?.data?.detail ??
        "Registrasi gagal. Coba lagi atau gunakan email lain.";

      const msg = typeof detail === "string" ? detail : "Gagal registrasi.";
      setErrorMessage(msg);

      toast({
        variant: "destructive",
        title: "Registrasi gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler NIK: hanya izinkan angka & max 16 digit
  const handleNikChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    const limited = onlyDigits.slice(0, 16);
    setNik(limited);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="min-h-screen bg-blue-50 pt-24 sm:pt-28 pb-16">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-16">
          <h1 className="text-3xl font-bold text-center text-foreground mb-8">
            Registrasi Akun
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Nama Lengkap
              </label>
              <Input
                type="text"
                placeholder="Nama lengkap..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                type="text"
                placeholder="Username untuk login..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* NIK */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                NIK (16 digit)
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Masukkan 16 digit angka"
                value={nik}
                onChange={(e) => handleNikChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                NIK hanya boleh berisi angka dan harus 16 digit.
              </p>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Jenis Kelamin
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tanggal Lahir */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tanggal Lahir
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="Email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-border"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-border"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Konfirmasi Password
              </label>
              <Input
                type="password"
                placeholder="Ulangi password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border-border"
              />
            </div>

            {/* Error message di halaman */}
            {errorMessage && (
              <p className="text-sm text-red-500">
                {errorMessage}
              </p>
            )}

            {/* Tombol Daftar */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "DAFTAR"}
            </Button>
          </form>

          {/* Link ke login */}
          <div className="text-center mt-6">
            <p className="text-sm text-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                Log in here!
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}