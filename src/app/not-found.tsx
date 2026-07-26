import Link from "next/link"
import { PublicShell } from "@/components/layout/public-shell"
import { TournamentLogo } from "@/components/landing/tournament-logo"

export default function NotFound() {
  return (
    <PublicShell>
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
        <TournamentLogo size="lg" withGlow className="mb-8" />
        <p className="text-sm font-semibold uppercase tracking-widest text-[#d4af37]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">
          Page introuvable
        </h1>
        <p className="mt-4 max-w-md text-white/50">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a030] px-8 py-3 font-semibold text-[#050608] transition-transform hover:scale-105"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    </PublicShell>
  )
}
