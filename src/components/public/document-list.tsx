import { Download, FileText } from "lucide-react"

interface DocumentItem {
  id: string
  title: string
  description?: string | null
  file_url: string
}

interface DocumentListProps {
  documents: DocumentItem[]
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="landing-glass rounded-2xl px-6 py-12 text-center">
        <p className="text-white/50">Aucun document disponible pour le moment.</p>
        <p className="mt-2 text-sm text-white/35">
          Le règlement officiel sera publié ici prochainement.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc) => (
        <article
          key={doc.id}
          className="landing-glass group rounded-2xl p-6 transition-all hover:border-[#d4af37]/25"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">{doc.title}</h2>
              {doc.description && (
                <p className="mt-2 text-sm text-white/50">{doc.description}</p>
              )}
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#d4af37] transition-colors hover:text-[#f0d060]"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
