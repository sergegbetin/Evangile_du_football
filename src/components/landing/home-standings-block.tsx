import Link from "next/link"
import { ArrowRight, Circle } from "lucide-react"
import { getStandings } from "@/lib/actions/matches"
import { StandingsTable } from "@/components/public/standings-table"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { getDemoStandings } from "@/lib/demo-data"

export async function HomeStandingsBlock() {
  const liveStandings = await getStandings()
  const standings =
    liveStandings.length > 0
      ? liveStandings.slice(0, 6)
      : !isSupabaseConfigured()
        ? getDemoStandings().slice(0, 6)
        : []

  return (
    <div>
      <ScrollReveal>
        <p className="landing-section-label inline-flex items-center">
          <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
          CLASSEMENT
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Tableau des équipes
          </h2>
          <Link
            href="/classement"
            className="inline-flex items-center gap-1 text-sm text-[#d4af37] hover:text-[#f0d060]"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100} className="mt-10">
        <StandingsTable standings={standings} compact />
      </ScrollReveal>
    </div>
  )
}
