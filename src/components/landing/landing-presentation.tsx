import Image from "next/image"
import { Check, Circle, Users } from "lucide-react"
import { LANDING_CHECKPOINTS } from "@/lib/landing-data"
import { TOURNAMENT } from "@/lib/constants"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function LandingPresentation() {
  return (
    <section id="tournoi" className="bg-[#050608] py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal>
          <p className="landing-section-label inline-flex items-center">
            <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
            POURQUOI CE TOURNOI ?
          </p>
          <h2 className="mt-6 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            Le football comme{" "}
            <span className="landing-text-gold">outil d&apos;évangélisation</span>
          </h2>
          <p className="mt-6 leading-relaxed text-white/60">
            Le tournoi « L&apos;Évangile selon le Football » réunit des
            croyants autour du sport pour partager la Bonne Nouvelle avec
            passion, respect et fraternité chrétienne.
          </p>
          <p className="mt-4 leading-relaxed text-white/60">
            Organisé durant les vacances scolaires à {TOURNAMENT.venue},{" "}
            {TOURNAMENT.city}, ce Petit Camp inter-églises évangéliques
            accueille {TOURNAMENT.maxTeams} équipes en football à 6 joueurs.
          </p>
          <ul className="mt-8 space-y-4">
            {LANDING_CHECKPOINTS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37]">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={150} className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80"
              alt="Équipe de football sur le terrain"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/60 to-transparent" />
          </div>

          <div className="landing-glass absolute -right-2 top-6 flex items-center gap-2 rounded-full px-4 py-2 md:-right-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050608] bg-[#d4af37]/20"
                >
                  <Users className="h-3.5 w-3.5 text-[#d4af37]" />
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-[#d4af37]">
              +120 joueurs
            </span>
          </div>

          <div className="landing-glass absolute -bottom-4 -left-2 rounded-2xl p-5 md:-left-6">
            <p className="text-4xl font-bold text-[#d4af37]">98%</p>
            <p className="mt-1 text-sm text-white/60">
              Satisfaction des participants
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
