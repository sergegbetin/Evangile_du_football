import { getCoachTeam } from "@/lib/actions/teams"
import { getTeamRoster } from "@/lib/actions/roster"
import { getTeamFirstMatchAt } from "@/lib/actions/teams"
import { RosterManager } from "@/components/dashboard/roster-manager"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"
import { isRosterLocked } from "@/lib/tournament-rules"

export const metadata = {
  title: "Effectif",
}

export default async function EffectifPage() {
  const team = await getCoachTeam()
  const members = await getTeamRoster(team?.id)
  const firstMatchAt = team ? await getTeamFirstMatchAt(team.id) : null
  const rosterLocked = team ? isRosterLocked(team, firstMatchAt) : false

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Effectif"
        description="Gérez les joueurs et le staff de votre équipe."
      />
      <DashboardPanel>
        <RosterManager
          team={team}
          members={members}
          rosterLocked={rosterLocked}
          firstMatchAt={firstMatchAt}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
