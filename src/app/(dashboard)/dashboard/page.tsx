import { CreditCard, Clock, Home, MessageSquare, Shield } from "lucide-react"
import { requireAuth, isCommitteeRole } from "@/lib/auth"
import { getCoachTeam } from "@/lib/actions/teams"
import { getCoachPaymentSummary } from "@/lib/actions/payments"
import { getCoachClaims } from "@/lib/actions/claims"
import { getCoachUpcomingMatch } from "@/lib/actions/matches"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card"
import { TEAM_STATUS_LABELS, TOURNAMENT } from "@/lib/constants"
import {
  getPresenceRequiredMessage,
  TEAM_PAYMENT_STATUS_LABELS,
} from "@/lib/tournament-rules"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export const metadata = {
  title: "Tableau de bord",
}

export default async function DashboardPage() {
  const profile = await requireAuth()
  const team = await getCoachTeam()
  const claims = await getCoachClaims()
  const isCommittee = isCommitteeRole(profile.role)
  const paymentSummary = (await getCoachPaymentSummary()) ?? {
    totalPaidFcfa: 0,
    totalExpectedFcfa: TOURNAMENT.totalFeeFcfa,
    balanceFcfa: TOURNAMENT.totalFeeFcfa,
    status: "impaye" as const,
  }
  const pendingClaims = claims.filter((c) => c.status !== "decided").length
  const upcomingMatch = team ? await getCoachUpcomingMatch(team.id) : null

  return (
    <DashboardPageShell className="space-y-8">
      <DashboardPageHeader
        title={`Bonjour, ${profile.full_name.split(" ")[0]}`}
        description={`Bienvenue sur la plateforme ${TOURNAMENT.name}.`}
      />

      {paymentSummary.balanceFcfa > 0 && team && (
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
              {format(new Date(upcomingMatch.scheduled_at), "EEEE d MMMM yyyy 'à' HH'h'mm", {
                locale: fr,
              })}
              {upcomingMatch.round ? ` — ${upcomingMatch.round}` : ""}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {isCommittee && (
        <DashboardPanel
          title="Accès administration"
          description="Raccourcis vers les outils du comité d'organisation."
        >
          <div className="flex flex-wrap gap-3">
            <ButtonLink
              href="/admin/equipes"
              className="bg-[#d4af37] text-[#050608] hover:bg-[#c9a030]"
            >
              Valider les équipes
            </ButtonLink>
            <ButtonLink
              href="/admin/paiements"
              variant="outline"
              className="border-white/10 text-white hover:bg-white/[0.04]"
            >
              Enregistrer paiements
            </ButtonLink>
            <ButtonLink
              href="/admin/calendrier"
              variant="outline"
              className="border-white/10 text-white hover:bg-white/[0.04]"
            >
              Gérer le calendrier
            </ButtonLink>
          </div>
        </DashboardPanel>
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
            {paymentSummary.totalPaidFcfa.toLocaleString("fr-FR")}{" "}
            <span className="text-lg font-medium text-white/60">FCFA</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                paymentSummary.status === "paye"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : paymentSummary.status === "en_attente"
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                    : paymentSummary.status === "partiel"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/[0.06] text-white/70"
              }
            >
              {TEAM_PAYMENT_STATUS_LABELS[paymentSummary.status]}
            </Badge>
            <span className="text-sm text-white/60">
              sur {paymentSummary.totalExpectedFcfa.toLocaleString("fr-FR")} FCFA
            </span>
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

      {isCommittee && (
        <DashboardPanel
          title="Vue comité"
          description="Vous pouvez aussi accéder à l'administration depuis le menu latéral."
          contentClassName="flex items-start gap-3 text-sm text-white/60"
        >
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" aria-hidden />
          <p>
            Les sections <strong className="font-medium text-white/80">Administration</strong>{" "}
            regroupent la validation des équipes, les paiements, le calendrier et les documents
            officiels.
          </p>
        </DashboardPanel>
      )}
    </DashboardPageShell>
  )
}
