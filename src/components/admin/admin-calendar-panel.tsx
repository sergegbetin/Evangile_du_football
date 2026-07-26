"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createMatch, updateMatchScore } from "@/lib/actions/matches"
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
  const [homeId, setHomeId] = useState("")
  const [awayId, setAwayId] = useState("")
  const [scoringId, setScoringId] = useState<string | null>(null)

  async function handleCreate(formData: FormData) {
    setError(null)
    formData.set("home_team_id", homeId)
    formData.set("away_team_id", awayId)
    formData.set("venue", TOURNAMENT.venue)
    const result = await createMatch(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  async function handleScore(matchId: string, formData: FormData) {
    setError(null)
    formData.set("match_id", matchId)
    const result = await updateMatchScore(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setScoringId(null)
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
          matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="py-4">
                <p className="font-medium">
                  {getJoinedName(match.home_team)} vs {getJoinedName(match.away_team)}
                  {match.home_score !== null && (
                    <span className="ml-2 text-[#d4af37]">
                      ({match.home_score} - {match.away_score})
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(match.scheduled_at), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                  {match.round && ` — ${match.round}`}
                </p>
                {match.status !== "completed" && (
                  scoringId === match.id ? (
                    <form
                      action={(fd) => handleScore(match.id, fd)}
                      className="mt-3 flex flex-wrap items-end gap-2"
                    >
                      <Input name="home_score" type="number" min={0} placeholder="Domicile" className="w-24" required />
                      <Input name="away_score" type="number" min={0} placeholder="Extérieur" className="w-24" required />
                      <Button type="submit" size="sm">Enregistrer score</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setScoringId(null)}>
                        Annuler
                      </Button>
                    </form>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setScoringId(match.id)}
                    >
                      Saisir le score
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
