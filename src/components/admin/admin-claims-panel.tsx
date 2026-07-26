"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { processClaim } from "@/lib/actions/claims"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CLAIM_STATUS_LABELS } from "@/lib/constants"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { ClaimWithDetails } from "@/types/database"

interface AdminClaimsPanelProps {
  claims: ClaimWithDetails[]
}

export function AdminClaimsPanel({ claims }: AdminClaimsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [status, setStatus] = useState("in_review")
  const [decision, setDecision] = useState("pending")

  async function handleProcess(claimId: string, formData: FormData) {
    setError(null)
    formData.set("claim_id", claimId)
    formData.set("status", status)
    formData.set("decision", decision)
    const result = await processClaim(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setProcessingId(null)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {claims.length === 0 ? (
        <DashboardEmptyState message="Aucune réclamation" />
      ) : (
        claims.map((claim) => (
          <Card key={claim.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">{claim.subject}</CardTitle>
                <Badge>{CLAIM_STATUS_LABELS[claim.status] ?? claim.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">{claim.team?.name ?? "—"}</span>
                {" — "}
                {claim.submitter?.full_name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">{claim.description}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(claim.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
              </p>

              {claim.status !== "decided" && (
                processingId === claim.id ? (
                  <form action={(fd) => handleProcess(claim.id, fd)} className="space-y-3 border-t pt-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v ?? "in_review")}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="received">Reçue</SelectItem>
                            <SelectItem value="in_review">En instruction</SelectItem>
                            <SelectItem value="decided">Tranchée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Décision</Label>
                        <Select value={decision} onValueChange={(v) => setDecision(v ?? "pending")}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="accepted">Acceptée</SelectItem>
                            <SelectItem value="rejected">Rejetée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="decision_notes">Notes de décision</Label>
                      <Textarea id="decision_notes" name="decision_notes" rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        Enregistrer
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setProcessingId(null)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setProcessingId(claim.id)}>
                    Traiter
                  </Button>
                )
              )}

              {claim.decision_notes && (
                <p className="rounded-md bg-muted p-3 text-sm">{claim.decision_notes}</p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
