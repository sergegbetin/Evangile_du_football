import { requireCommittee } from "@/lib/auth"
import { getSubmittedTeamsWithRoster } from "@/lib/actions/teams"
import { AdminTeamsPanel } from "@/components/admin/admin-teams-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Validation équipes",
}

export default async function AdminEquipesPage() {
  await requireCommittee()
  const teams = await getSubmittedTeamsWithRoster()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Validation des équipes"
        description="Approuvez ou refusez les dossiers soumis par les coaches. Consultez l'effectif avant de valider."
      />
      <DashboardPanel>
        <AdminTeamsPanel teams={teams} />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
