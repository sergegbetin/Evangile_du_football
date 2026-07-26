import { TOURNAMENT } from "@/lib/constants"

/** Static public logos for known teams (no DB logo column yet). */
export const TEAM_LOGO_BY_NAME: Record<string, string> = {
  "EAW FC": "/teams/eaw-fc.jpeg",
  "Canaan FC": "/teams/canaan-fc.jpg",
}

export function getTeamLogoPath(teamName: string): string | null {
  return TEAM_LOGO_BY_NAME[teamName] ?? null
}

export const POOL_TEAMS = [
  {
    pool: "A",
    name: "Canaan FC",
    church: "Église Pentecôte de la Foi Calavi centre",
  },
  {
    pool: "A",
    name: "EAW FC",
    church: "Église Apostolique Womey",
  },
  {
    pool: "A",
    name: "EPF Dekoungbé FC",
    church: "Église Pentecôte de la Foi de Dekoungbé",
  },
  {
    pool: "A",
    name: "Kindonou",
    church: "Église Pentecôte de la Foi de Kindonou",
  },
  {
    pool: "B",
    name: "CUA FC",
    church: "Église Apostolique Centre Universitaire",
  },
  {
    pool: "B",
    name: "EPF Fidjrossè",
    church: "Église Pentecôte de la Foi de Fidjrossè",
  },
  {
    pool: "B",
    name: "TU FC",
    church: "À préciser",
  },
  {
    pool: "B",
    name: "Gbegamey",
    church: "Église Pentecôte de la Foi de Gbegamey",
  },
] as const

export const POOL_MATCHES = [
  {
    home: "EAW FC",
    away: "Canaan FC",
    scheduledAt: "2026-07-26T16:00:00",
    venue: "Quartier Latin",
    round: "Phase de poules J1",
    homeScore: 1,
    awayScore: 0,
    status: "completed" as const,
  },
  {
    home: "CUA FC",
    away: "TU FC",
    scheduledAt: "2026-08-02T16:00:00",
    venue: "À confirmer",
    round: "Phase de poules J2",
    homeScore: null,
    awayScore: null,
    status: "scheduled" as const,
  },
  {
    home: "EPF Dekoungbé FC",
    away: "Kindonou",
    scheduledAt: "2026-08-09T16:00:00",
    venue: "À confirmer",
    round: "Phase de poules J3",
    homeScore: null,
    awayScore: null,
    status: "scheduled" as const,
  },
  {
    home: "EPF Fidjrossè",
    away: "Gbegamey",
    scheduledAt: "2026-08-16T16:00:00",
    venue: "À confirmer",
    round: "Phase de poules J4",
    homeScore: null,
    awayScore: null,
    status: "scheduled" as const,
  },
] as const

export const DEFAULT_TEAM_CONTACT = TOURNAMENT.contacts.whatsapp
