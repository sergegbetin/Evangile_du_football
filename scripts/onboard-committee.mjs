/**
 * Onboard (create or promote) a committee account in Supabase.
 *
 * Usage:
 *   node scripts/onboard-committee.mjs [email]
 *
 * Defaults to sergegbetin7@gmail.com when no email is passed.
 * Prints a temporary password once — do not commit it.
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { randomBytes } from "node:crypto"
import { resolve } from "node:path"
import { ensureWebSocketPolyfill } from "./supabase-node.mjs"

ensureWebSocketPolyfill()

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    console.error("❌ Fichier .env.local introuvable")
    process.exit(1)
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!url || !serviceKey || url.includes("your-project")) {
  console.error("❌ Configure NEXT_PUBLIC_SUPABASE_URL et la clé service dans .env.local")
  process.exit(1)
}

const EMAIL = (process.argv[2] || "sergegbetin7@gmail.com").trim().toLowerCase()
const PASSWORD = `KogohComite-${randomBytes(6).toString("base64url")}!`
const FULL_NAME = "Secrétariat Kogoh"
const PHONE = "01 62 93 91 66"

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`\n🔐 Onboarding comité : ${EMAIL}\n`)

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })
  if (listError) {
    console.error("❌ listUsers:", listError.message)
    process.exit(1)
  }

  const existing = listed.users.find((u) => u.email?.toLowerCase() === EMAIL)
  let userId = existing?.id ?? null

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME, phone: PHONE, role: "committee" },
    })
    if (error) {
      console.error("❌ updateUserById:", error.message)
      process.exit(1)
    }
    console.log("✓ Utilisateur Auth existant — mot de passe réinitialisé + e-mail confirmé")
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME, phone: PHONE, role: "committee" },
    })
    if (error) {
      console.error("❌ createUser:", error.message)
      process.exit(1)
    }
    userId = data.user.id
    console.log("✓ Utilisateur Auth créé (Auto Confirm)")
  }

  await new Promise((r) => setTimeout(r, 800))

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", EMAIL)
    .maybeSingle()

  if (!profile) {
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      email: EMAIL,
      full_name: FULL_NAME,
      phone: PHONE,
      role: "committee",
    })
    if (error) {
      console.error("❌ profile upsert:", error.message)
      process.exit(1)
    }
    console.log("✓ Profil créé avec role=committee")
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "committee", full_name: FULL_NAME, phone: PHONE })
      .eq("email", EMAIL)
    if (error) {
      console.error("❌ promote:", error.message)
      process.exit(1)
    }
    console.log(`✓ Profil promu : ${profile.role} → committee`)
  }

  console.log("\n—— Identifiants temporaires (à transmettre en privé) ——")
  console.log(`E-mail    : ${EMAIL}`)
  console.log(`Mot de passe : ${PASSWORD}`)
  console.log("Connexion : /connexion → Administration → /admin/equipes")
  console.log("Ensuite   : Mot de passe oublié pour changer le mot de passe\n")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
