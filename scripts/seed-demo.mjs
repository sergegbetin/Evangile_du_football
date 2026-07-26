/**
 * Seed script — creates demo users and tournament data in Supabase.
 *
 * Usage:
 *   1. Configure .env.local with real Supabase keys
 *   2. Run migration 001_initial_schema.sql in Supabase SQL Editor
 *   3. npm run seed:demo
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
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY

if (!url || !serviceKey || url.includes("your-project")) {
  console.error("❌ Configure NEXT_PUBLIC_SUPABASE_URL et une clé secrète dans .env.local")
  console.error("")
  console.error("   SUPABASE_SERVICE_ROLE_KEY=...   (legacy JWT, onglet « Legacy API Keys »)")
  console.error("   — ou —")
  console.error("   SUPABASE_SECRET_KEY=...         (nouvelle clé sb_secret_..., onglet « API Keys »)")
  console.error("")
  console.error("   Dashboard → Paramètres du projet → Clés API")
  console.error("   https://supabase.com/dashboard/project/vbqqbxfcigacawiuuowi/settings/api-keys")
  console.error("")
  console.error("   Sans clé secrète : créez les 3 utilisateurs dans Authentication → Users,")
  console.error("   puis exécutez scripts/seed-via-dashboard.sql dans le SQL Editor.")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const USERS = [
  {
    email: "coach@kogoh.bj",
    password: "Coach2026!",
    full_name: "Jean Kouassi",
    phone: "01 62 93 91 66",
    role: "coach",
  },
  {
    email: "coach2@kogoh.bj",
    password: "Coach2026!",
    full_name: "Marie Adébayor",
    phone: "01 28 43 81 80",
    role: "coach",
  },
  {
    email: "comite@kogoh.bj",
    password: "Comite2026!",
    full_name: "Secrétariat Kogoh",
    phone: "01 62 93 91 66",
    role: "committee",
  },
]

async function ensureUser(user) {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === user.email)

  if (found) {
    await supabase
      .from("profiles")
      .update({ role: user.role, full_name: user.full_name, phone: user.phone })
      .eq("id", found.id)
    console.log(`✓ Utilisateur existant : ${user.email}`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
    },
  })

  if (error) {
    console.error(`❌ ${user.email}:`, error.message)
    return null
  }

  console.log(`✓ Créé : ${user.email}`)
  return data.user.id
}

async function main() {
  console.log("🌱 Seed demo Kogoh...\n")

  const coachId = await ensureUser(USERS[0])
  const coach2Id = await ensureUser(USERS[1])
  await ensureUser(USERS[2])

  if (!coachId || !coach2Id) {
    console.error("❌ Impossible de créer les coaches")
    process.exit(1)
  }

  const teams = [
    {
      name: "Disciples FC",
      coach_id: coachId,
      status: "approved",
      church: "Église Évangélique de Godomey",
      contact_phone: "01 62 93 91 66",
    },
    {
      name: "Aigles de Godomey",
      coach_id: coach2Id,
      status: "submitted",
      church: "Assemblée de Godomey",
      contact_phone: "01 28 43 81 80",
    },
  ]

  const teamIds = []

  for (const team of teams) {
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("name", team.name)
      .maybeSingle()

    if (existing) {
      teamIds.push(existing.id)
      console.log(`✓ Équipe existante : ${team.name}`)
      continue
    }

    const { data, error } = await supabase
      .from("teams")
      .insert({
        name: team.name,
        coach_id: team.coach_id,
        status: team.status,
        church: team.church,
        contact_phone: team.contact_phone,
        submitted_at: new Date().toISOString(),
        approved_at: team.status === "approved" ? new Date().toISOString() : null,
      })
      .select("id")
      .single()

    if (error) {
      console.error(`❌ Équipe ${team.name}:`, error.message)
      continue
    }

    teamIds.push(data.id)
    console.log(`✓ Équipe : ${team.name}`)
  }

  if (teamIds.length >= 2) {
    const { data: existingMatch } = await supabase
      .from("matches")
      .select("id")
      .eq("round", "Match d'ouverture")
      .maybeSingle()

    if (!existingMatch) {
      await supabase.from("matches").insert({
        home_team_id: teamIds[0],
        away_team_id: teamIds[1],
        scheduled_at: "2026-07-26T15:00:00.000Z",
        venue: "CEG Godomey",
        round: "Match d'ouverture",
        status: "scheduled",
      })
      console.log("✓ Match d'ouverture programmé")
    }
  }

  const { data: existingDoc } = await supabase
    .from("documents")
    .select("id")
    .eq("title", "Règlement officiel : Édition Vacances 2026")
    .maybeSingle()

  if (!existingDoc) {
    await supabase.from("documents").insert({
      title: "Règlement officiel : Édition Vacances 2026",
      description: "Règlement intérieur du tournoi (football à 6, 8 équipes max).",
      file_url: "/reglement.pdf",
      category: "reglement",
      is_public: true,
    })
    console.log("✓ Document règlement publié")
  }

  console.log("\n✅ Seed terminé !\n")
  console.log("Identifiants de connexion :")
  console.log("─────────────────────────")
  console.log("Coach 1  : coach@kogoh.bj  / Coach2026!")
  console.log("Coach 2  : coach2@kogoh.bj / Coach2026!")
  console.log("Comité   : comite@kogoh.bj / Comite2026!")
  console.log("\n→ http://localhost:3000/connexion")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
