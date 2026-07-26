import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { SignupForm } from "@/components/auth/signup-form"
import { TournamentLogo } from "@/components/landing/tournament-logo"
import { TOURNAMENT } from "@/lib/constants"

export const metadata = {
  title: "Inscription",
}

export default function InscriptionPage() {
  return (
    <PublicShell>
      <PublicPageHeader
        label="INSCRIPTION"
        title="Inscrire mon équipe"
        description={`Créez votre compte coach pour participer au tournoi ${TOURNAMENT.edition}.`}
      />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12 md:py-16">
        <TournamentLogo size="md" withGlow className="mb-8" />
        <SignupForm />
      </main>
    </PublicShell>
  )
}
