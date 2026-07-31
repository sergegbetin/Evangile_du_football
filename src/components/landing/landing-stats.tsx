"use client"

import { LANDING_STATS } from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

function StatBlock({
  value,
  suffix,
  label,
}: {
  value: number
  suffix: string
  label: string
}) {
  return (
    <div className="text-center">
      <p className="text-[clamp(2rem,10vw,3.75rem)] font-bold text-[#d4af37] md:text-6xl">
        {value}
        {suffix}
      </p>
      <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-white/50">
        {label}
      </p>
    </div>
  )
}

export function LandingStats() {
  return (
    <section id="stats" className="border-y border-white/5 bg-[#050608] py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-4 md:grid-cols-4 md:gap-6">
        {LANDING_STATS.map((stat, index) => (
          <ScrollReveal key={stat.label} delay={index * 100}>
            <StatBlock
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
