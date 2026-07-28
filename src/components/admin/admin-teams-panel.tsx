"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { reassignTeamCoach, reviewTeam, type UnassignedCoach } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MEMBER_TYPE_LABELS, TEAM_STATUS_LABELS } from "@/lib/constants"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { TeamWithCoachAndRoster } from "@/types/database"

const PLACEHOLDER_EMAIL_SUFFIX = "@placeholder.kogoh.bj"

function isPlaceholderCoach(email: string | null | undefined): boolean {
  return Boolean(email?.endsWith(PLACEHOLDER_EMAIL_SUFFIX))
}

interface AdminTeamsPanelProps {
  teams: TeamWithCoachAndRoster[]
  unassignedCoaches: UnassignedCoach[]
}

export function AdminTeamsPanel({ teams, unassignedCoaches }: AdminTeamsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [reassigningId, setReassigningId] = useState<string | null>(null)
  const [selectedCoachId, setSelectedCoachId] = useState("")
  const [isReassignPending, setIsReassignPending] = useState(false)

  async function handleReview(teamId: string, action: "approve" | "reject") {
    setError(null)
    setSuccess(null)
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
      setSuccess(action === "approve" ? "Équipe validée" : "Dossier refusé")
      router.refresh()
    }
  }

  async function handleReassign(teamId: string, teamName: string) {
    if (!selectedCoachId) {
      setError("Sélectionnez un compte coach à rattacher")
      return
    }
    setError(null)
    setSuccess(null)
    setIsReassignPending(true)
    const formData = new FormData()
    formData.set("teamId", teamId)
    formData.set("newCoachId", selectedCoachId)
    const result = await reassignTeamCoach(formData)
    setIsReassignPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setReassigningId(null)
    setSelectedCoachId("")
    setSuccess(`Coach rattaché à ${teamName}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
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

      {teams.length === 0 ? (
        <DashboardEmptyState message="Aucune équipe à traiter" />
      ) : (
        teams.map((team) => {
          const players = team.roster.filter((m) => m.member_type === "player")
          const playersWithPhoto = players.filter((m) => m.photo_url).length
          const isExpanded = expandedId === team.id

          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    {isPlaceholderCoach(team.coach?.email) && (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                        Compte placeholder
                      </Badge>
                    )}
                    <Badge>{TEAM_STATUS_LABELS[team.status] ?? team.status}</Badge>
                  </div>
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
                    Soumis le{" "}
                    {format(new Date(team.submitted_at), "dd MMMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                )}
                {team.rejection_reason && (
                  <p className="text-sm text-destructive">
                    Refus : {team.rejection_reason}
                  </p>
                )}

                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-white/80">
                      Effectif : {players.length} joueur
                      {players.length !== 1 ? "s" : ""}
                      {" · "}
                      {playersWithPhoto}/{players.length || 0} photo
                      {players.length !== 1 ? "s" : ""}
                      {" · "}
                      {team.roster.length} membre
                      {team.roster.length !== 1 ? "s" : ""}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : team.id)
                      }
                    >
                      {isExpanded ? "Masquer l'effectif" : "Voir l'effectif"}
                    </Button>
                  </div>

                  {isExpanded && (
                    <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                      {team.roster.length === 0 ? (
                        <li className="text-sm text-muted-foreground">
                          Aucun membre enregistré
                        </li>
                      ) : (
                        team.roster.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            {member.photo_url ? (
                              <Image
                                src={member.photo_url}
                                alt={member.full_name}
                                width={36}
                                height={36}
                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div
                                className="h-9 w-9 shrink-0 rounded-full bg-muted"
                                aria-hidden
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-white">
                                {member.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {MEMBER_TYPE_LABELS[member.member_type] ??
                                  member.member_type}
                                {member.position ? ` · ${member.position}` : ""}
                                {member.jersey_number != null
                                  ? ` · #${member.jersey_number}`
                                  : ""}
                              </p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                <div className="pt-1">
                  {reassigningId === team.id ? (
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <Select
                        value={selectedCoachId || undefined}
                        onValueChange={(v) => setSelectedCoachId(v ?? "")}
                      >
                        <SelectTrigger className="min-w-56">
                          <SelectValue placeholder="Choisir un compte coach" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedCoaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.full_name} ({coach.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={isReassignPending || !selectedCoachId}
                        onClick={() => handleReassign(team.id, team.name)}
                      >
                        {isReassignPending ? "Rattachement…" : "Confirmer"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReassigningId(null)
                          setSelectedCoachId("")
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={unassignedCoaches.length === 0}
                      onClick={() => {
                        setReassigningId(team.id)
                        setSelectedCoachId("")
                      }}
                    >
                      Rattacher un coach
                    </Button>
                  )}
                  {unassignedCoaches.length === 0 && reassigningId !== team.id && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Aucun compte coach sans équipe — demandez au coach de créer son
                      compte via Inscription.
                    </p>
                  )}
                </div>

                {team.status === "submitted" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectingId(null)}
                        >
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
          )
        })
      )}
    </div>
  )
}
