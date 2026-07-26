"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { PREVIEW_ALL_CLAIMS, PREVIEW_COACH_CLAIMS } from "@/lib/demo-data"
import { getCoachTeam } from "@/lib/actions/teams"
import { createClaimSchema, processClaimSchema } from "@/lib/validations/claim"
import { logAudit } from "@/lib/actions/audit"
import {
  getClaimDeadlineMessage,
  isClaimSubmissionAllowed,
} from "@/lib/tournament-rules"
import type { ActionResult, Claim, ClaimWithDetails } from "@/types/database"

export interface ClaimableMatch {
  id: string
  label: string
  scheduled_at: string
}

export async function getClaimableMatches(): Promise<ClaimableMatch[]> {
  if (isPreviewMode()) {
    return [
      {
        id: "demo-match-1",
        label: "Disciples FC vs Étoiles FC — J1",
        scheduled_at: "2026-07-26T15:00:00.000Z",
      },
    ]
  }

  const team = await getCoachTeam()
  if (!team) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("matches")
    .select("id, scheduled_at, round, status, ended_at, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false })

  return (data ?? [])
    .filter((match) =>
      isClaimSubmissionAllowed({
        status: match.status,
        scheduled_at: match.scheduled_at,
        ended_at: match.ended_at,
      })
    )
    .map((match) => {
      const row = match as {
        id: string
        scheduled_at: string
        round: string | null
        home_team?: { name: string } | { name: string }[] | null
        away_team?: { name: string } | { name: string }[] | null
      }
      const homeName = Array.isArray(row.home_team)
        ? row.home_team[0]?.name
        : row.home_team?.name
      const awayName = Array.isArray(row.away_team)
        ? row.away_team[0]?.name
        : row.away_team?.name

      return {
        id: row.id,
        scheduled_at: row.scheduled_at,
        label: `${homeName ?? "—"} vs ${awayName ?? "—"}${row.round ? ` — ${row.round}` : ""}`,
      }
    })
}

export async function getCoachClaims(): Promise<Claim[]> {
  if (isPreviewMode()) return PREVIEW_COACH_CLAIMS

  const team = await getCoachTeam()
  if (!team) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("claims")
    .select("*")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function getAllClaims(): Promise<ClaimWithDetails[]> {
  if (isPreviewMode()) return PREVIEW_ALL_CLAIMS

  await requireCommittee()
  const supabase = await createClient()

  const { data } = await supabase
    .from("claims")
    .select("*, team:teams(name), submitter:profiles!claims_submitted_by_fkey(full_name), match:matches(id, scheduled_at, round)")
    .order("created_at", { ascending: false })

  return (data ?? []) as ClaimWithDetails[]
}

export async function createClaim(
  formData: FormData
): Promise<ActionResult<Claim>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireAuth()
  const team = await getCoachTeam()

  if (!team) {
    return { success: false, error: "Aucune équipe enregistrée" }
  }

  if (team.status !== "approved") {
    return {
      success: false,
      error: "Seules les équipes validées peuvent déposer une réclamation",
    }
  }

  const parsed = createClaimSchema.safeParse({
    team_id: team.id,
    match_id: formData.get("match_id"),
    subject: formData.get("subject"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, status, scheduled_at, ended_at, home_team_id, away_team_id")
    .eq("id", parsed.data.match_id)
    .maybeSingle()

  if (matchError || !match) {
    return { success: false, error: "Match introuvable" }
  }

  if (match.home_team_id !== team.id && match.away_team_id !== team.id) {
    return { success: false, error: "Ce match ne concerne pas votre équipe" }
  }

  if (!isClaimSubmissionAllowed(match)) {
    return { success: false, error: getClaimDeadlineMessage() }
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      team_id: parsed.data.team_id,
      match_id: parsed.data.match_id,
      submitted_by: profile.id,
      subject: parsed.data.subject,
      description: parsed.data.description,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit("claim.created", "claims", data.id)
  revalidatePath("/dashboard/reclamations")
  revalidatePath("/admin/reclamations")
  return { success: true, data }
}

export async function processClaim(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireCommittee()
  const parsed = processClaimSchema.safeParse({
    claim_id: formData.get("claim_id"),
    status: formData.get("status"),
    decision: formData.get("decision"),
    decision_notes: formData.get("decision_notes") || "",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from("claims")
    .update({
      status: parsed.data.status,
      decision: parsed.data.decision,
      decision_notes: parsed.data.decision_notes || null,
      decided_by: profile.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.claim_id)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!updated) {
    return { success: false, error: "Réclamation introuvable" }
  }

  await logAudit("claim.processed", "claims", parsed.data.claim_id)
  revalidatePath("/admin/reclamations")
  revalidatePath("/dashboard/reclamations")
  return { success: true }
}
