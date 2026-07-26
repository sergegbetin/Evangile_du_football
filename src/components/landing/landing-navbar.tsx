"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Trophy, X } from "lucide-react"
import { TournamentLogo } from "@/components/landing/tournament-logo"

const navLinks = [
  { href: "/#tournoi", label: "Tournoi" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/classement#poules", label: "Poules" },
  { href: "/classement", label: "Classement" },
  { href: "/documents", label: "Documents" },
  { href: "/aide", label: "Aide" },
  { href: "/#contact", label: "Contact" },
]

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050608]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <TournamentLogo size="sm" />
          <div className="leading-tight">
            <span className="block text-sm font-bold text-white">L&apos;Évangile</span>
            <span className="block text-[11px] text-white/50">selon le Football</span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-[#d4af37]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/connexion"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a030] px-5 py-2.5 text-sm font-semibold text-[#050608] transition-transform hover:scale-105"
          >
            <Trophy className="h-4 w-4" aria-hidden />
            S&apos;inscrire
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/5 bg-[#050608] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-white/80"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/connexion"
              className="py-2 text-white/80"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#d4af37] py-3 font-semibold text-[#050608]"
              onClick={() => setIsOpen(false)}
            >
              <Trophy className="h-4 w-4" />
              S&apos;inscrire
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
