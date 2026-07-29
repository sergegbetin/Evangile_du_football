import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isPreviewMode } from "@/lib/preview-mode"
import {
  PREVIEW_COACH_PROFILE,
  PREVIEW_COMMITTEE_PROFILE,
} from "@/lib/demo-data"
import type { Profile, UserRole } from "@/types/database"
import { isCoachRole, isCommitteeRole, isStaffRole } from "@/lib/roles"

export { isCoachRole, isCommitteeRole, isStaffRole }

export async function getProfile(): Promise<Profile | null> {
  if (isPreviewMode()) return PREVIEW_COACH_PROFILE

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile
}

export async function requireAuth(redirectTo = "/connexion"): Promise<Profile> {
  if (isPreviewMode()) return PREVIEW_COACH_PROFILE

  const profile = await getProfile()

  if (!profile) {
    redirect(redirectTo)
  }

  return profile
}

export async function requireCommittee(): Promise<Profile> {
  if (isPreviewMode()) return PREVIEW_COMMITTEE_PROFILE

  const profile = await requireAuth()
  const allowed: UserRole[] = ["committee", "super_admin"]

  if (!allowed.includes(profile.role)) {
    redirect("/dashboard")
  }

  return profile
}
