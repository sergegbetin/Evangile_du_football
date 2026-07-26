import { getStandings } from "@/lib/actions/matches"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { PoolsBoard } from "@/components/public/pools-board"
import { StandingsTable } from "@/components/public/standings-table"

export const metadata = {
  title: "Poules & classement",
}

export const revalidate = 60

export default async function ClassementPage() {
  const standings = await getStandings()

  return (
    <PublicShell>
      <PublicPageHeader
        label="POULES & CLASSEMENT"
        title="Poules et tableau des équipes"
        description="Répartition officielle des poules A et B, puis classement général — 3 points par victoire, 1 point par match nul."
      />
      <main className="mx-auto max-w-6xl space-y-14 px-4 py-12 md:py-16">
        <section id="poules" aria-labelledby="poules-heading" className="scroll-mt-24">
          <h2 id="poules-heading" className="mb-6 text-xl font-semibold text-white">
            Poules
          </h2>
          <PoolsBoard />
        </section>

        <section id="classement" aria-labelledby="classement-heading" className="scroll-mt-24">
          <h2 id="classement-heading" className="mb-6 text-xl font-semibold text-white">
            Classement
          </h2>
          <StandingsTable standings={standings} />
        </section>
      </main>
    </PublicShell>
  )
}
