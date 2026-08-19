"use client"

import Link from "next/link"
import { ChevronDown, Play, Sparkles, Trophy } from "lucide-react"
import { TournamentLogo } from "@/components/landing/tournament-logo"
import { TOURNAMENT } from "@/lib/constants"

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${8 + i * 7.5}%`,
  top: `${20 + (i % 4) * 18}%`,
  delay: `${i * 0.4}s`,
  size: i % 3 === 0 ? 4 : 2,
}))

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--public-navy,#1A3A6B)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A6B] via-[#0c1a33] to-[#050608]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,transparent_60%)]" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="animate-float-particle absolute rounded-full bg-[#d4af37]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-medium tracking-widest text-[#d4af37]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          ÉDITION 2026 — TOURNOI OFFICIEL
        </div>

        <div className="mx-auto mb-8 flex justify-center">
          <TournamentLogo size="lg" withGlow className="rounded-2xl" />
        </div>

        <h1 className="text-[clamp(2rem,8vw,5rem)] font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
          L&apos;Évangile
          <br />
          <span className="landing-text-gold">selon le Football</span>
        </h1>

        <p className="mt-6 text-lg tracking-[0.3em] text-white/60 md:text-xl">
          Jouer <span className="text-[#d4af37]">•</span> Annoncer{" "}
          <span className="text-[#d4af37]">•</span> Édifier
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm text-white/40">
          {TOURNAMENT.edition} — {TOURNAMENT.venue}, {TOURNAMENT.city}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/inscription"
            className="landing-gold-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a030] px-8 py-4 text-base font-bold text-[#050608] transition-transform hover:scale-105"
          >
            <Trophy className="h-5 w-5" aria-hidden />
            Inscrire une équipe
          </Link>
          <Link
            href="/calendrier"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-colors hover:border-[#d4af37]/40 hover:bg-white/10"
          >
            <Play className="h-5 w-5 fill-white" aria-hidden />
            Voir le calendrier
          </Link>
        </div>
      </div>

      <Link
        href="#stats"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 transition-colors hover:text-[#d4af37]"
        aria-label="Défiler vers le bas"
      >
        <ChevronDown className="h-8 w-8 animate-scroll-bounce" />
      </Link>
    </section>
  )
}
