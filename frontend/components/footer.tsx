"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram } from 'lucide-react'

export default function Footer() {
  const footerSections = [
    {
      title: "Untuk Talenta",
      links: [
        { label: "Fitur Talenta", href: "#" },
        { label: "Lowongan", href: "#" },
        { label: "Virtual Internship", href: "#" },
        { label: "Project", href: "#" },
        { label: "Masuk", href: "/login" },
      ],
    },
    {
      title: "Untuk Perusahaan",
      links: [
        { label: "Fitur Perusahaan", href: "#" },
        { label: "Masuk", href: "/login" },
        { label: "Pendaftaran", href: "/register" },
      ],
    },
    {
      title: "Tentang Kami",
      links: [
        { label: "Perusahaan", href: "#" },
        { label: "FAQ", href: "#" },
        { label: "Kontak", href: "#" },
      ],
    },
    {
      title: "Pranala",
      links: [
        { label: "Kementerian Komdigi", href: "https://kominfo.go.id", external: true },
        { label: "Badan Pengembangan SDM Komdigi", href: "https://bpsdm.kominfo.go.id", external: true },
        { label: "Digital Talent Scholarship", href: "https://digitaltalentscholarship.id", external: true },
      ],
    },
  ]

  return (
    <footer className="w-full bg-[#F9FAFB] border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Left column with logos and organization info */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <Image src="/logos/komdigi.png" alt="KOMDIGI" width={170} height={40} className="object-contain mb-4" />
              <p className="text-sm text-gray-700 leading-6">
                Badan Pengembangan SDM Komdigi
                <br />
                Kementerian Komunikasi dan Digital RI
                <br />
                Jl. Medan Merdeka Barat No.9, Jakarta Pusat
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Image src="/logos/dts.png" alt="Digital Talent" width={40} height={40} className="object-contain" />
                <span className="text-sm text-gray-700">Part of Digital Talent</span>
              </div>
            </div>
          </div>

          {/* Four link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors underline-offset-4 hover:underline font-medium"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {section.title === "Pranala" && (
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors underline-offset-4 hover:underline font-medium flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      Follow Us
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-6 border-gray-200" />
        <div className="text-center text-sm text-gray-600">
          <p>&copy; 2025 Kementerian Komunikasi dan Digital RI — Syarat &amp; Ketentuan | Pemberitahuan Privasi</p>
        </div>
      </div>
    </footer>
  )
}
