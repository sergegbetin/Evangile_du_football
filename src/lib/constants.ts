export const PUBLIC_NAVY = "#1A3A6B"
export const PUBLIC_GOLD = "#d4af37"

export const TOURNAMENT = {
  name: "L'Évangile selon le Football",
  edition: "Édition Vacances 2026",
  venue: "CEG Godomey",
  city: "Abomey-Calavi",
  drawDate: "19 juillet 2026, 15h00",
  openingMatchDate: "26 juillet 2026",
  maxTeams: 8,
  maxPlayers: 12,
  maxRosterMembers: 16,
  /** Football à 6 — au moins 6 joueurs avec photo pour soumettre le dossier */
  minPlayersToSubmit: 6,
  presenceHoursBeforeMatch: 1,
  /** Bénin — used for kickoff / presence display (no DST). */
  timeZone: "Africa/Porto-Novo",
  lateFeeFcfa: 2_000,
  rosterLockHoursBeforeFirstMatch: 24,
  claimDeadlineHours: 24,
  totalFeeFcfa: 15_000,
  registrationFeeFcfa: 5_000,
  participationFeeFcfa: 10_000,
  brandColor: PUBLIC_NAVY,
  verse: "Que toutes choses se fassent avec bienséance et avec ordre.",
  verseRef: "1 Corinthiens 14:40",
  contacts: {
    whatsapp: "01 62 93 91 66",
    phone: "01 28 43 81 80",
    whatsappUrl: "https://wa.me/229162939166",
    phoneUrl: "tel:+229128438180",
  },
} as const

export const MEMBER_TYPE_LABELS: Record<string, string> = {
  player: "Joueur",
  coach: "Coach",
  assistant_coach: "Coach adjoint",
  staff: "Soigneur / Dirigeant",
}

export const TEAM_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "En attente",
  approved: "Validée",
  rejected: "Refusée",
}

export const CLAIM_STATUS_LABELS: Record<string, string> = {
  received: "Reçue",
  in_review: "En cours",
  decided: "Décidée",
}

export const CLAIM_DECISION_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  rejected: "Rejetée",
}
