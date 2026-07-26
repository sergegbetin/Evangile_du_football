import { Circle, Star } from "lucide-react"
import { LANDING_PARTNERS } from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function LandingPartners() {
  return (
    <section className="bg-[#080c14] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal className="text-center">
          <p className="landing-section-label inline-flex items-center">
            <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
            PARTENAIRES
          </p>
          <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
            Ils nous font confiance
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_PARTNERS.map((partner, index) => (
            <ScrollReveal key={partner.name} delay={index * 80}>
              <div className="landing-glass flex items-start gap-4 rounded-2xl p-6 transition-colors hover:border-[#d4af37]/20">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <Star className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-bold text-white">{partner.name}</h3>
                  <p className="mt-1 text-sm text-white/45">{partner.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
