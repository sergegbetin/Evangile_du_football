import { getCoachTeam } from "@/lib/actions/teams"
import { getTeamRoster } from "@/lib/actions/roster"
import { TeamForm } from "@/components/dashboard/team-form"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Mon équipe",
}

export default async function EquipePage() {
  const team = await getCoachTeam()
  const members = team ? await getTeamRoster(team.id) : []
  const players = members.filter((m) => m.member_type === "player")
  // Décision comité : la photo est requise pour tout l'effectif.
  const membersMissingPhoto = members.filter((m) => !m.photo_url).length

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Mon équipe"
        description="Inscrivez et soumettez votre équipe pour validation par le comité."
      />
      <DashboardPanel>
        <TeamForm
          team={team}
          playerCount={players.length}
          membersMissingPhoto={membersMissingPhoto}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
