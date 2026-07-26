import { isSupabaseConfigured } from "@/lib/supabase/config"

export function isPreviewMode(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false
  }

  return !isSupabaseConfigured()
}

export const PREVIEW_MUTATION_ERROR =
  "Mode aperçu — les modifications sont désactivées. Configurez Supabase pour enregistrer des données."
