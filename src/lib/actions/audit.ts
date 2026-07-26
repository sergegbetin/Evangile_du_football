"use server"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { requireAuth } from "@/lib/auth"
import { isPreviewMode } from "@/lib/preview-mode"
import type { Json } from "@/types/database"

export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  if (isPreviewMode() || !isSupabaseConfigured()) {
    return
  }

  const profile = await requireAuth()
  const supabase = await createClient()

  await supabase.from("audit_logs").insert({
    user_id: profile.id,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: (metadata ?? {}) as Json,
  })
}
