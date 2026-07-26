/**
 * Vérifie la connexion Supabase et la présence du schéma.
 * Usage: npm run check:supabase
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { ensureWebSocketPolyfill } from "./supabase-node.mjs"

ensureWebSocketPolyfill()

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  try {
    const content = readFileSync(envPath, "utf8")
    for (const line of content.split("\n")) {
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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY

function isPlaceholder(value) {
  if (!value) return true
  return (
    value.includes("your-project") ||
    value.includes("your-anon-key") ||
    value.includes("your-service-role-key")
  )
}

if (isPlaceholder(url) || isPlaceholder(anonKey)) {
  console.error("❌ Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local")
  process.exit(1)
}

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { enabled: false },
}

const anon = createClient(url, anonKey, clientOptions)
const admin = serviceKey && !isPlaceholder(serviceKey)
  ? createClient(url, serviceKey, clientOptions)
  : null

const REQUIRED_TABLES = [
  "profiles",
  "teams",
  "roster_members",
  "matches",
  "payments",
  "claims",
  "documents",
]

async function checkTable(client, table) {
  const { error } = await client.from(table).select("id", { head: true, count: "exact" })
  return { table, ok: !error, error: error?.message }
}

async function main() {
  console.log("🔍 Vérification Supabase\n")
  console.log(`URL: ${url}\n`)

  const client = admin ?? anon

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(client, table)
    if (result.ok) {
      console.log(`✓ Table accessible: ${table}`)
    } else {
      console.log(`✗ Table ${table}: ${result.error}`)
      console.log("\n→ Exécutez supabase/migrations/001_initial_schema.sql dans le SQL Editor Supabase")
      process.exit(1)
    }
  }

  if (admin) {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1 })
    if (error) {
      console.log(`\n⚠ Service role: ${error.message}`)
    } else {
      console.log(`\n✓ Service role OK (${data?.users?.length ?? 0} utilisateur(s) listé(s))`)
      console.log("→ Lancez: npm run seed:demo")
    }
  } else {
    console.log("\n⚠ SUPABASE_SERVICE_ROLE_KEY manquante (seed:demo nécessite cette clé)")
  }

  console.log("\n✅ Connexion Supabase opérationnelle")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
