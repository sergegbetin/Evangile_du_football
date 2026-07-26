import { getAllMatches } from "@/lib/actions/matches"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { MatchList } from "@/components/public/match-list"

export const metadata = {
  title: "Calendrier",
}

export const revalidate = 60

export default async function CalendrierPage() {
  const matches = await getAllMatches()

  return (
    <PublicShell>
      <PublicPageHeader
        label="CALENDRIER"
        title="Calendrier des matchs"
        description="Tous les matchs programmés, en cours et terminés du tournoi."
      />
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <MatchList matches={matches} />
      </main>
    </PublicShell>
  )
}
