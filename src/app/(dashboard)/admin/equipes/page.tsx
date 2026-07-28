import { requireCommittee } from "@/lib/auth"
import { getSubmittedTeamsWithRoster, getUnassignedCoaches } from "@/lib/actions/teams"
import { AdminTeamsPanel } from "@/components/admin/admin-teams-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Validation équipes",
}

export default async function AdminEquipesPage() {
  await requireCommittee()
  const [teams, unassignedCoaches] = await Promise.all([
    getSubmittedTeamsWithRoster(),
    getUnassignedCoaches(),
  ])

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Validation des équipes"
        description="Approuvez ou refusez les dossiers soumis par les coaches. Rattachez chaque équipe à son vrai compte coach."
      />
      <DashboardPanel>
        <AdminTeamsPanel teams={teams} unassignedCoaches={unassignedCoaches} />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
