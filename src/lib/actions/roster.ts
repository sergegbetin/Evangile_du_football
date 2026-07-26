"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { PREVIEW_ROSTER } from "@/lib/demo-data"
import { getCoachTeam, getTeamFirstMatchAt } from "@/lib/actions/teams"
import {
  rosterMemberFormSchema,
  rosterMemberUpdateSchema,
} from "@/lib/validations/roster"
import { logAudit } from "@/lib/actions/audit"
import { getRosterLockMessage, isRosterLocked } from "@/lib/tournament-rules"
import type { ActionResult, RosterMember, Team } from "@/types/database"

const ROSTER_PHOTOS_BUCKET = "roster-photos"
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

async function assertRosterEditable(team: Team | null): Promise<string | null> {
  if (!team) {
    return "Aucune équipe enregistrée"
  }

  const firstMatchAt = await getTeamFirstMatchAt(team.id)
  if (isRosterLocked(team, firstMatchAt)) {
    return getRosterLockMessage(firstMatchAt)
  }

  return null
}

async function uploadRosterPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
  photo: File
): Promise<{ photoUrl: string } | { error: string }> {
  if (photo.size > MAX_PHOTO_SIZE_BYTES) {
    return { error: "La photo dépasse la taille maximale de 5 Mo" }
  }
  if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    return { error: "Format de photo non supporté (JPEG, PNG ou WebP requis)" }
  }

  const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `${teamId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from(ROSTER_PHOTOS_BUCKET)
    .upload(path, photo, { contentType: photo.type, upsert: false })

  if (uploadError) {
    return { error: `Échec de l'envoi de la photo : ${uploadError.message}` }
  }

  const { data: publicUrl } = supabase.storage.from(ROSTER_PHOTOS_BUCKET).getPublicUrl(path)
  return { photoUrl: publicUrl.publicUrl }
}

export async function getTeamRoster(teamId?: string): Promise<RosterMember[]> {
  if (isPreviewMode()) return PREVIEW_ROSTER

  const supabase = await createClient()
  let id = teamId

  if (!id) {
    const team = await getCoachTeam()
    if (!team) return []
    id = team.id
  }

  const { data } = await supabase
    .from("roster_members")
    .select("*")
    .eq("team_id", id)
    .order("member_type")
    .order("full_name")

  return data ?? []
}

export async function addRosterMember(
  formData: FormData
): Promise<ActionResult<RosterMember>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireAuth()
  const team = await getCoachTeam()
  const lockError = await assertRosterEditable(team)

  if (lockError) {
    return { success: false, error: lockError }
  }

  const jerseyRaw = formData.get("jersey_number")
  const parsed = rosterMemberFormSchema.safeParse({
    team_id: team!.id,
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || "",
    member_type: formData.get("member_type"),
    jersey_number: jerseyRaw ? Number(jerseyRaw) : null,
    position: formData.get("position") || "",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (parsed.data.member_type === "player" && !parsed.data.position?.trim()) {
    return { success: false, error: "Le poste est obligatoire pour les joueurs" }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0

  if (parsed.data.member_type === "player" && !hasPhoto) {
    return { success: false, error: "Une photo est obligatoire pour chaque joueur" }
  }

  const supabase = await createClient()
  let photoUrl: string | null = null

  if (hasPhoto) {
    const uploaded = await uploadRosterPhoto(supabase, parsed.data.team_id, photo as File)
    if ("error" in uploaded) return { success: false, error: uploaded.error }
    photoUrl = uploaded.photoUrl
  }

  const { data, error } = await supabase
    .from("roster_members")
    .insert({
      team_id: parsed.data.team_id,
      full_name: parsed.data.full_name.trim(),
      phone: parsed.data.phone || null,
      member_type: parsed.data.member_type,
      jersey_number: parsed.data.jersey_number ?? null,
      position: parsed.data.position?.trim() || null,
      photo_url: photoUrl,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit("roster.member_added", "roster_members", data.id)
  revalidatePath("/dashboard/effectif")
  revalidatePath("/dashboard/equipe")
  return { success: true, data }
}

export async function updateRosterMember(
  formData: FormData
): Promise<ActionResult<RosterMember>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireAuth()
  const team = await getCoachTeam()
  const lockError = await assertRosterEditable(team)

  if (lockError) {
    return { success: false, error: lockError }
  }

  const jerseyRaw = formData.get("jersey_number")
  const parsed = rosterMemberUpdateSchema.safeParse({
    member_id: formData.get("member_id"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || "",
    member_type: formData.get("member_type"),
    jersey_number: jerseyRaw ? Number(jerseyRaw) : null,
    position: formData.get("position") || "",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (parsed.data.member_type === "player" && !parsed.data.position?.trim()) {
    return { success: false, error: "Le poste est obligatoire pour les joueurs" }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("roster_members")
    .select("*")
    .eq("id", parsed.data.member_id)
    .eq("team_id", team!.id)
    .maybeSingle()

  if (!existing) {
    return { success: false, error: "Membre introuvable" }
  }

  const photo = formData.get("photo")
  const hasPhoto = photo instanceof File && photo.size > 0
  let photoUrl = existing.photo_url

  if (hasPhoto) {
    const uploaded = await uploadRosterPhoto(supabase, team!.id, photo as File)
    if ("error" in uploaded) return { success: false, error: uploaded.error }
    photoUrl = uploaded.photoUrl
  }

  if (parsed.data.member_type === "player" && !photoUrl) {
    return { success: false, error: "Une photo est obligatoire pour chaque joueur" }
  }

  const { data, error } = await supabase
    .from("roster_members")
    .update({
      full_name: parsed.data.full_name.trim(),
      phone: parsed.data.phone || null,
      member_type: parsed.data.member_type,
      jersey_number: parsed.data.jersey_number ?? null,
      position: parsed.data.position?.trim() || null,
      photo_url: photoUrl,
    })
    .eq("id", parsed.data.member_id)
    .eq("team_id", team!.id)
    .select()
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!data) return { success: false, error: "Impossible de modifier ce membre" }

  await logAudit("roster.member_updated", "roster_members", data.id)
  revalidatePath("/dashboard/effectif")
  revalidatePath("/dashboard/equipe")
  return { success: true, data }
}

export async function removeRosterMember(
  memberId: string
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireAuth()
  const team = await getCoachTeam()
  const lockError = await assertRosterEditable(team)

  if (lockError) {
    return { success: false, error: lockError }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("roster_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", team!.id)

  if (error) return { success: false, error: error.message }

  await logAudit("roster.member_removed", "roster_members", memberId)
  revalidatePath("/dashboard/effectif")
  revalidatePath("/dashboard/equipe")
  return { success: true }
}
