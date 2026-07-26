import { CreditCard, Home, MessageSquare, Shield } from "lucide-react"
import { requireAuth, isCommitteeRole } from "@/lib/auth"
import { getCoachTeam } from "@/lib/actions/teams"
import { getCoachPayments } from "@/lib/actions/payments"
import { getCoachClaims } from "@/lib/actions/claims"
import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"
import { DashboardStatCard } from "@/components/layout/dashboard-stat-card"
import { TEAM_STATUS_LABELS, TOURNAMENT } from "@/lib/constants"
import { computeTeamPaymentSummary, TEAM_PAYMENT_STATUS_LABELS } from "@/lib/tournament-rules"

export const metadata = {
  title: "Tableau de bord",
}

export default async function DashboardPage() {
  const profile = await requireAuth()
  const team = await getCoachTeam()
  const payments = await getCoachPayments()
  const claims = await getCoachClaims()
  const isCommittee = isCommitteeRole(profile.role)
  const paymentSummary = computeTeamPaymentSummary(payments)
  const pendingClaims = claims.filter((c) => c.status !== "decided").length

  return (
    <DashboardPageShell className="space-y-8">
      <DashboardPageHeader
        title={`Bonjour, ${profile.full_name.split(" ")[0]}`}
        description={`Bienvenue sur la plateforme ${TOURNAMENT.name}.`}
      />

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
            <p className="text-sm leading-relaxed text-white/45">
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
            <span className="text-lg font-medium text-white/45">FCFA</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={
                paymentSummary.status === "paye"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.06] text-white/70"
              }
            >
              {TEAM_PAYMENT_STATUS_LABELS[paymentSummary.status]}
            </Badge>
            <span className="text-sm text-white/45">
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
          <p className="mt-2 text-sm text-white/50">dossier(s) en cours de traitement</p>
        </DashboardStatCard>
      </div>

      {isCommittee && (
        <DashboardPanel
          title="Vue comité"
          description="Vous pouvez aussi accéder à l'administration depuis le menu latéral."
          contentClassName="flex items-start gap-3 text-sm text-white/55"
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
