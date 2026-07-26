import Link from "next/link"
import { ArrowRight, Circle } from "lucide-react"
import { getAllMatches } from "@/lib/actions/matches"
import { MatchList } from "@/components/public/match-list"
import { ScrollReveal } from "@/components/landing/scroll-reveal"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { getDemoMatches } from "@/lib/demo-data"

export async function HomeMatchesBlock() {
  const allMatches = await getAllMatches()
  const upcoming = allMatches
    .filter((m) => m.status === "scheduled" || m.status === "in_progress")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 4)

  const recent = allMatches
    .filter((m) => m.status === "completed")
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 2)

  const matches =
    upcoming.length > 0
      ? upcoming
      : recent.length > 0
        ? recent
        : !isSupabaseConfigured()
          ? getDemoMatches()
          : []

  return (
    <div>
      <ScrollReveal>
        <p className="landing-section-label inline-flex items-center">
          <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
          PROCHAINS MATCHS
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Programme</h2>
          <Link
            href="/calendrier"
            className="inline-flex items-center gap-1 text-sm text-[#d4af37] hover:text-[#f0d060]"
          >
            Calendrier complet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="mt-10">
        <MatchList matches={matches} />
      </div>
    </div>
  )
}
