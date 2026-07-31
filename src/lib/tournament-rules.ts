import { TOURNAMENT } from "@/lib/constants"
import type { Match, Payment, Team } from "@/types/database"

export interface TournamentMatchCountParams {
  poolCount: number
  poolSize: number
}

/** Round-robin match count for one pool of `poolSize` teams. */
export function computePoolMatchCount(poolSize: number): number {
  if (poolSize < 2) return 0
  return (poolSize * (poolSize - 1)) / 2
}

/**
 * Group-stage matches: round-robin within each pool (reglement Art. 15).
 */
export function computeGroupStageMatchCount(
  poolCount: number,
  poolSize: number
): number {
  if (poolCount < 1) return 0
  return poolCount * computePoolMatchCount(poolSize)
}

/**
 * Knockout matches for the Kogoh format (reglement Art. 16–17):
 * top (poolSize − 1) per pool → QF → SF (+ best QF loser) → final.
 * Excludes the optional petite finale.
 */
export function computeKnockoutMatchCount(
  poolCount: number,
  poolSize: number
): number {
  if (poolCount < 1 || poolSize < 2) return 0

  const teamsAdvancingPerPool = poolSize - 1
  const qualifiedTeams = poolCount * teamsAdvancingPerPool
  const quarterFinalMatches = qualifiedTeams / 2
  const semiFinalists = quarterFinalMatches + 1
  const semiFinalMatches = semiFinalists / 2
  const finalMatches = 1

  return quarterFinalMatches + semiFinalMatches + finalMatches
}

export function computeTotalMatchCount(
  params: TournamentMatchCountParams
): number {
  const { poolCount, poolSize } = params
  return (
    computeGroupStageMatchCount(poolCount, poolSize)
    + computeKnockoutMatchCount(poolCount, poolSize)
  )
}

export function isRosterLocked(
  team: Pick<Team, "status"> & { roster_unlocked_until?: string | null },
  firstMatchAt: string | null
): boolean {
  // Déverrouillage temporaire accordé par le comité.
  if (team.roster_unlocked_until) {
    const unlockUntil = new Date(team.roster_unlocked_until).getTime()
    if (Date.now() < unlockUntil) return false
  }

  // Une équipe approved reste éditable : seul le verrou temporel
  // (24h avant son prochain match) ferme l'effectif.
  if (!["draft", "rejected", "submitted", "approved"].includes(team.status)) {
    return true
  }

  if (!firstMatchAt) {
    return false
  }

  const lockAt = new Date(firstMatchAt).getTime()
    - TOURNAMENT.rosterLockHoursBeforeFirstMatch * 60 * 60 * 1000

  return Date.now() >= lockAt
}

export function getRosterLockMessage(firstMatchAt: string | null): string {
  if (!firstMatchAt) {
    return "Effectif verrouillé pour cette équipe"
  }

  const lockDate = new Date(
    new Date(firstMatchAt).getTime()
      - TOURNAMENT.rosterLockHoursBeforeFirstMatch * 60 * 60 * 1000
  )

  return `Effectif verrouillé — modifications closes depuis le ${lockDate.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  })} (24 h avant le prochain match)`
}

export function isClaimSubmissionAllowed(
  match: Pick<Match, "status" | "scheduled_at"> & { ended_at?: string | null }
): boolean {
  if (match.status !== "completed") {
    return false
  }

  const deadlineMs = TOURNAMENT.claimDeadlineHours * 60 * 60 * 1000
  // Fall back to a 2h estimate when the exact match end time hasn't been recorded.
  const matchEndAt = match.ended_at
    ? new Date(match.ended_at).getTime()
    : new Date(match.scheduled_at).getTime() + 2 * 60 * 60 * 1000

  return Date.now() <= matchEndAt + deadlineMs
}

export function getClaimDeadlineMessage(): string {
  return `Les réclamations doivent être déposées dans les ${TOURNAMENT.claimDeadlineHours} heures suivant la fin du match concerné.`
}

/** Formats a wall-clock time in the tournament timezone (Bénin). */
export function formatTournamentHourTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TOURNAMENT.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00"
  return `${hour}h${minute}`
}

/** Presence check-in time: `presenceHoursBeforeMatch` before kickoff (reglement). */
export function getPresenceRequiredAt(scheduledAt: string): Date {
  return new Date(
    new Date(scheduledAt).getTime()
      - TOURNAMENT.presenceHoursBeforeMatch * 60 * 60 * 1000
  )
}

export function getPresenceRequiredMessage(scheduledAt: string): string {
  const matchAt = new Date(scheduledAt)
  const presenceAt = getPresenceRequiredAt(scheduledAt)

  return `Présence requise à ${formatTournamentHourTime(presenceAt)} pour le match de ${formatTournamentHourTime(matchAt)}`
}

export type TeamPaymentStatus = "impaye" | "en_attente" | "partiel" | "paye"

export interface TeamPaymentSummary {
  totalPaidFcfa: number
  totalExpectedFcfa: number
  balanceFcfa: number
  status: TeamPaymentStatus
}

export const TEAM_PAYMENT_STATUS_LABELS: Record<TeamPaymentStatus, string> = {
  impaye: "Impayé",
  en_attente: "En attente de confirmation",
  partiel: "Partiel",
  paye: "Payé",
}

export function computeTeamPaymentSummary(
  payments: Pick<Payment, "amount_fcfa" | "status">[],
  options?: { paymentDeclaredAt?: string | null }
): TeamPaymentSummary {
  const totalPaidFcfa = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount_fcfa, 0)
  const totalExpectedFcfa = TOURNAMENT.totalFeeFcfa
  const balanceFcfa = Math.max(totalExpectedFcfa - totalPaidFcfa, 0)

  let status: TeamPaymentStatus =
    totalPaidFcfa <= 0 ? "impaye" : balanceFcfa > 0 ? "partiel" : "paye"

  if (
    status !== "paye"
    && options?.paymentDeclaredAt
  ) {
    status = "en_attente"
  }

  return { totalPaidFcfa, totalExpectedFcfa, balanceFcfa, status }
}
