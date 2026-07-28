"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createOrUpdateTeam, submitTeam } from "@/lib/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TEAM_STATUS_LABELS, TOURNAMENT } from "@/lib/constants"
import type { Team } from "@/types/database"

interface TeamFormProps {
  team: Team | null
  playerCount?: number
  membersMissingPhoto?: number
}

export function TeamForm({
  team,
  playerCount = 0,
  membersMissingPhoto = 0,
}: TeamFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const canEditName = !team || ["draft", "rejected"].includes(team.status)
  const canSubmit = team && ["draft", "rejected"].includes(team.status)
  const isPendingReview = team?.status === "submitted"
  const hasEnoughPlayers = playerCount >= TOURNAMENT.minPlayersToSubmit
  const rosterReady = hasEnoughPlayers && membersMissingPhoto === 0

  async function handleSave(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    const result = await createOrUpdateTeam(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess(
        team
          ? "Équipe mise à jour"
          : "Équipe enregistrée — complétez l'effectif puis soumettez le dossier"
      )
      router.refresh()
    }
    setIsLoading(false)
  }

  async function handleSubmit() {
    if (!team) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    const formData = new FormData()
    formData.set("teamId", team.id)
    const result = await submitTeam(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Dossier soumis au comité pour validation")
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Inscription équipe</h2>
          <p className="mt-1 text-sm text-white/50">
            {team
              ? "Votre équipe est enregistrée sur la plateforme."
              : "Renseignez le nom, l'église et un contact pour commencer."}
          </p>
        </div>
        {team && (
          <Badge
            variant="secondary"
            className={
              team.status === "approved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : team.status === "rejected"
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-[#d4af37]/25 bg-[#d4af37]/10 text-[#f0d060]"
            }
          >
            {TEAM_STATUS_LABELS[team.status] ?? team.status}
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {team?.rejection_reason && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
          <AlertDescription>
            Motif de refus : {team.rejection_reason}. Corrigez le dossier et resoumettez.
          </AlertDescription>
        </Alert>
      )}
      {isPendingReview && (
        <Alert className="border-[#d4af37]/25 bg-[#d4af37]/5">
          <AlertDescription className="text-white/75">
            Dossier en examen par le comité. Vous pouvez encore{" "}
            <Link href="/dashboard/effectif" className="font-medium text-[#d4af37] hover:underline">
              compléter l&apos;effectif
            </Link>{" "}
            en attendant la validation.
          </AlertDescription>
        </Alert>
      )}

      <form action={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/70">
            Nom de l&apos;équipe
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={team?.name ?? ""}
            disabled={!canEditName || isLoading}
            required
            placeholder="Ex: Les Aigles de Godomey"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="church" className="text-white/70">
            Église représentée
          </Label>
          <Input
            id="church"
            name="church"
            defaultValue={team?.church ?? ""}
            disabled={!canEditName || isLoading}
            required
            placeholder="Ex: Église Évangélique de Godomey"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="text-white/70">
            Téléphone de contact (coach / capitaine)
          </Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            defaultValue={team?.contact_phone ?? ""}
            disabled={!canEditName || isLoading}
            required
            placeholder="01 XX XX XX XX"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>
        {canEditName && (
          <Button
            type="submit"
            className="bg-[#d4af37] text-[#050608] hover:bg-[#c9a030]"
            disabled={isLoading}
          >
            {team ? "Enregistrer" : "Créer mon équipe"}
          </Button>
        )}
      </form>

      {canSubmit && (
        <div className="space-y-3 border-t border-white/[0.06] pt-4">
          <p className="text-sm text-white/55">
            Effectif : {playerCount}/{TOURNAMENT.minPlayersToSubmit} joueurs minimum
            {membersMissingPhoto > 0
              ? ` · ${membersMissingPhoto} membre(s) sans photo`
              : hasEnoughPlayers
                ? " · photos OK"
                : ""}
            . Complétez dans{" "}
            <Link href="/dashboard/effectif" className="text-[#d4af37] hover:underline">
              Effectif
            </Link>
            .
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSubmit}
              variant="outline"
              className="border-[#d4af37]/30 text-[#f0d060] hover:bg-[#d4af37]/10"
              disabled={isLoading || !rosterReady}
            >
              Soumettre au comité
            </Button>
            {!rosterReady && (
              <p className="text-sm text-white/45">
                Ajoutez au moins {TOURNAMENT.minPlayersToSubmit} joueurs — photo
                d&apos;identité obligatoire pour chaque membre de l&apos;effectif.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
