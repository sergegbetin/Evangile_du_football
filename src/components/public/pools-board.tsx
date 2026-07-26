import { TeamBadge } from "@/components/public/team-badge"
import { getPoolTeams, type PoolId } from "@/lib/pool-data"

const POOLS: { id: PoolId; title: string }[] = [
  { id: "A", title: "Poule A" },
  { id: "B", title: "Poule B" },
]

export function PoolsBoard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {POOLS.map((pool) => {
        const teams = getPoolTeams(pool.id)
        return (
          <section
            key={pool.id}
            className="landing-glass rounded-2xl p-6"
            aria-labelledby={`pool-${pool.id}-title`}
          >
            <h3
              id={`pool-${pool.id}-title`}
              className="text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37]"
            >
              {pool.title}
            </h3>
            <ol className="mt-5 space-y-4">
              {teams.map((team, index) => (
                <li
                  key={team.name}
                  className="flex items-start gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <span className="mt-2 w-6 shrink-0 text-sm font-semibold text-white/40">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <TeamBadge name={team.name} />
                    <p className="mt-1 text-xs text-white/45">{team.church}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
