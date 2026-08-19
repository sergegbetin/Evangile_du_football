"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { recordPayment, updatePaymentStatus } from "@/lib/actions/payments"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_AMOUNTS } from "@/lib/validations/payment"
import { TOURNAMENT } from "@/lib/constants"
import { TEAM_PAYMENT_STATUS_LABELS, type TeamPaymentSummary } from "@/lib/tournament-rules"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { PaymentWithTeam } from "@/types/database"

interface TeamOption {
  id: string
  name: string
}

interface AdminPaymentsPanelProps {
  teams: TeamOption[]
  payments: PaymentWithTeam[]
  teamSummaries: Record<string, TeamPaymentSummary>
}

const TYPE_LABELS: Record<string, string> = {
  registration: "Inscription",
  participation: "Participation",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
}

export function AdminPaymentsPanel({ teams, payments, teamSummaries }: AdminPaymentsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<"registration" | "participation">("registration")
  const [teamId, setTeamId] = useState("")

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const otherPayments = payments.filter((p) => p.status !== "pending")
  const orderedPayments = [...pendingPayments, ...otherPayments]

  const teamsWithBalance = teams.filter((team) => {
    const summary = teamSummaries[team.id]
    return summary ? summary.balanceFcfa > 0 : true
  })

  async function handleRecord(formData: FormData) {
    setError(null)
    setSuccess(null)
    formData.set("team_id", teamId)
    formData.set("payment_type", paymentType)
    formData.set("amount_fcfa", String(PAYMENT_AMOUNTS[paymentType]))
    formData.set("status", "confirmed")
    const result = await recordPayment(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Paiement enregistré")
      setTeamId("")
      router.refresh()
    }
  }

  async function handleCancel(paymentId: string) {
    if (!window.confirm("Annuler ce paiement ?")) return
    setError(null)
    setSuccess(null)
    const formData = new FormData()
    formData.set("payment_id", paymentId)
    formData.set("status", "cancelled")
    const result = await updatePaymentStatus(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Paiement annulé")
      router.refresh()
    }
  }

  async function handleConfirm(paymentId: string) {
    setError(null)
    setSuccess(null)
    const formData = new FormData()
    formData.set("payment_id", paymentId)
    formData.set("status", "confirmed")
    const result = await updatePaymentStatus(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Paiement confirmé")
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {teamsWithBalance.length > 0 && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-white">
          <AlertDescription className="text-white/85">
            Frais non soldés — règlement auprès du comité :{" "}
            {teamsWithBalance
              .map((team) => {
                const summary = teamSummaries[team.id]!
                const label =
                  summary.status === "en_attente"
                    ? `${team.name} (en attente de confirmation)`
                    : team.name
                return label
              })
              .join(", ")}
            .
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enregistrer un paiement manuel</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleRecord} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Équipe</Label>
              <Select value={teamId} onValueChange={(v) => setTeamId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de paiement</Label>
              <Select
                value={paymentType}
                onValueChange={(v) => v && setPaymentType(v as "registration" | "participation")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">
                    Inscription ({TOURNAMENT.registrationFeeFcfa.toLocaleString("fr-FR")} FCFA)
                  </SelectItem>
                  <SelectItem value="participation">
                    Participation ({TOURNAMENT.participationFeeFcfa.toLocaleString("fr-FR")} FCFA)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Référence de paiement</Label>
              <Input
                id="reference"
                name="reference"
                placeholder="Ex: MM-45821, reçu #12345..."
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Détails complémentaires (moyen de paiement, date du versement...)"
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={!teamId}
              >
                Enregistrer (reçu PAY-2026-XXXXXX)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solde par équipe</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <DashboardEmptyState
              message="Aucune équipe validée"
              actionHref="/dashboard"
              actionLabel="Retour à l'accueil"
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {teams.map((team) => {
                  const summary = teamSummaries[team.id] ?? {
                    totalPaidFcfa: 0,
                    totalExpectedFcfa: TOURNAMENT.totalFeeFcfa,
                    balanceFcfa: TOURNAMENT.totalFeeFcfa,
                    status: "impaye" as const,
                  }
                  return (
                    <article
                      key={team.id}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-white">{team.name}</p>
                        <Badge variant={summary.status === "paye" ? "default" : "secondary"}>
                          {TEAM_PAYMENT_STATUS_LABELS[summary.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-white/55">
                        Payé : {summary.totalPaidFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                      <p className="mt-1 text-sm text-white/45">
                        Solde restant : {summary.balanceFcfa.toLocaleString("fr-FR")} FCFA
                      </p>
                    </article>
                  )
                })}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Payé</TableHead>
                      <TableHead>Solde restant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => {
                      const summary = teamSummaries[team.id] ?? {
                        totalPaidFcfa: 0,
                        totalExpectedFcfa: TOURNAMENT.totalFeeFcfa,
                        balanceFcfa: TOURNAMENT.totalFeeFcfa,
                        status: "impaye" as const,
                      }
                      return (
                        <TableRow key={team.id}>
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell>{summary.totalPaidFcfa.toLocaleString("fr-FR")} FCFA</TableCell>
                          <TableCell>{summary.balanceFcfa.toLocaleString("fr-FR")} FCFA</TableCell>
                          <TableCell>
                            <Badge variant={summary.status === "paye" ? "default" : "secondary"}>
                              {TEAM_PAYMENT_STATUS_LABELS[summary.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <DashboardEmptyState
              message="Aucun paiement"
              actionHref="/dashboard"
              actionLabel="Retour à l'accueil"
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {orderedPayments.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm text-white/80">{p.receipt_number}</p>
                        <p className="mt-1 font-medium text-white">{p.team?.name ?? "—"}</p>
                      </div>
                      <Badge>{STATUS_LABELS[p.status] ?? p.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-white/55">
                      {TYPE_LABELS[p.payment_type] ?? p.payment_type}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#d4af37]">
                      {p.amount_fcfa.toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      {p.recorded_at
                        ? format(new Date(p.recorded_at), "dd/MM/yyyy", { locale: fr })
                        : "Date non renseignée"}
                    </p>
                    {p.status === "pending" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="min-h-11"
                          onClick={() => handleConfirm(p.id)}
                        >
                          Confirmer le versement
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-11"
                          onClick={() => handleCancel(p.id)}
                        >
                          Annuler
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reçu</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-28" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderedPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">{p.receipt_number}</TableCell>
                        <TableCell className="text-sm">{p.reference || "—"}</TableCell>
                        <TableCell>{p.team?.name ?? "—"}</TableCell>
                        <TableCell>{TYPE_LABELS[p.payment_type] ?? p.payment_type}</TableCell>
                        <TableCell>{p.amount_fcfa.toLocaleString("fr-FR")} FCFA</TableCell>
                        <TableCell>
                          <Badge>{STATUS_LABELS[p.status] ?? p.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {p.recorded_at
                            ? format(new Date(p.recorded_at), "dd/MM/yyyy", { locale: fr })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {p.status === "pending" && (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleConfirm(p.id)}
                              >
                                Confirmer
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(p.id)}
                              >
                                Annuler
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
