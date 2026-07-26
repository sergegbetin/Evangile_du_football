import { getPublicDocuments } from "@/lib/actions/documents"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { DocumentList } from "@/components/public/document-list"

export const metadata = {
  title: "Documents",
}

export const revalidate = 120

export default async function DocumentsPage() {
  const documents = await getPublicDocuments()

  return (
    <PublicShell>
      <PublicPageHeader
        label="DOCUMENTS"
        title="Documents officiels"
        description="Règlement, formulaires et communiqués du tournoi."
      />
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <DocumentList documents={documents} />
      </main>
    </PublicShell>
  )
}
