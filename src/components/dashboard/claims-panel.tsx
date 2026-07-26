"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClaim } from "@/lib/actions/claims"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CLAIM_STATUS_LABELS } from "@/lib/constants"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Claim } from "@/types/database"
import type { ClaimableMatch } from "@/lib/actions/claims"

interface ClaimsPanelProps {
  claims: Claim[]
  hasTeam: boolean
  claimableMatches: ClaimableMatch[]
  claimDeadlineHours: number
}

export function ClaimsPanel({
  claims,
  hasTeam,
  claimableMatches,
  claimDeadlineHours,
}: ClaimsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [matchId, setMatchId] = useState("")

  async function handleCreate(formData: FormData) {
    setError(null)
    formData.set("match_id", matchId)
    const result = await createClaim(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setShowForm(false)
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

      {hasTeam && (
        <div>
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              disabled={claimableMatches.length === 0}
            >
              Nouvelle réclamation
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle réclamation</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Match concerné</Label>
                    <Select value={matchId} onValueChange={(value) => setMatchId(value ?? "")} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un match terminé" />
                      </SelectTrigger>
                      <SelectContent>
                        {claimableMatches.map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Délai : {claimDeadlineHours} h maximum après la fin du match.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet</Label>
                    <Input id="subject" name="subject" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={4} required />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!matchId}
                    >
                      Envoyer
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {claimableMatches.length === 0 && !showForm && (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucun match éligible pour le moment. Les réclamations sont ouvertes
              dans les {claimDeadlineHours} heures suivant un match terminé.
            </p>
          )}
        </div>
      )}

      {!hasTeam && (
        <Alert>
          <AlertDescription>
            Votre équipe doit être validée par le comité avant de déposer une réclamation.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {claims.length === 0 ? (
          <DashboardEmptyState message="Aucune réclamation" />
        ) : (
          claims.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{claim.subject}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{claim.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(claim.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {CLAIM_STATUS_LABELS[claim.status] ?? claim.status}
                  </Badge>
                </div>
                {claim.decision_notes && (
                  <p className="mt-3 rounded-md bg-muted p-3 text-sm">
                    <span className="font-medium">Décision : </span>
                    {claim.decision_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
