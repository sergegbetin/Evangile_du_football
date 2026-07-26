"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import {
  PREVIEW_APPROVED_TEAMS,
  PREVIEW_COACH_TEAM,
  PREVIEW_SUBMITTED_TEAMS,
} from "@/lib/demo-data"
import {
  teamRegistrationSchema,
  teamSubmitSchema,
  teamReviewSchema,
} from "@/lib/validations/team"
import { logAudit } from "@/lib/actions/audit"
import { TOURNAMENT } from "@/lib/constants"
import type { ActionResult, Team, TeamWithCoach } from "@/types/database"

export async function getCoachTeam(): Promise<Team | null> {
  if (isPreviewMode()) return PREVIEW_COACH_TEAM

  const profile = await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("coach_id", profile.id)
    .maybeSingle()

  return data
}

export async function createOrUpdateTeam(
  formData: FormData
): Promise<ActionResult<Team>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireAuth()
  const parsed = teamRegistrationSchema.safeParse({
    name: formData.get("name"),
    church: formData.get("church"),
    contact_phone: formData.get("contact_phone"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const existing = await getCoachTeam()

  if (existing && existing.status === "approved") {
    return {
      success: false,
      error: "Une équipe validée ne peut plus être modifiée. Contactez le comité.",
    }
  }

  if (existing && existing.status === "submitted") {
    return {
      success: false,
      error: "Dossier en examen — vous pouvez compléter l'effectif en attendant.",
    }
  }

  const payload = {
    name: parsed.data.name.trim(),
    church: parsed.data.church.trim(),
    contact_phone: parsed.data.contact_phone.trim(),
  }

  if (existing) {
    const { data, error } = await supabase
      .from("teams")
      .update(payload)
      .eq("id", existing.id)
      .eq("coach_id", profile.id)
      .in("status", ["draft", "rejected"])
      .select()
      .maybeSingle()

    if (error) return { success: false, error: error.message }
    if (!data) {
      return { success: false, error: "Impossible de modifier cette équipe" }
    }

    await logAudit("team.updated", "teams", data.id)
    revalidatePath("/dashboard/equipe")
    revalidatePath("/dashboard")
    return { success: true, data }
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...payload, coach_id: profile.id, status: "draft" })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Vous avez déjà une équipe enregistrée ou ce nom est déjà pris",
      }
    }
    return { success: false, error: error.message }
  }

  await logAudit("team.created", "teams", data.id)
  revalidatePath("/dashboard/equipe")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function getTeamFirstMatchAt(teamId: string): Promise<string | null> {
  if (isPreviewMode()) return "2026-07-26T15:00:00.000Z"

  const supabase = await createClient()

  const { data } = await supabase
    .from("matches")
    .select("scheduled_at")
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .neq("status", "cancelled")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  return data?.scheduled_at ?? null
}

export async function submitTeam(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireAuth()
  const parsed = teamSubmitSchema.safeParse({
    teamId: formData.get("teamId"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()

  const { data: teamRow } = await supabase
    .from("teams")
    .select("*")
    .eq("id", parsed.data.teamId)
    .eq("coach_id", profile.id)
    .maybeSingle()

  if (!teamRow) {
    return { success: false, error: "Équipe introuvable" }
  }

  if (!["draft", "rejected"].includes(teamRow.status)) {
    return { success: false, error: "Équipe introuvable ou non modifiable" }
  }

  if (!teamRow.church?.trim() || !teamRow.contact_phone?.trim()) {
    return {
      success: false,
      error: "Complétez l'église et le téléphone de contact avant de soumettre",
    }
  }

  const { data: members, error: rosterError } = await supabase
    .from("roster_members")
    .select("id, member_type, photo_url, position")
    .eq("team_id", parsed.data.teamId)

  if (rosterError) return { success: false, error: rosterError.message }

  const players = (members ?? []).filter((m) => m.member_type === "player")
  const playersWithoutPhoto = players.filter((m) => !m.photo_url)

  if (players.length < TOURNAMENT.minPlayersToSubmit) {
    return {
      success: false,
      error: `Ajoutez au moins ${TOURNAMENT.minPlayersToSubmit} joueurs (photos obligatoires) avant de soumettre`,
    }
  }

  if (playersWithoutPhoto.length > 0) {
    return {
      success: false,
      error: `${playersWithoutPhoto.length} joueur(s) sans photo — la photo d'identité est obligatoire`,
    }
  }

  const { data: team, error } = await supabase
    .from("teams")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", parsed.data.teamId)
    .eq("coach_id", profile.id)
    .in("status", ["draft", "rejected"])
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!team) {
    return { success: false, error: "Équipe introuvable ou non modifiable" }
  }

  await logAudit("team.submitted", "teams", parsed.data.teamId)
  revalidatePath("/dashboard/equipe")
  revalidatePath("/dashboard")
  revalidatePath("/admin/equipes")
  return { success: true }
}

export async function reviewTeam(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireCommittee()
  const parsed = teamReviewSchema.safeParse({
    teamId: formData.get("teamId"),
    action: formData.get("action"),
    rejectionReason: formData.get("rejectionReason") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (parsed.data.action === "reject" && !parsed.data.rejectionReason) {
    return { success: false, error: "Motif de refus requis" }
  }

  const supabase = await createClient()
  if (parsed.data.action === "approve") {
    const { count, error: countError } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")

    if (countError) return { success: false, error: countError.message }

    if ((count ?? 0) >= TOURNAMENT.maxTeams) {
      return {
        success: false,
        error: `Le tournoi est complet (${TOURNAMENT.maxTeams} équipes maximum).`,
      }
    }
  }

  const update =
    parsed.data.action === "approve"
      ? { status: "approved" as const, approved_at: new Date().toISOString(), rejection_reason: null }
      : { status: "rejected" as const, rejection_reason: parsed.data.rejectionReason }

  const { data: updated, error } = await supabase
    .from("teams")
    .update(update)
    .eq("id", parsed.data.teamId)
    .eq("status", "submitted")
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!updated) {
    return { success: false, error: "Équipe introuvable ou déjà traitée" }
  }

  await logAudit(`team.${parsed.data.action}d`, "teams", parsed.data.teamId, {
    by: profile.id,
  })
  revalidatePath("/admin/equipes")
  revalidatePath("/dashboard/equipe")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getSubmittedTeams(): Promise<TeamWithCoach[]> {
  if (isPreviewMode()) return PREVIEW_SUBMITTED_TEAMS

  await requireCommittee()
  const supabase = await createClient()

  const { data } = await supabase
    .from("teams")
    .select("*, coach:profiles!teams_coach_id_fkey(full_name, email, phone)")
    .in("status", ["submitted", "approved", "rejected"])
    .order("submitted_at", { ascending: false })

  return (data ?? []) as TeamWithCoach[]
}

export async function getApprovedTeams(): Promise<Team[]> {
  if (isPreviewMode()) return PREVIEW_APPROVED_TEAMS

  const supabase = await createClient()

  const { data } = await supabase
    .from("teams")
    .select("*")
    .eq("status", "approved")
    .order("name")

  return (data ?? []) as Team[]
}
