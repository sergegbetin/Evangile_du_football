"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import {
  addRosterMember,
  removeRosterMember,
  updateRosterMember,
} from "@/lib/actions/roster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { MEMBER_TYPE_LABELS, TOURNAMENT } from "@/lib/constants"
import { PLAYER_POSITIONS } from "@/lib/validations/roster"
import { getRosterLockMessage } from "@/lib/tournament-rules"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import type { RosterMember, Team } from "@/types/database"

interface RosterManagerProps {
  team: Team | null
  members: RosterMember[]
  rosterLocked: boolean
  firstMatchAt: string | null
}

export function RosterManager({
  team,
  members,
  rosterLocked,
  firstMatchAt,
}: RosterManagerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [memberType, setMemberType] = useState("player")
  const [position, setPosition] = useState<string>("Gardien")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canEdit = Boolean(team && !rosterLocked)

  const playerCount = members.filter((m) => m.member_type === "player").length
  const editingMember = members.find((m) => m.id === editingId) ?? null

  async function handleAdd(formData: FormData) {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    formData.set("member_type", memberType)
    if (memberType === "player") {
      formData.set("position", position)
    }
    const result = await addRosterMember(formData)
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Membre ajouté")
      router.refresh()
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingMember) return
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    formData.set("member_id", editingMember.id)
    formData.set("member_type", memberType)
    if (memberType === "player") {
      formData.set("position", position)
    }
    const result = await updateRosterMember(formData)
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Membre mis à jour")
      setEditingId(null)
      router.refresh()
    }
  }

  async function handleRemove(id: string) {
    if (!window.confirm("Retirer ce membre de l'effectif ?")) return
    setError(null)
    setSuccess(null)
    const result = await removeRosterMember(id)
    if (!result.success) {
      setError(result.error)
    } else {
      if (editingId === id) setEditingId(null)
      setSuccess("Membre retiré")
      router.refresh()
    }
  }

  function startEdit(member: RosterMember) {
    setEditingId(member.id)
    setMemberType(member.member_type)
    setPosition(member.position || "Gardien")
    setError(null)
    setSuccess(null)
  }

  if (!team) {
    return (
      <DashboardEmptyState
        message="Créez d'abord votre équipe avant d'ajouter des joueurs."
        actionHref="/dashboard/equipe"
        actionLabel="Créer mon équipe"
      />
    )
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

      {rosterLocked && (
        <Alert>
          <AlertDescription>{getRosterLockMessage(firstMatchAt)}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effectif : {members.length}/{TOURNAMENT.maxRosterMembers} membres
            {" · "}
            {playerCount}/{TOURNAMENT.maxPlayers} joueurs
            {" · "}
            min. {TOURNAMENT.minPlayersToSubmit} pour soumettre
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <DashboardEmptyState
              message="Ajoutez au moins 6 joueurs avec photo pour soumettre le dossier."
              actionHref="#ajouter-joueur"
              actionLabel="Ajouter un joueur"
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {members.map((member) => (
                  <article
                    key={member.id}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start gap-3">
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={member.full_name}
                          width={40}
                          height={40}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="h-10 w-10 shrink-0 rounded-full border border-amber-500/50 bg-muted"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{member.full_name}</p>
                        <p className="mt-1 text-sm text-white/50">
                          {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
                          {member.position ? ` · ${member.position}` : ""}
                          {member.jersey_number ? ` · #${member.jersey_number}` : ""}
                        </p>
                        {member.phone && (
                          <p className="mt-1 text-sm text-white/45">{member.phone}</p>
                        )}
                        {!member.photo_url && (
                          <p className="mt-1 text-sm text-amber-400">Photo manquante</p>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => startEdit(member)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleRemove(member.id)}
                        >
                          Retirer
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
                      <TableHead className="w-14">Photo</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>N°</TableHead>
                      <TableHead>Téléphone</TableHead>
                      {canEdit && <TableHead className="w-36" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.photo_url ? (
                            <Image
                              src={member.photo_url}
                              alt={member.full_name}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div
                              className="h-9 w-9 rounded-full border border-amber-500/50 bg-muted"
                              title="Photo manquante"
                              aria-label="Photo manquante"
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>
                          {MEMBER_TYPE_LABELS[member.member_type] ?? member.member_type}
                        </TableCell>
                        <TableCell>{member.position ?? "—"}</TableCell>
                        <TableCell>{member.jersey_number ?? "—"}</TableCell>
                        <TableCell>{member.phone ?? "—"}</TableCell>
                        {canEdit && (
                          <TableCell className="space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => startEdit(member)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => handleRemove(member.id)}
                            >
                              Retirer
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <Card id="ajouter-joueur">
          <CardHeader>
            <CardTitle>
              {editingMember ? "Modifier un membre" : "Ajouter un membre"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              key={editingMember?.id ?? "new"}
              action={editingMember ? handleUpdate : handleAdd}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  defaultValue={editingMember?.full_name ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={editingMember?.phone ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={memberType} onValueChange={(v) => setMemberType(v ?? "player")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEMBER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {memberType === "player" && (
                <div className="space-y-2">
                  <Label>Poste</Label>
                  <Select value={position} onValueChange={(v) => setPosition(v ?? "Gardien")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAYER_POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="jersey_number">Numéro de maillot</Label>
                <Input
                  id="jersey_number"
                  name="jersey_number"
                  type="number"
                  min={1}
                  max={99}
                  defaultValue={editingMember?.jersey_number ?? ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photo">
                  Photo d&apos;identité{" "}
                  {editingMember?.photo_url
                    ? "(laisser vide pour conserver)"
                    : "(obligatoire pour chaque membre)"}
                </Label>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!editingMember?.photo_url}
                />
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Enregistrement…"
                    : editingMember
                      ? "Enregistrer les modifications"
                      : "Ajouter"}
                </Button>
                {editingMember && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => setEditingId(null)}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
