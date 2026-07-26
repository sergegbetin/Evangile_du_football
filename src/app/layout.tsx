import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { TOURNAMENT } from "@/lib/constants"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: {
    default: `${TOURNAMENT.name} — ${TOURNAMENT.edition}`,
    template: `%s | ${TOURNAMENT.name}`,
  },
  description: `Plateforme officielle du tournoi ${TOURNAMENT.name}, ${TOURNAMENT.edition} à ${TOURNAMENT.venue}, ${TOURNAMENT.city}.`,
  keywords: ["football", "tournoi", "Kogoh", "Abomey-Calavi", "Godomey"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
