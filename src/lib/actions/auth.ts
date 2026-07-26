"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { z } from "zod"

async function getSiteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  return `${protocol}://${host}`
}

const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
})

const signupSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  full_name: z.string().min(2, "Nom complet requis"),
  phone: z.string().optional(),
})

const requestPasswordResetSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return {
      success: false as const,
      error: "Supabase non configuré. Renseignez .env.local puis relancez le serveur.",
    }
  }
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { success: false as const, error: "Identifiants incorrects" }
  }

  const redirectTo = formData.get("redirect")?.toString() || "/dashboard"
  redirect(redirectTo)
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return {
      success: false as const,
      error: "Supabase non configuré. Renseignez .env.local puis relancez le serveur.",
    }
  }
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone ?? null,
      },
    },
  })

  if (error) {
    return { success: false as const, error: error.message }
  }

  // Email confirmation enabled: no session until the user confirms.
  if (!data.session) {
    return {
      success: true as const,
      needsConfirmation: true as const,
      message:
        "Compte créé. Vérifiez votre e-mail pour confirmer l'inscription, puis connectez-vous.",
    }
  }

  redirect("/dashboard")
}

export async function requestPasswordReset(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase non configuré. Contactez l'administrateur." }
  }

  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const origin = await getSiteOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
  })

  // Never leak whether the email exists to avoid user enumeration.
  if (error) {
    console.error("resetPasswordForEmail error:", error.message)
  }

  return { success: true }
}

export async function updatePassword(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase non configuré. Contactez l'administrateur." }
  }

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/")
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
