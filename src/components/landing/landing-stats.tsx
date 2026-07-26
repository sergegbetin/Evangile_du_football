"use client"

import { useEffect, useRef, useState } from "react"
import { LANDING_STATS } from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

function AnimatedStat({
  value,
  suffix,
  label,
}: {
  value: number
  suffix: string
  label: string
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true

        const duration = 1500
        const start = performance.now()

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-bold text-[#d4af37] md:text-6xl">
        {display}
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
            <AnimatedStat
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
