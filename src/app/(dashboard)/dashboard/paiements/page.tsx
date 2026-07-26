import { getCoachPayments } from "@/lib/actions/payments"
import { getCoachTeam } from "@/lib/actions/teams"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"
import { computeTeamPaymentSummary, TEAM_PAYMENT_STATUS_LABELS } from "@/lib/tournament-rules"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  registration: "Frais d'inscription",
  participation: "Frais de participation",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
}

export const metadata = {
  title: "Paiements",
}

export default async function PaiementsCoachPage() {
  const team = await getCoachTeam()
  const payments = await getCoachPayments()
  const summary = computeTeamPaymentSummary(payments)

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Paiements"
        description="Consultez l'état de vos paiements enregistrés manuellement par le comité."
      />

      <DashboardPanel title="Récapitulatif">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-4xl font-bold tracking-tight text-[#d4af37]">
                {summary.totalPaidFcfa.toLocaleString("fr-FR")}{" "}
                <span className="text-xl font-semibold text-white/45">FCFA</span>
              </p>
              <Badge
                variant="secondary"
                className={
                  summary.status === "paye"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : summary.status === "partiel"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/[0.06] text-white/70"
                }
              >
                {TEAM_PAYMENT_STATUS_LABELS[summary.status]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-white/50">
              Total attendu : {summary.totalExpectedFcfa.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          {summary.balanceFcfa > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-white/40">Solde restant</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {summary.balanceFcfa.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          )}
        </div>
      </DashboardPanel>

      {!team ? (
        <DashboardPanel>
          <p className="text-white/50">Inscrivez d&apos;abord votre équipe.</p>
        </DashboardPanel>
      ) : (
        <DashboardPanel title="Historique des paiements" contentClassName="p-0 md:p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="px-5 text-white/40 md:px-6">Reçu</TableHead>
                <TableHead className="text-white/40">Type</TableHead>
                <TableHead className="text-white/40">Montant</TableHead>
                <TableHead className="text-white/40">Statut</TableHead>
                <TableHead className="px-5 text-white/40 md:px-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow className="border-white/[0.06]">
                  <TableCell colSpan={5} className="px-5 py-10 text-center text-white/45 md:px-6">
                    Aucun paiement enregistré pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="border-white/[0.06] hover:bg-white/[0.02]">
                    <TableCell className="px-5 font-mono text-sm text-white/80 md:px-6">
                      {payment.receipt_number}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {PAYMENT_TYPE_LABELS[payment.payment_type] ?? payment.payment_type}
                    </TableCell>
                    <TableCell className="font-medium text-white/90">
                      {payment.amount_fcfa.toLocaleString("fr-FR")} FCFA
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          payment.status === "confirmed"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/[0.06] text-white/70"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 text-white/55 md:px-6">
                      {payment.recorded_at
                        ? format(new Date(payment.recorded_at), "dd/MM/yyyy", { locale: fr })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DashboardPanel>
      )}
    </DashboardPageShell>
  )
}
