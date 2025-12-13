import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DTP KOMDIGI',
  description: 'Mapping level kompetensi user',
  icons: {
    icon: [
      {
        url: '/DTS-logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/DTS-logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/DTS-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/DTS-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}