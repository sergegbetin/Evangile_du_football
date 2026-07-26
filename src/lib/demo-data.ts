import type {
  Claim,
  ClaimWithDetails,
  Document,
  MatchWithTeams,
  Payment,
  PaymentWithTeam,
  Profile,
  RosterMember,
  Team,
  TeamWithCoach,
} from "@/types/database"
import { TOURNAMENT } from "@/lib/constants"

const now = "2026-07-19T12:00:00.000Z"

export const PREVIEW_COACH_PROFILE: Profile = {
  id: "preview-coach-id",
  email: "coach@kogoh.bj",
  full_name: "Jean Kouassi (aperçu)",
  phone: "01 62 93 91 66",
  role: "coach",
  created_at: now,
  updated_at: now,
}

export const PREVIEW_COMMITTEE_PROFILE: Profile = {
  id: "preview-committee-id",
  email: "comite@kogoh.bj",
  full_name: "Secrétariat Kogoh (aperçu)",
  phone: "01 62 93 91 66",
  role: "committee",
  created_at: now,
  updated_at: now,
}

export const PREVIEW_COACH_TEAM: Team = {
  id: "demo-team-1",
  coach_id: PREVIEW_COACH_PROFILE.id,
  name: "Disciples FC",
  church: "Église Évangélique de Godomey",
  contact_phone: "01 62 93 91 66",
  status: "approved",
  submitted_at: "2026-07-10T10:00:00.000Z",
  approved_at: "2026-07-12T14:00:00.000Z",
  rejection_reason: null,
  created_at: now,
  updated_at: now,
}

export const PREVIEW_ROSTER: RosterMember[] = [
  {
    id: "preview-roster-1",
    team_id: "demo-team-1",
    full_name: "Koffi Mensah",
    phone: "01 11 22 33 44",
    member_type: "player",
    jersey_number: 10,
    position: "Attaquant",
    photo_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-roster-2",
    team_id: "demo-team-1",
    full_name: "Paul Agbessi",
    phone: null,
    member_type: "player",
    jersey_number: 7,
    position: "Milieu",
    photo_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-roster-3",
    team_id: "demo-team-1",
    full_name: "Jean Kouassi",
    phone: "01 62 93 91 66",
    member_type: "coach",
    jersey_number: null,
    position: null,
    photo_url: null,
    created_at: now,
    updated_at: now,
  },
]

export const PREVIEW_COACH_PAYMENTS: Payment[] = [
  {
    id: "preview-payment-1",
    team_id: "demo-team-1",
    payment_type: "registration",
    amount_fcfa: TOURNAMENT.registrationFeeFcfa,
    status: "confirmed",
    receipt_number: "PAY-2026-000001",
    reference: "MM-45821",
    recorded_by: PREVIEW_COMMITTEE_PROFILE.id,
    recorded_at: "2026-07-11T09:00:00.000Z",
    notes: "Mobile Money — ref. MM-45821",
    created_at: now,
    updated_at: now,
  },
]

export const PREVIEW_COACH_CLAIMS: Claim[] = [
  {
    id: "preview-claim-1",
    team_id: "demo-team-1",
    match_id: "demo-match-1",
    submitted_by: PREVIEW_COACH_PROFILE.id,
    subject: "Score contesté — match du 27/07",
    description: "Le score affiché ne correspond pas à ce qui s'est passé sur le terrain.",
    status: "in_review",
    decision: "pending",
    decision_notes: null,
    decided_by: null,
    decided_at: null,
    created_at: now,
    updated_at: now,
  },
]

export const PREVIEW_SUBMITTED_TEAMS: TeamWithCoach[] = [
  {
    id: "demo-team-2",
    coach_id: "preview-coach-2-id",
    name: "Aigles de Godomey",
    church: "Assemblée de Godomey",
    contact_phone: "01 28 43 81 80",
    status: "submitted",
    submitted_at: "2026-07-18T16:00:00.000Z",
    approved_at: null,
    rejection_reason: null,
    created_at: now,
    updated_at: now,
    coach: {
      id: "preview-coach-2-id",
      email: "coach2@kogoh.bj",
      full_name: "Marie Adébayor",
      phone: "01 28 43 81 80",
      role: "coach",
      created_at: now,
      updated_at: now,
    },
  },
  {
    ...PREVIEW_COACH_TEAM,
    coach: PREVIEW_COACH_PROFILE,
  },
]

export const PREVIEW_APPROVED_TEAMS: Team[] = [
  PREVIEW_COACH_TEAM,
  {
    id: "demo-team-3",
    coach_id: "preview-coach-3-id",
    name: "Étoiles du CEG",
    church: "Église du CEG",
    contact_phone: "01 40 50 60 70",
    status: "approved",
    submitted_at: "2026-07-08T10:00:00.000Z",
    approved_at: "2026-07-09T10:00:00.000Z",
    rejection_reason: null,
    created_at: now,
    updated_at: now,
  },
]

