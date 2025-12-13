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
        url: '/logoDTS.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logoDTS.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logoDTS.png',
        type: 'image/png',
      },
    ],
    apple: '/logoDTS.png',
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