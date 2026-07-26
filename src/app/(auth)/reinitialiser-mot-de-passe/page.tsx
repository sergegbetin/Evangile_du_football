import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { TournamentLogo } from "@/components/landing/tournament-logo"

export const metadata = {
  title: "Réinitialiser le mot de passe",
}

export default function ReinitialiserMotDePassePage() {
  return (
    <PublicShell>
      <PublicPageHeader
        label="CONNEXION"
        title="Réinitialiser le mot de passe"
        description="Vous êtes authentifié via le lien reçu par e-mail. Choisissez un nouveau mot de passe."
      />
      <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-12 md:py-16">
        <TournamentLogo size="md" withGlow className="mb-0" />
        <ResetPasswordForm />
      </main>
    </PublicShell>
  )
}