export const PREVIEW_ALL_PAYMENTS: PaymentWithTeam[] = [
  {
    ...PREVIEW_COACH_PAYMENTS[0],
    team: { name: "Disciples FC" } as PaymentWithTeam["team"],
  },
  {
    id: "preview-payment-2",
    team_id: "demo-team-3",
    payment_type: "registration",
    amount_fcfa: TOURNAMENT.registrationFeeFcfa,
    status: "confirmed",
    receipt_number: "PAY-2026-000002",
    reference: "RECU-COMITE-002",
    recorded_by: PREVIEW_COMMITTEE_PROFILE.id,
    recorded_at: "2026-07-09T11:00:00.000Z",
    notes: "Espèces — reçu comité",
    created_at: now,
    updated_at: now,
    team: { name: "Étoiles du CEG" } as PaymentWithTeam["team"],
  },
]

export const PREVIEW_ALL_CLAIMS: ClaimWithDetails[] = [
  {
    ...PREVIEW_COACH_CLAIMS[0],
    team: { name: "Disciples FC" } as ClaimWithDetails["team"],
    submitter: { full_name: "Jean Kouassi" } as ClaimWithDetails["submitter"],
  },
]

export const STATIC_DOCUMENTS: Document[] = [
  {
    id: "static-reglement",
    title: "Règlement officiel — Édition Vacances 2026",
    description:
      "Règlement intérieur du tournoi L'Évangile selon le Football (football à 6, 8 équipes max).",
    file_url: "/reglement.pdf",
    category: "reglement",
    is_public: true,
    uploaded_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
]

export function getDemoMatches(): MatchWithTeams[] {
  return [
    {
      id: "demo-match-1",
      home_team_id: "demo-team-1",
      away_team_id: "demo-team-2",
      scheduled_at: "2026-07-26T15:00:00.000Z",
      venue: TOURNAMENT.venue,
      round: "Match d'ouverture",
      home_score: null,
      away_score: null,
      status: "scheduled",
      ended_at: null,
      created_at: "",
      updated_at: "",
      home_team: { name: "Disciples FC" } as MatchWithTeams["home_team"],
      away_team: { name: "Aigles de Godomey" } as MatchWithTeams["away_team"],
    },
    {
      id: "demo-match-2",
      home_team_id: "demo-team-3",
      away_team_id: "demo-team-4",
      scheduled_at: "2026-07-27T10:00:00.000Z",
      venue: TOURNAMENT.venue,
      round: "Phase de groupes — J1",
      home_score: 3,
      away_score: 1,
      status: "completed",
      ended_at: "2026-07-27T11:45:00.000Z",
      created_at: "",
      updated_at: "",
      home_team: { name: "Étoiles du CEG" } as MatchWithTeams["home_team"],
      away_team: { name: "Guerriers de la Foi" } as MatchWithTeams["away_team"],
    },
    {
      id: "demo-match-3",
      home_team_id: "demo-team-2",
      away_team_id: "demo-team-3",
      scheduled_at: "2026-07-28T10:00:00.000Z",
      venue: TOURNAMENT.venue,
      round: "Phase de groupes — J2",
      home_score: null,
      away_score: null,
      status: "scheduled",
      ended_at: null,
      created_at: "",
      updated_at: "",
      home_team: { name: "Aigles de Godomey" } as MatchWithTeams["home_team"],
      away_team: { name: "Étoiles du CEG" } as MatchWithTeams["away_team"],
    },
  ] as MatchWithTeams[]
}

export function getDemoStandings() {
  return [
    {
      teamId: "demo-team-3",
      name: "Étoiles du CEG",
      played: 2,
      won: 2,
      drawn: 0,
      lost: 0,
      goalsFor: 5,
      goalsAgainst: 2,
      points: 6,
    },
    {
      teamId: "demo-team-1",
      name: "Disciples FC",
      played: 2,
      won: 1,
      drawn: 1,
      lost: 0,
      goalsFor: 4,
      goalsAgainst: 2,
      points: 4,
    },
    {
      teamId: "demo-team-2",
      name: "Aigles de Godomey",
      played: 2,
      won: 1,
      drawn: 0,
      lost: 1,
      goalsFor: 3,
      goalsAgainst: 4,
      points: 3,
    },
    {
      teamId: "demo-team-4",
      name: "Guerriers de la Foi",
      played: 2,
      won: 0,
      drawn: 1,
      lost: 1,
      goalsFor: 2,
      goalsAgainst: 6,
      points: 1,
    },
  ]
}

export const DEMO_CREDENTIALS = {
  coach: {
    email: "coach@kogoh.bj",
    password: "Coach2026!",
    role: "Coach",
  },
  coach2: {
    email: "coach2@kogoh.bj",
    password: "Coach2026!",
    role: "Coach (2e équipe)",
  },
  committee: {
    email: "comite@kogoh.bj",
    password: "Comite2026!",
    role: "Comité d'organisation",
  },
} as const
