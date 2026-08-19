import { CreditCard, Clock, Home, MessageSquare, Shield } from "lucide-react"
import { requireAuth, isCommitteeRole } from "@/lib/auth"
import { getCoachTeam, getSubmittedTeams } from "@/lib/actions/teams"
import { getCoachPaymentSummary, getAllPayments } from "@/lib/actions/payments"
import { getCoachClaims } from "@/lib/actions/claims"
import { getAllMatches, getCoachUpcomingMatch } from "@/lib/actions/matches"
import { getTeamRoster } from "@/lib/actions/roster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { HomeNextStepsList } from "@/components/dashboard/home-next-steps"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card"
import { TEAM_STATUS_LABELS, TOURNAMENT } from "@/lib/constants"
import { getHomeNextSteps } from "@/lib/home-next-steps"
import {
  formatTournamentDateTime,
  getPresenceRequiredMessage,
  TEAM_PAYMENT_STATUS_LABELS,
} from "@/lib/tournament-rules"

export const metadata = {
  title: "Tableau de bord",
}

export default async function DashboardPage() {
  const profile = await requireAuth()
  const isCommittee = isCommitteeRole(profile.role)

  if (isCommittee) {
    const [teams, payments, matches] = await Promise.all([
      getSubmittedTeams(),
      getAllPayments(),
      getAllMatches(),
    ])
    const submittedTeamCount = teams.filter((team) => team.status === "submitted").length
    const pendingCashCount = payments.filter((payment) => payment.status === "pending").length
    const now = Date.now()
    const needsCalendarAction =
      matches.length === 0
      || matches.some(
        (match) =>
          match.status === "in_progress"
          || (
            match.status === "scheduled"
            && new Date(match.scheduled_at).getTime() <= now
          )
      )
    const steps = getHomeNextSteps({
      role: "committee",
      teamStatus: null,
      photographedPlayerCount: 0,
      paymentStatus: "impaye",
      submittedTeamCount,
      pendingCashCount,
      needsCalendarAction,
    })

    return (
      <DashboardPageShell className="space-y-8">
        <DashboardPageHeader
          section="admin"
          title={`Bonjour, ${profile.full_name.split(" ")[0]}`}
          description="Voici ce que le comité peut traiter en priorité."
        />
        <HomeNextStepsList steps={steps} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardStatCard
            title="Inscriptions à valider"
            icon={Shield}
            href="/admin/equipes"
            linkLabel="Ouvrir"
          >
            <p className="text-3xl font-bold tracking-tight text-white">{submittedTeamCount}</p>
            <p className="mt-2 text-sm text-white/60">dossier(s) en attente</p>
          </DashboardStatCard>
          <DashboardStatCard
            title="Paiements à confirmer"
            icon={CreditCard}
            href="/admin/paiements"
            linkLabel="Ouvrir"
          >
            <p className="text-3xl font-bold tracking-tight text-white">{pendingCashCount}</p>
            <p className="mt-2 text-sm text-white/60">déclaration(s) en attente</p>
          </DashboardStatCard>
          <DashboardStatCard
            title="Calendrier"
            icon={Clock}
            href="/admin/calendrier"
            linkLabel="Ouvrir"
          >
            <p className="text-sm leading-relaxed text-white/70">
              {needsCalendarAction
                ? "Un match à planifier ou un score à saisir."
                : "Rien d’urgent sur le calendrier."}
            </p>
          </DashboardStatCard>
        </div>
      </DashboardPageShell>
    )
  }

  const team = await getCoachTeam()
  const [claims, roster] = await Promise.all([
    getCoachClaims(),
    team ? getTeamRoster(team.id) : Promise.resolve([]),
  ])
  const paymentSummary = team
    ? (await getCoachPaymentSummary())
    : null
  const pendingClaims = claims.filter((c) => c.status !== "decided").length
  const upcomingMatch = team ? await getCoachUpcomingMatch(team.id) : null
  const photographedPlayerCount = roster.filter(
    (member) => member.member_type === "player" && Boolean(member.photo_url)
  ).length
  const steps = getHomeNextSteps({
    role: "coach",
    teamStatus: team?.status ?? null,
    photographedPlayerCount,
    paymentStatus: paymentSummary?.status ?? "impaye",
    submittedTeamCount: 0,
    pendingCashCount: 0,
    needsCalendarAction: false,
  })

  return (
    <DashboardPageShell className="space-y-8">
      <DashboardPageHeader
        title={`Bonjour, ${profile.full_name.split(" ")[0]}`}
        description={`Bienvenue sur la plateforme ${TOURNAMENT.name}.`}
      />

      <HomeNextStepsList steps={steps} />

      {paymentSummary && paymentSummary.balanceFcfa > 0 && team && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-white">
          <CreditCard className="text-amber-300" aria-hidden />
          <AlertTitle className="text-white">Frais non soldés — règlement auprès du comité</AlertTitle>
          <AlertDescription className="text-white/80">
            Solde restant : {paymentSummary.balanceFcfa.toLocaleString("fr-FR")} FCFA.
            Les frais se paient en espèces auprès du comité. Suivi et reçus sur{" "}
            <ButtonLink
              href="/dashboard/paiements"
              variant="link"
              className="h-auto p-0 text-[#d4af37]"
            >
              Paiements
            </ButtonLink>
            .
          </AlertDescription>
        </Alert>
      )}

      {upcomingMatch && (
        <Alert className="border-[#d4af37]/30 bg-[#d4af37]/10 text-white">
          <Clock className="text-[#d4af37]" aria-hidden />
          <AlertTitle className="text-white">Prochain match</AlertTitle>
          <AlertDescription className="text-white/80">
            <p>{getPresenceRequiredMessage(upcomingMatch.scheduled_at)}</p>
            <p className="mt-1 text-sm text-white/60">
              {formatTournamentDateTime(upcomingMatch.scheduled_at)}
              {upcomingMatch.round ? ` — ${upcomingMatch.round}` : ""}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard title="Mon équipe" icon={Home} href="/dashboard/equipe" linkLabel="Gérer">
          {team ? (
            <>
              <p className="text-xl font-semibold text-white">{team.name}</p>
              <Badge
                className="mt-3 border-[#d4af37]/25 bg-[#d4af37]/10 text-[#f0d060] hover:bg-[#d4af37]/10"
                variant="secondary"
              >
                {TEAM_STATUS_LABELS[team.status] ?? team.status}
              </Badge>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-white/60">
              Aucune équipe inscrite. Commencez par enregistrer votre équipe.
            </p>
          )}
        </DashboardStatCard>

        <DashboardStatCard
          title="Paiements"
          icon={CreditCard}
          href="/dashboard/paiements"
          linkLabel="Détails"
        >
          <p className="text-3xl font-bold tracking-tight text-[#d4af37]">
            {(paymentSummary?.totalPaidFcfa ?? 0).toLocaleString("fr-FR")}{" "}
            <span className="text-lg font-medium text-white/60">FCFA</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                paymentSummary?.status === "paye"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : paymentSummary?.status === "en_attente"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                    : paymentSummary?.status === "partiel"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/[0.06] text-white/70"
              }
            >
              {paymentSummary
                ? TEAM_PAYMENT_STATUS_LABELS[paymentSummary.status]
                : "Pas encore d’équipe"}
            </Badge>
            {paymentSummary && (
              <span className="text-sm text-white/60">
                sur {paymentSummary.totalExpectedFcfa.toLocaleString("fr-FR")} FCFA
              </span>
            )}
          </div>
        </DashboardStatCard>

        <DashboardStatCard
          title="Réclamations"
          icon={MessageSquare}
          href="/dashboard/reclamations"
          linkLabel="Voir"
        >
          <p className="text-3xl font-bold tracking-tight text-white">{pendingClaims}</p>
          <p className="mt-2 text-sm text-white/60">dossier(s) en cours de traitement</p>
        </DashboardStatCard>
      </div>
    </DashboardPageShell>
  )
}
