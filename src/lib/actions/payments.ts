"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { PREVIEW_ALL_PAYMENTS, PREVIEW_COACH_PAYMENTS } from "@/lib/demo-data"
import { getCoachTeam } from "@/lib/actions/teams"
import { recordPaymentSchema, updatePaymentSchema } from "@/lib/validations/payment"
import { logAudit } from "@/lib/actions/audit"
import { computeTeamPaymentSummary, type TeamPaymentSummary } from "@/lib/tournament-rules"
import type { ActionResult, Payment, PaymentWithTeam } from "@/types/database"

export async function getCoachPayments(): Promise<Payment[]> {
  if (isPreviewMode()) return PREVIEW_COACH_PAYMENTS

  const team = await getCoachTeam()
  if (!team) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function getCoachPaymentSummary(): Promise<TeamPaymentSummary | null> {
  const payments = await getCoachPayments()
  if (isPreviewMode()) return computeTeamPaymentSummary(payments)

  const team = await getCoachTeam()
  if (!team) return null

  return computeTeamPaymentSummary(payments)
}

export async function getAllPayments(): Promise<PaymentWithTeam[]> {
  if (isPreviewMode()) return PREVIEW_ALL_PAYMENTS

  await requireCommittee()
  const supabase = await createClient()

  const { data } = await supabase
    .from("payments")
    .select("*, team:teams(name)")
    .order("created_at", { ascending: false })

  return (data ?? []) as PaymentWithTeam[]
}

export async function getAllTeamPaymentSummaries(): Promise<
  Record<string, TeamPaymentSummary>
> {
  const payments = await getAllPayments()
  const byTeam = new Map<string, Payment[]>()

  for (const payment of payments) {
    const list = byTeam.get(payment.team_id) ?? []
    list.push(payment)
    byTeam.set(payment.team_id, list)
  }

  const summaries: Record<string, TeamPaymentSummary> = {}
  byTeam.forEach((teamPayments, teamId) => {
    summaries[teamId] = computeTeamPaymentSummary(teamPayments)
  })

  return summaries
}

export async function recordPayment(
  formData: FormData
): Promise<ActionResult<Payment>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireCommittee()
  const parsed = recordPaymentSchema.safeParse({
    team_id: formData.get("team_id"),
    payment_type: formData.get("payment_type"),
    amount_fcfa: Number(formData.get("amount_fcfa")),
    status: formData.get("status") || "confirmed",
    reference: formData.get("reference") || "",
    notes: formData.get("notes") || "",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()

  // Duplicate-payment guard: same team, reference and amount recorded the same day.
  const { data: candidates, error: candidatesError } = await supabase
    .from("payments")
    .select("id, recorded_at, created_at")
    .eq("team_id", parsed.data.team_id)
    .eq("reference", parsed.data.reference)
    .eq("amount_fcfa", parsed.data.amount_fcfa)
    .neq("status", "cancelled")

  if (candidatesError) return { success: false, error: candidatesError.message }

  const todayKey = new Date().toISOString().slice(0, 10)
  const isDuplicate = (candidates ?? []).some((candidate) => {
    const dayKey = (candidate.recorded_at ?? candidate.created_at)?.slice(0, 10)
    return dayKey === todayKey
  })

  if (isDuplicate) {
    return {
      success: false,
      error: "Paiement en double détecté (même équipe, référence et montant aujourd'hui).",
    }
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      team_id: parsed.data.team_id,
      payment_type: parsed.data.payment_type,
      amount_fcfa: parsed.data.amount_fcfa,
      status: parsed.data.status,
      reference: parsed.data.reference,
      notes: parsed.data.notes || null,
      recorded_by: profile.id,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit("payment.recorded", "payments", data.id, {
    receipt: data.receipt_number,
    reference: data.reference,
  })
  revalidatePath("/admin/paiements")
  revalidatePath("/dashboard/paiements")
  return { success: true, data }
}

export async function updatePaymentStatus(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const parsed = updatePaymentSchema.safeParse({
    payment_id: formData.get("payment_id"),
    status: formData.get("status"),
    notes: formData.get("notes") || "",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: updated, error } = await supabase
    .from("payments")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    })
    .eq("id", parsed.data.payment_id)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!updated) {
    return { success: false, error: "Paiement introuvable" }
  }

  await logAudit("payment.updated", "payments", parsed.data.payment_id)
  revalidatePath("/admin/paiements")
  return { success: true }
}
