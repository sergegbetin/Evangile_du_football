import { Shield, Trophy } from "lucide-react"

export interface StandingRow {
  teamId: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface StandingsTableProps {
  standings: StandingRow[]
  compact?: boolean
}

export function StandingsTable({ standings, compact = false }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="landing-glass rounded-2xl px-6 py-12 text-center">
        <p className="text-white/50">Aucun résultat enregistré pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="landing-glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[10px] font-semibold tracking-widest text-white/40">
              <th className="px-6 py-4">#</th>
              <th className="px-4 py-4">ÉQUIPE</th>
              {!compact && <th className="px-3 py-4 text-center">J</th>}
              <th className="px-3 py-4 text-center">V</th>
              <th className="px-3 py-4 text-center">N</th>
              <th className="px-3 py-4 text-center">D</th>
              {!compact && (
                <>
                  <th className="px-3 py-4 text-center">BP</th>
                  <th className="px-3 py-4 text-center">BC</th>
                  <th className="px-3 py-4 text-center">DIFF</th>
                </>
              )}
              <th className="px-6 py-4 text-right">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => {
              const rank = index + 1
              return (
                <tr
                  key={team.teamId}
                  className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                    rank === 1 ? "border-l-2 border-l-[#d4af37] bg-[#d4af37]/5" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-medium text-white/70">
                      {rank === 1 && <Trophy className="h-4 w-4 text-[#d4af37]" />}
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <Shield className="h-4 w-4 text-[#d4af37]/60" />
                      {team.name}
                    </span>
                  </td>
                  {!compact && (
                    <td className="px-3 py-4 text-center text-white/70">{team.played}</td>
                  )}
                  <td className="px-3 py-4 text-center text-white/70">{team.won}</td>
                  <td className="px-3 py-4 text-center text-white/70">{team.drawn}</td>
                  <td className="px-3 py-4 text-center text-white/70">{team.lost}</td>
                  {!compact && (
                    <>
                      <td className="px-3 py-4 text-center text-white/70">{team.goalsFor}</td>
                      <td className="px-3 py-4 text-center text-white/70">{team.goalsAgainst}</td>
                      <td className="px-3 py-4 text-center text-white/70">
                        {team.goalsFor - team.goalsAgainst}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right font-bold text-[#d4af37]">
                    {team.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
