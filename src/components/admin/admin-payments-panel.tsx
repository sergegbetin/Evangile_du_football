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
  const [paymentType, setPaymentType] = useState<"registration" | "participation">("registration")
  const [teamId, setTeamId] = useState("")

  async function handleRecord(formData: FormData) {
    setError(null)
    formData.set("team_id", teamId)
    formData.set("payment_type", paymentType)
    formData.set("amount_fcfa", String(PAYMENT_AMOUNTS[paymentType]))
    formData.set("status", "confirmed")
    const result = await recordPayment(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  async function handleCancel(paymentId: string) {
    setError(null)
    const formData = new FormData()
    formData.set("payment_id", paymentId)
    formData.set("status", "cancelled")
    const result = await updatePaymentStatus(formData)
    if (!result.success) {
      setError(result.error)
    } else {
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
                className="bg-[#1A3A6B] hover:bg-[#1A3A6B]/90"
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
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aucune équipe validée
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => {
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
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
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
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    Aucun paiement
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(p.id)}
                        >
                          Annuler
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
