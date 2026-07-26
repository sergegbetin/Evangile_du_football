"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { reviewTeam } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TEAM_STATUS_LABELS } from "@/lib/constants"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { TeamWithCoach } from "@/types/database"

interface AdminTeamsPanelProps {
  teams: TeamWithCoach[]
}

export function AdminTeamsPanel({ teams }: AdminTeamsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState("")

  async function handleReview(teamId: string, action: "approve" | "reject") {
    setError(null)
    const formData = new FormData()
    formData.set("teamId", teamId)
    formData.set("action", action)
    if (action === "reject") {
      formData.set("rejectionReason", reason)
    }
    const result = await reviewTeam(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setRejectingId(null)
      setReason("")
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

      {teams.length === 0 ? (
        <p className="text-muted-foreground">Aucune équipe à traiter</p>
      ) : (
        teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge>{TEAM_STATUS_LABELS[team.status] ?? team.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">Coach :</span>{" "}
                {team.coach?.full_name ?? "—"} ({team.coach?.email ?? "—"})
              </p>
              <p className="text-sm">
                <span className="font-medium">Église :</span> {team.church || "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                Contact équipe : {team.contact_phone || "—"}
                {team.coach?.phone ? ` · Coach : ${team.coach.phone}` : ""}
              </p>
              {team.submitted_at && (
                <p className="text-sm text-muted-foreground">
                  Soumis le {format(new Date(team.submitted_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              )}
              {team.rejection_reason && (
                <p className="text-sm text-destructive">
                  Refus : {team.rejection_reason}
                </p>
              )}

              {team.status === "submitted" && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    className="bg-[#1A3A6B] hover:bg-[#1A3A6B]/90"
                    onClick={() => handleReview(team.id, "approve")}
                  >
                    Valider
                  </Button>
                  {rejectingId === team.id ? (
                    <div className="flex w-full flex-wrap items-end gap-2">
                      <Input
                        placeholder="Motif du refus"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(team.id, "reject")}
                      >
                        Confirmer refus
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingId(team.id)}
                    >
                      Refuser
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
