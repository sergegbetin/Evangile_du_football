"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PublicShell } from "@/components/layout/public-shell"
import { TournamentLogo } from "@/components/landing/tournament-logo"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PublicShell>
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
        <TournamentLogo size="lg" className="mb-8" />
        <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
          Erreur
        </p>
        <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">
          Un problème est survenu
        </h1>
        <p className="mt-4 max-w-md text-white/50">
          Rechargez la page ou retournez à l&apos;accueil.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/20 px-8 py-3 font-semibold text-white transition-colors hover:border-[#d4af37]/40"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex rounded-full bg-gradient-to-r from-[#d4af37] to-[#c9a030] px-8 py-3 font-semibold text-[#050608]"
          >
            Accueil
          </Link>
        </div>
      </main>
    </PublicShell>
  )
}
