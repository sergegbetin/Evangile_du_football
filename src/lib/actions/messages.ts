"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { getCoachTeam } from "@/lib/actions/teams"
import { logAudit } from "@/lib/actions/audit"
import type {
  ActionResult,
  MessageThreadWithMeta,
  MessageWithSender,
} from "@/types/database"

const createThreadSchema = z.object({
  kind: z.enum(["team", "broadcast"]),
  teamId: z.string().uuid().optional(),
  subject: z
    .string()
    .min(3, "Sujet trop court")
    .max(120, "Sujet trop long"),
  body: z
    .string()
    .min(1, "Message requis")
    .max(4000, "Message trop long"),
})

const replySchema = z.object({
  threadId: z.string().uuid(),
  body: z
    .string()
    .min(1, "Message requis")
    .max(4000, "Message trop long"),
})

function revalidateMessaging() {
  revalidatePath("/dashboard/messages")
  revalidatePath("/admin/messages")
}

export async function getMessageThreads(): Promise<MessageThreadWithMeta[]> {
  if (isPreviewMode()) return []

  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("message_threads")
    .select(
      "*, team:teams(name), creator:profiles!message_threads_created_by_fkey(full_name)"
    )
    .order("last_message_at", { ascending: false })

  if (error) return []
  return (data ?? []) as MessageThreadWithMeta[]
}

export async function getThreadMessages(
  threadId: string
): Promise<MessageWithSender[]> {
  if (isPreviewMode()) return []

  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      "*, sender:profiles!messages_sender_id_fkey(full_name, role)"
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })

  if (error) return []
  return (data ?? []) as MessageWithSender[]
}

/** Comité : crée un fil équipe ou une annonce globale + premier message. */
export async function createCommitteeThread(
  formData: FormData
): Promise<ActionResult<{ threadId: string }>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireCommittee()
  const parsed = createThreadSchema.safeParse({
    kind: formData.get("kind"),
    teamId: formData.get("teamId") || undefined,
    subject: formData.get("subject"),
    body: formData.get("body"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  if (parsed.data.kind === "team" && !parsed.data.teamId) {
    return { success: false, error: "Sélectionnez une équipe" }
  }

  const supabase = await createClient()
  const { data: thread, error: threadError } = await supabase
    .from("message_threads")
    .insert({
      kind: parsed.data.kind,
      team_id: parsed.data.kind === "team" ? parsed.data.teamId! : null,
      subject: parsed.data.subject.trim(),
      created_by: profile.id,
    })
    .select("id")
    .single()

  if (threadError || !thread) {
    return { success: false, error: threadError?.message ?? "Création du fil impossible" }
  }

  const { error: messageError } = await supabase.from("messages").insert({
    thread_id: thread.id,
    sender_id: profile.id,
    body: parsed.data.body.trim(),
  })

  if (messageError) {
    return { success: false, error: messageError.message }
  }

  await logAudit("message.thread_created", "message_threads", thread.id, {
    kind: parsed.data.kind,
    team_id: parsed.data.teamId ?? null,
  })
  revalidateMessaging()
  return { success: true, data: { threadId: thread.id } }
}

/** Coach : ouvre un fil avec le comité pour son équipe. */
export async function createCoachThread(
  formData: FormData
): Promise<ActionResult<{ threadId: string }>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireAuth()
  if (profile.role !== "coach") {
    return { success: false, error: "Réservé aux coachs" }
  }

  const team = await getCoachTeam()
  if (!team) {
    return { success: false, error: "Aucune équipe rattachée" }
  }

  const parsed = createThreadSchema
    .pick({ subject: true, body: true })
    .safeParse({
      subject: formData.get("subject"),
      body: formData.get("body"),
    })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data: thread, error: threadError } = await supabase
    .from("message_threads")
    .insert({
      kind: "team",
      team_id: team.id,
      subject: parsed.data.subject.trim(),
      created_by: profile.id,
    })
    .select("id")
    .single()

  if (threadError || !thread) {
    return { success: false, error: threadError?.message ?? "Création du fil impossible" }
  }

  const { error: messageError } = await supabase.from("messages").insert({
    thread_id: thread.id,
    sender_id: profile.id,
    body: parsed.data.body.trim(),
  })

  if (messageError) {
    return { success: false, error: messageError.message }
  }

  await logAudit("message.thread_created", "message_threads", thread.id, {
    kind: "team",
    team_id: team.id,
  })
  revalidateMessaging()
  return { success: true, data: { threadId: thread.id } }
}

export async function replyToThread(
  formData: FormData
): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireAuth()
  const parsed = replySchema.safeParse({
    threadId: formData.get("threadId"),
    body: formData.get("body"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("messages").insert({
    thread_id: parsed.data.threadId,
    sender_id: profile.id,
    body: parsed.data.body.trim(),
  })

  if (error) return { success: false, error: error.message }

  await logAudit("message.sent", "messages", parsed.data.threadId)
  revalidateMessaging()
  return { success: true }
}
