import { getStandings } from "@/lib/actions/matches"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { StandingsTable } from "@/components/public/standings-table"

export const metadata = {
  title: "Classement",
}

export const revalidate = 60

export default async function ClassementPage() {
  const standings = await getStandings()

  return (
    <PublicShell>
      <PublicPageHeader
        label="CLASSEMENT"
        title="Tableau des équipes"
        description="Classement général du tournoi — 3 points par victoire, 1 point par match nul."
      />
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <StandingsTable standings={standings} />
      </main>
    </PublicShell>
  )
}
