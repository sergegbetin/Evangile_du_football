"use client"

import { useEffect, useState } from "react"
import { Circle, Play, Target } from "lucide-react"
import {
  COUNTDOWN_TARGET,
  TIMELINE_EVENTS,
} from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

const EMPTY_TIME = { days: 0, hours: 0, minutes: 0, seconds: 0 }

const timelineIcons = {
  target: Target,
  play: Play,
} as const

export function LandingCountdown() {
  const [time, setTime] = useState(EMPTY_TIME)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    function updateTime() {
      const left = getTimeLeft(COUNTDOWN_TARGET)
      setTime(left)
      setIsExpired(COUNTDOWN_TARGET.getTime() <= Date.now())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const units = [
    { label: "JOURS", value: time.days },
    { label: "HEURES", value: time.hours },
    { label: "MINUTES", value: time.minutes },
    { label: "SECONDES", value: time.seconds },
  ]

  return (
    <section
      id="calendrier"
      className="relative overflow-hidden bg-[#080c14] py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,58,107,0.4)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <ScrollReveal className="text-center">
          <p className="landing-section-label inline-flex items-center">
            <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
            COMPTE À REBOURS
          </p>
          <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
            Le tournoi commence dans
          </h2>
          <p className="mt-3 text-white/50">
            Préparez-vous — chaque seconde compte
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150} className="mt-12">
          {isExpired ? (
            <div className="landing-glass mx-auto max-w-xl rounded-2xl px-6 py-8 text-center">
              <p className="text-xl font-semibold text-white">
                Le tournoi est en cours
              </p>
              <p className="mt-2 text-sm text-white/50">
                Consultez le calendrier pour suivre les matchs programmés et les
                résultats.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {units.map((unit, index) => (
                <div key={unit.label} className="flex items-center gap-3 md:gap-4">
                  <div className="landing-glass flex min-w-0 flex-1 basis-[calc(50%-0.75rem)] flex-col items-center rounded-2xl px-3 py-5 sm:min-w-[80px] sm:flex-none sm:px-6 md:min-w-[100px] md:px-8 md:py-6">
                    <span className="text-[clamp(1.75rem,8vw,3rem)] font-bold tabular-nums text-white md:text-5xl">
                      {pad(unit.value)}
                    </span>
                    <span className="mt-2 text-[10px] font-semibold tracking-[0.15em] text-white/40">
                      {unit.label}
                    </span>
                  </div>
                  {index < units.length - 1 && (
                    <span className="hidden text-2xl font-bold text-[#d4af37] md:inline">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {TIMELINE_EVENTS.map((event, index) => {
            const Icon =
              timelineIcons[event.icon as keyof typeof timelineIcons]
            return (
              <ScrollReveal key={event.title} delay={index * 120}>
                <div className="landing-glass group flex gap-5 rounded-2xl p-6 transition-colors hover:border-[#d4af37]/30">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37] transition-colors group-hover:bg-[#d4af37]/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-[#d4af37]">
                      {event.date}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {event.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
