import { Circle, Globe, Heart, Shield } from "lucide-react"
import { LANDING_VALUES } from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

const valueIcons = {
  heart: Heart,
  shield: Shield,
  globe: Globe,
} as const

export function LandingValues() {
  return (
    <section className="bg-[#080c14] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal className="text-center">
          <p className="landing-section-label inline-flex items-center">
            <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
            NOS VALEURS
          </p>
          <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
            Les piliers du tournoi
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {LANDING_VALUES.map((value, index) => {
            const Icon =
              valueIcons[value.icon as keyof typeof valueIcons] ?? Heart
            return (
              <ScrollReveal key={value.title} delay={index * 120}>
                <article className="landing-glass group flex h-full flex-col rounded-2xl p-8 transition-all hover:border-[#d4af37]/25 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37] transition-colors group-hover:bg-[#d4af37]/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="text-xl font-bold text-white">{value.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                    {value.description}
                  </p>
                  <div className="mt-6 border-t border-white/5 pt-5">
                    <p className="text-sm italic text-[#d4af37]/80">
                      &laquo; {value.verse} &raquo;
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      — {value.reference}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
