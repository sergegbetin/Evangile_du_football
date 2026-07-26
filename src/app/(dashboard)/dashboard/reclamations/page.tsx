import { getCoachClaims, getClaimableMatches } from "@/lib/actions/claims"
import { getCoachTeam } from "@/lib/actions/teams"
import { ClaimsPanel } from "@/components/dashboard/claims-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"
import { TOURNAMENT } from "@/lib/constants"

export const metadata = {
  title: "Réclamations",
}

export default async function ReclamationsCoachPage() {
  const team = await getCoachTeam()
  const claims = await getCoachClaims()
  const claimableMatches = await getClaimableMatches()

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Réclamations"
        description="Soumettez une réclamation au comité d'organisation."
      />
      <DashboardPanel>
        <ClaimsPanel
          claims={claims}
          hasTeam={!!team && team.status === "approved"}
          claimableMatches={claimableMatches}
          claimDeadlineHours={TOURNAMENT.claimDeadlineHours}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
