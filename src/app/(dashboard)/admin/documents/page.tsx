import { requireCommittee } from "@/lib/auth"
import { getAllDocuments } from "@/lib/actions/documents"
import { AdminDocumentsPanel } from "@/components/admin/admin-documents-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Documents — Admin",
}

export default async function AdminDocumentsPage() {
  await requireCommittee()
  const documents = await getAllDocuments()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Gestion des documents"
        description="Publiez le règlement, les communiqués et autres documents officiels."
      />
      <DashboardPanel>
        <AdminDocumentsPanel documents={documents} />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
