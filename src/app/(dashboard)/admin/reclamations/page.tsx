import { requireCommittee } from "@/lib/auth"
import { getAllClaims } from "@/lib/actions/claims"
import { AdminClaimsPanel } from "@/components/admin/admin-claims-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Réclamations — Admin",
}

export default async function AdminReclamationsPage() {
  await requireCommittee()
  const claims = await getAllClaims()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Traitement des réclamations"
        description="Instruction et décision des réclamations soumises."
      />
      <DashboardPanel>
        <AdminClaimsPanel claims={claims} />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
