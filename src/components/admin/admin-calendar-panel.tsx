"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createMatch, updateMatchScore, updateMatchStatus } from "@/lib/actions/matches"
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

export function AdminCalendarPanel({ teams, matches }: AdminCalendarPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [scoringId, setScoringId] = useState<string | null>(null)

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
          <form action={handleCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Équipe domicile</Label>
              <Select value={homeId} onValueChange={(v) => setHomeId(v ?? "")}>
                <SelectTrigger>
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
                <SelectTrigger>
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
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Lieu</Label>
              <Input
                id="venue"
                name="venue"
                placeholder={`Ex: Quartier Latin, À confirmer, ${TOURNAMENT.venue}`}
                defaultValue={TOURNAMENT.venue}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="round">Tour / Phase</Label>
              <Input id="round" name="round" placeholder="Ex: Phase de poules J1" />
            </div>
            <div>
              <Button
                type="submit"
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
            return (
              <Card key={match.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
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
                  {match.status !== "completed" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scoringId === match.id ? (
                        <form
                          action={(fd) => handleScore(match.id, fd)}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <Input name="home_score" type="number" min={0} placeholder="Domicile" className="w-24" required />
                          <Input name="away_score" type="number" min={0} placeholder="Extérieur" className="w-24" required />
                          <Button type="submit" size="sm">Enregistrer score</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setScoringId(null)}>
                            Fermer
                          </Button>
                        </form>
                      ) : (
                        <>
                          {match.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setScoringId(match.id)}
                            >
                              Saisir le score
                            </Button>
                          )}
                          {match.status !== "postponed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatus(match.id, "postponed")}
                            >
                              Reporter
                            </Button>
                          )}
                          {match.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatus(match.id, "cancelled")}
                            >
                              Annuler le match
                            </Button>
                          )}
                          {(match.status === "postponed" || match.status === "cancelled") && (
                            <Button
                              size="sm"
                              variant="outline"
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
