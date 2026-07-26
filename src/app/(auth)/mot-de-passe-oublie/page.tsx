import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { TournamentLogo } from "@/components/landing/tournament-logo"

export const metadata = {
  title: "Mot de passe oublié",
}

export default function MotDePasseOubliePage() {
  return (
    <PublicShell>
      <PublicPageHeader
        label="CONNEXION"
        title="Mot de passe oublié"
        description="Recevez un lien sécurisé pour choisir un nouveau mot de passe."
      />
      <main className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 py-12 md:py-16">
        <TournamentLogo size="md" withGlow className="mb-0" />
        <ForgotPasswordForm />
      </main>
    </PublicShell>
  )
}
