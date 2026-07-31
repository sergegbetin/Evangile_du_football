"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { getDemoMatches, getDemoStandings } from "@/lib/demo-data"
import { requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { logAudit } from "@/lib/actions/audit"
import type { ActionResult, Match, MatchWithTeams } from "@/types/database"

const matchSchema = z.object({
  home_team_id: z.string().uuid(),
  away_team_id: z.string().uuid(),
  scheduled_at: z.string().min(1, "Date requise"),
  venue: z.string().min(1, "Lieu requis"),
  round: z.string().optional(),
})

const scoreSchema = z.object({
  match_id: z.string().uuid(),
  home_score: z.number().int().min(0),
  away_score: z.number().int().min(0),
  status: z.enum(["completed", "scheduled", "postponed", "cancelled"]).optional(),
})

export async function getAllMatches(): Promise<MatchWithTeams[]> {
  if (!isSupabaseConfigured()) return getDemoMatches()

  const supabase = await createClient()

  const { data } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
    .order("scheduled_at")

  const rows = (data ?? []) as MatchWithTeams[]
  return rows
}

const matchWithTeamsSelect =
  "*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)"

export async function getCoachUpcomingMatch(
  teamId: string
): Promise<MatchWithTeams | null> {
  if (!isSupabaseConfigured()) {
    const now = Date.now()
    return (
      getDemoMatches()
        .filter(
          (match) =>
            (match.home_team_id === teamId || match.away_team_id === teamId)
            && match.status === "scheduled"
            && new Date(match.scheduled_at).getTime() > now
        )
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )[0] ?? null
    )
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from("matches")
    .select(matchWithTeamsSelect)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq("status", "scheduled")
    .gt("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  return (data as MatchWithTeams | null) ?? null
}

export async function getStandings() {
  if (!isSupabaseConfigured()) return getDemoStandings()

  const supabase = await createClient()

  const { data: matches } = await supabase
    .from("matches")
    .select("home_team_id, away_team_id, home_score, away_score, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)")
    .eq("status", "completed")
    .not("home_score", "is", null)
    .not("away_score", "is", null)

  const standings = new Map<
    string,
    { teamId: string; name: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }
  >()

  for (const match of (matches ?? []) as Array<{
    home_team_id: string
    away_team_id: string
    home_score: number
    away_score: number
    home_team: { name: string } | { name: string }[] | null
    away_team: { name: string } | { name: string }[] | null
  }>) {
    const homeId = match.home_team_id
    const awayId = match.away_team_id
    const homeName = (Array.isArray(match.home_team) ? match.home_team[0]?.name : match.home_team?.name) ?? "—"
    const awayName = (Array.isArray(match.away_team) ? match.away_team[0]?.name : match.away_team?.name) ?? "—"
    const hs = match.home_score!
    const as = match.away_score!

    for (const [id, name] of [[homeId, homeName], [awayId, awayName]] as const) {
      if (!standings.has(id)) {
        standings.set(id, { teamId: id, name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 })
      }
    }

    const home = standings.get(homeId)!
    const away = standings.get(awayId)!
    home.played++
    away.played++
    home.goalsFor += hs
    home.goalsAgainst += as
    away.goalsFor += as
    away.goalsAgainst += hs

    if (hs > as) {
      home.won++
      home.points += 3
      away.lost++
    } else if (hs < as) {
      away.won++
      away.points += 3
      home.lost++
    } else {
      home.drawn++
      away.drawn++
      home.points++
      away.points++
    }
  }

  const result = Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })

  if (result.length === 0) {
    return []
  }

  return result
}

export async function createMatch(
  formData: FormData
): Promise<ActionResult<Match>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const parsed = matchSchema.safeParse({
    home_team_id: formData.get("home_team_id"),
    away_team_id: formData.get("away_team_id"),
    scheduled_at: formData.get("scheduled_at"),
    venue: formData.get("venue"),
    round: formData.get("round") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (parsed.data.home_team_id === parsed.data.away_team_id) {
    return { success: false, error: "Les deux équipes doivent être différentes" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("matches")
    .insert({
      home_team_id: parsed.data.home_team_id,
      away_team_id: parsed.data.away_team_id,
      scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
      venue: parsed.data.venue,
      round: parsed.data.round ?? null,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit("match.created", "matches", data.id)
  revalidatePath("/admin/calendrier")
  revalidatePath("/calendrier")
  return { success: true, data }
}

export async function updateMatchScore(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const parsed = scoreSchema.safeParse({
    match_id: formData.get("match_id"),
    home_score: Number(formData.get("home_score")),
    away_score: Number(formData.get("away_score")),
    status: formData.get("status") || "completed",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const status = parsed.data.status ?? "completed"
  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from("matches")
    .update({
      home_score: parsed.data.home_score,
      away_score: parsed.data.away_score,
      status,
      ended_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.match_id)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!updated) {
    return { success: false, error: "Match introuvable" }
  }

  await logAudit("match.score_updated", "matches", parsed.data.match_id)
  revalidatePath("/admin/calendrier")
  revalidatePath("/calendrier")
  revalidatePath("/classement")
  return { success: true }
}

const matchStatusSchema = z.object({
  match_id: z.string().uuid(),
  status: z.enum(["scheduled", "postponed", "cancelled"]),
})

export async function updateMatchStatus(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const parsed = matchStatusSchema.safeParse({
    match_id: formData.get("match_id"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from("matches")
    .update({
      status: parsed.data.status,
      ended_at: null,
    })
    .eq("id", parsed.data.match_id)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!updated) {
    return { success: false, error: "Match introuvable" }
  }

  await logAudit("match.status_updated", "matches", parsed.data.match_id, {
    status: parsed.data.status,
  })
  revalidatePath("/admin/calendrier")
  revalidatePath("/calendrier")
  return { success: true }
}

const matchScheduleSchema = z.object({
  match_id: z.string().uuid(),
  scheduled_at: z.string().min(1, "Date requise"),
  venue: z.string().min(1, "Lieu requis"),
  round: z.string().optional(),
})

/** Modifie date, lieu et tour d'un match à venir (programmé ou reporté). */
export async function updateMatchSchedule(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const parsed = matchScheduleSchema.safeParse({
    match_id: formData.get("match_id"),
    scheduled_at: formData.get("scheduled_at"),
    venue: formData.get("venue"),
    round: formData.get("round") || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: existing, error: fetchError } = await supabase
    .from("matches")
    .select("id, status")
    .eq("id", parsed.data.match_id)
    .maybeSingle()

  if (fetchError) return { success: false, error: fetchError.message }
  if (!existing) return { success: false, error: "Match introuvable" }

  if (existing.status !== "scheduled" && existing.status !== "postponed") {
    return {
      success: false,
      error: "Seuls les matchs programmés ou reportés peuvent être modifiés",
    }
  }

  const { data: updated, error } = await supabase
    .from("matches")
    .update({
      scheduled_at: new Date(parsed.data.scheduled_at).toISOString(),
      venue: parsed.data.venue.trim(),
      round: parsed.data.round?.trim() || null,
    })
    .eq("id", parsed.data.match_id)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!updated) return { success: false, error: "Match introuvable" }

  await logAudit("match.schedule_updated", "matches", parsed.data.match_id, {
    scheduled_at: parsed.data.scheduled_at,
    venue: parsed.data.venue.trim(),
  })
  revalidatePath("/admin/calendrier")
  revalidatePath("/calendrier")
  revalidatePath("/dashboard")
  return { success: true }
}
