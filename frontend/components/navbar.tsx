"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";

type User = { name?: string; email?: string; photoUrl?: string };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("user");
    const photoUrl = localStorage.getItem("profilePhotoUrl");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser({ ...parsed, photoUrl: photoUrl || parsed.photoUrl });
      } catch {
        // ignore
      }
    } else if (photoUrl) {
      setUser({ name: "Pengguna", photoUrl });
    }

    function onStorage(e: StorageEvent) {
      if (e.key === "user" && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          setUser((prev) => ({ ...prev, ...userData }));
        } catch {
          // ignore
        }
      }

      if (e.key === "profilePhotoUrl" && e.newValue) {
        setUser((prev) => ({ ...prev, photoUrl: e.newValue || prev?.photoUrl }));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "#", label: "Lowongan" },
    { href: "#", label: "Virtual Internship" },
    { href: "#", label: "Mentor Class" },
    { href: "#", label: "Perusahaan" },
    { href: "#", label: "Tentang" },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("profilePhotoUrl");
      localStorage.removeItem("token");
      localStorage.removeItem("profileDataDiri");
      localStorage.removeItem("profilePendidikan");
      localStorage.removeItem("profilePengalaman");
      localStorage.removeItem("profileSertifikasi");
      localStorage.removeItem("profileLocked");
    }

    setUser(null);
    router.push("/login");
  };

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center h-10 flex-shrink-0">
            <Image
              src="/logos/diploy.png"
              alt="Diploy"
              width={140}
              height={40}
              className="object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-800 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthPage && !user ? (
              <Link href="/login" className="hidden sm:block">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2">
                  Masuk
                </Button>
              </Link>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border px-2 py-1.5 hover:bg-gray-50 transition">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoUrl || "/avatars/placeholder.png"}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>
                        {(user.name || "P").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-gray-800">
                      {user.name || "Pengguna"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    Pelatihan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthPage && !user && (
                <Link
                  href="/login"
                  className="px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Masuk
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}