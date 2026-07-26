import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { MatchWithTeams } from "@/types/database"
import { getPresenceRequiredMessage } from "@/lib/tournament-rules"

const statusLabels: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Programmé", className: "text-white/50 bg-white/5" },
  in_progress: { label: "En direct", className: "text-red-400 bg-red-500/10 border-red-500/30" },
  completed: { label: "Terminé", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  postponed: { label: "Reporté", className: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  cancelled: { label: "Annulé", className: "text-white/40 bg-white/5" },
}

interface MatchListProps {
  matches: MatchWithTeams[]
  emptyMessage?: string
}

function getTeamName(team: { name: string } | { name: string }[] | null | undefined) {
  if (!team) return "—"
  if (Array.isArray(team)) return team[0]?.name ?? "—"
  return team.name
}

export function MatchList({
  matches,
  emptyMessage = "Aucun match programmé pour le moment.",
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="landing-glass rounded-2xl px-6 py-12 text-center">
        <p className="text-white/50">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const homeName = getTeamName(match.home_team as { name: string } | null)
        const awayName = getTeamName(match.away_team as { name: string } | null)
        const status = statusLabels[match.status] ?? statusLabels.scheduled
        const isLive = match.status === "in_progress"
        const hasScore =
          match.status === "completed" &&
          match.home_score !== null &&
          match.away_score !== null

        return (
          <article
            key={match.id}
            className={`landing-glass rounded-2xl p-6 transition-all hover:border-[#d4af37]/20 ${
              isLive ? "border-red-500/30 ring-1 ring-red-500/20" : ""
            }`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${status.className}`}
              >
                {isLive && (
                  <span className="relative mr-2 flex h-2 w-2 self-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
                {status.label}
              </span>
              {match.round && (
                <span className="text-xs text-white/40">{match.round}</span>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex flex-1 items-center justify-end gap-3 text-right">
                <span className="font-semibold text-white">{homeName}</span>
              </div>

              <div className="flex shrink-0 flex-col items-center px-4">
                {hasScore ? (
                  <span className="text-3xl font-bold text-white">
                    {match.home_score}
                    <span className="mx-2 text-white/30">-</span>
                    {match.away_score}
                  </span>
                ) : (
                  <span className="rounded-lg bg-white/5 px-4 py-1 text-sm font-bold text-white/40">
                    VS
                  </span>
                )}
              </div>

              <div className="flex flex-1 items-center gap-3">
                <span className="font-semibold text-white">{awayName}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-white/5 pt-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(match.scheduled_at), "EEEE d MMMM yyyy", { locale: fr })}
              </span>
              <span>{format(new Date(match.scheduled_at), "HH:mm", { locale: fr })}</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {match.venue}
              </span>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[#d4af37]/80">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {getPresenceRequiredMessage(match.scheduled_at)}
            </p>
          </article>
        )
      })}
    </div>
  )
}
