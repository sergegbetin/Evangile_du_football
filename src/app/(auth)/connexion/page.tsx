import { Suspense } from "react"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { LoginForm } from "@/components/auth/login-form"
import { PreviewExplorerLinks } from "@/components/auth/preview-explorer-links"
import { TournamentLogo } from "@/components/landing/tournament-logo"

export const metadata = {
  title: "Connexion",
}

export default function ConnexionPage() {
  return (
    <PublicShell>
      <PublicPageHeader
        label="CONNEXION"
        title="Espace coach & comité"
        description="Connectez-vous pour gérer votre équipe, consulter vos paiements et soumettre des réclamations."
      />
      <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-12 md:py-16">
        <PreviewExplorerLinks />
        <TournamentLogo size="md" withGlow className="mb-0" />
        <Suspense
          fallback={
            <div className="landing-glass w-full rounded-2xl px-6 py-12 text-center text-white/50">
              Chargement...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </PublicShell>
  )
}
