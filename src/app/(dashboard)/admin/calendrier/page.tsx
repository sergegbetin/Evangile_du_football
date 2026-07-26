import { requireCommittee } from "@/lib/auth"
import { getApprovedTeams } from "@/lib/actions/teams"
import { getAllMatches } from "@/lib/actions/matches"
import { AdminCalendarPanel } from "@/components/admin/admin-calendar-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Calendrier — Admin",
}

export default async function AdminCalendrierPage() {
  await requireCommittee()
  const teams = await getApprovedTeams()
  const matches = await getAllMatches()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Gestion du calendrier"
        description="Programmez les matchs et saisissez les scores."
      />
      <DashboardPanel>
        <AdminCalendarPanel
          teams={teams.map((t) => ({ id: t.id, name: t.name }))}
          matches={matches}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
