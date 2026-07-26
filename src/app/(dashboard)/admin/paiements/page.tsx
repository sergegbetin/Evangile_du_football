import { requireCommittee } from "@/lib/auth"
import { getApprovedTeams } from "@/lib/actions/teams"
import { getAllPayments, getAllTeamPaymentSummaries } from "@/lib/actions/payments"
import { AdminPaymentsPanel } from "@/components/admin/admin-payments-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Paiements — Admin",
}

export default async function AdminPaiementsPage() {
  await requireCommittee()
  const teams = await getApprovedTeams()
  const payments = await getAllPayments()
  const teamSummaries = await getAllTeamPaymentSummaries()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Gestion des paiements"
        description="Enregistrement manuel des versements en espèces auprès du comité. Les coaches signalent « J’ai réglé » ; vous confirmez ici pour générer le reçu."
      />
      <DashboardPanel>
        <AdminPaymentsPanel
          teams={teams.map((t) => ({ id: t.id, name: t.name }))}
          payments={payments}
          teamSummaries={teamSummaries}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
