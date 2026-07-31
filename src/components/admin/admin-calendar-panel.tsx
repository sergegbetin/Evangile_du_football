"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  createMatch,
  updateMatchSchedule,
  updateMatchScore,
  updateMatchStatus,
} from "@/lib/actions/matches"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TOURNAMENT } from "@/lib/constants"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { getJoinedName } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { MatchWithTeams } from "@/types/database"

interface TeamOption {
  id: string
  name: string
}

interface AdminCalendarPanelProps {
  teams: TeamOption[]
  matches: MatchWithTeams[]
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminCalendarPanel({ teams, matches }: AdminCalendarPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScheduledAt, setEditScheduledAt] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editRound, setEditRound] = useState("")
  const [isEditPending, setIsEditPending] = useState(false)

  async function handleCreate(formData: FormData) {
    setError(null)
    setSuccess(null)
    formData.set("home_team_id", homeId)
    formData.set("away_team_id", awayId)
    const venue = String(formData.get("venue") ?? "").trim()
    formData.set("venue", venue || TOURNAMENT.venue)
    const result = await createMatch(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Match programmé")
      setHomeId("")
      setAwayId("")
      router.refresh()
    }
  }

  async function handleScore(matchId: string, formData: FormData) {
    setError(null)
    setSuccess(null)
    formData.set("match_id", matchId)
    const result = await updateMatchScore(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setScoringId(null)
      setSuccess("Score enregistré")
      router.refresh()
    }
  }

  async function handleStatus(
    matchId: string,
    status: "scheduled" | "postponed" | "cancelled"
  ) {
    const labels = {
      scheduled: "reprogrammer (statut programmé)",
      postponed: "reporter",
      cancelled: "annuler",
    } as const
    if (!window.confirm(`Confirmer : ${labels[status]} ce match ?`)) return

    setError(null)
    setSuccess(null)
    const formData = new FormData()
    formData.set("match_id", matchId)
    formData.set("status", status)
    const result = await updateMatchStatus(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess(
        status === "postponed"
          ? "Match reporté — visible sur le calendrier public"
          : status === "cancelled"
            ? "Match annulé — visible sur le calendrier public"
            : "Match remis au statut programmé"
      )
      router.refresh()
    }
  }

  function startEdit(match: MatchWithTeams) {
    setEditingId(match.id)
    setScoringId(null)
    setEditScheduledAt(toDatetimeLocalValue(match.scheduled_at))
    setEditVenue(match.venue || TOURNAMENT.venue)
    setEditRound(match.round ?? "")
    setError(null)
    setSuccess(null)
  }

  async function handleSaveSchedule(matchId: string) {
    setError(null)
    setSuccess(null)
    setIsEditPending(true)
    const formData = new FormData()
    formData.set("match_id", matchId)
    formData.set("scheduled_at", editScheduledAt)
    formData.set("venue", editVenue)
    formData.set("round", editRound)
    const result = await updateMatchSchedule(formData)
    setIsEditPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setEditingId(null)
    setSuccess("Date et lieu mis à jour")
    router.refresh()
  }

  const statusBadge: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Programmé", className: "border-white/15 bg-white/5 text-white/70" },
    completed: { label: "Terminé", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    postponed: { label: "Reporté", className: "border-amber-500/30 bg-amber-500/10 text-amber-200" },
    cancelled: { label: "Annulé", className: "border-white/10 bg-white/[0.04] text-white/40" },
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

      <Card>
        <CardHeader>
          <CardTitle>Créer un match</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Équipe domicile</Label>
              <Select value={homeId} onValueChange={(v) => setHomeId(v ?? "")}>
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="Domicile" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Équipe extérieur</Label>
              <Select value={awayId} onValueChange={(v) => setAwayId(v ?? "")}>
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue placeholder="Extérieur" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date et heure</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" className="min-h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Lieu</Label>
              <Input
                id="venue"
                name="venue"
                placeholder={`Ex: Quartier Latin, À confirmer, ${TOURNAMENT.venue}`}
                defaultValue={TOURNAMENT.venue}
                className="min-h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="round">Tour / Phase</Label>
              <Input id="round" name="round" placeholder="Ex: Phase de poules J1" className="min-h-11" />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="min-h-11 w-full sm:w-auto"
                disabled={!homeId || !awayId}
              >
                Programmer le match
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Matchs programmés</h2>
        {matches.length === 0 ? (
          <DashboardEmptyState message="Aucun match" />
        ) : (
          matches.map((match) => {
            const badge = statusBadge[match.status] ?? statusBadge.scheduled
            const canEditSchedule =
              match.status === "scheduled" || match.status === "postponed"

            return (
              <Card key={match.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium break-words">
                      {getJoinedName(match.home_team)} vs {getJoinedName(match.away_team)}
                      {match.home_score !== null && (
                        <span className="ml-2 text-[#d4af37]">
                          ({match.home_score} - {match.away_score})
                        </span>
                      )}
                    </p>
                    <Badge variant="secondary" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(match.scheduled_at), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                    {match.round && ` — ${match.round}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lieu : {match.venue || "—"}
                  </p>

                  {editingId === match.id && (
                    <div className="mt-3 space-y-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor={`sched-${match.id}`}>Date et heure</Label>
                          <Input
                            id={`sched-${match.id}`}
                            type="datetime-local"
                            className="min-h-11"
                            value={editScheduledAt}
                            onChange={(e) => setEditScheduledAt(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`venue-${match.id}`}>Lieu</Label>
                          <Input
                            id={`venue-${match.id}`}
                            className="min-h-11"
                            value={editVenue}
                            onChange={(e) => setEditVenue(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label htmlFor={`round-${match.id}`}>Tour / Phase</Label>
                          <Input
                            id={`round-${match.id}`}
                            className="min-h-11"
                            value={editRound}
                            onChange={(e) => setEditRound(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="min-h-11"
                          disabled={isEditPending}
                          onClick={() => handleSaveSchedule(match.id)}
                        >
                          {isEditPending ? "Enregistrement…" : "Enregistrer"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="min-h-11"
                          onClick={() => setEditingId(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {match.status !== "completed" && editingId !== match.id && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scoringId === match.id ? (
                        <form
                          action={(fd) => handleScore(match.id, fd)}
                          className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
                        >
                          <Input name="home_score" type="number" min={0} placeholder="Domicile" className="min-h-11 w-full sm:w-24" required />
                          <Input name="away_score" type="number" min={0} placeholder="Extérieur" className="min-h-11 w-full sm:w-24" required />
                          <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" className="min-h-11">Enregistrer score</Button>
                            <Button type="button" size="sm" variant="ghost" className="min-h-11" onClick={() => setScoringId(null)}>
                              Fermer
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {canEditSchedule && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-11"
                              onClick={() => startEdit(match)}
                            >
                              Modifier date / lieu
                            </Button>
                          )}
                          {match.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-11"
                              onClick={() => setScoringId(match.id)}
                            >
                              Saisir le score
                            </Button>
                          )}
                          {match.status !== "postponed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-11"
                              onClick={() => handleStatus(match.id, "postponed")}
                            >
                              Reporter
                            </Button>
                          )}
                          {match.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-11"
                              onClick={() => handleStatus(match.id, "cancelled")}
                            >
                              Annuler le match
                            </Button>
                          )}
                          {(match.status === "postponed" || match.status === "cancelled") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-11"
                              onClick={() => handleStatus(match.id, "scheduled")}
                            >
                              Remettre en programmé
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
