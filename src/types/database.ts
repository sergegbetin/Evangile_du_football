export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | "coach"
  | "committee"
  | "referee"
  | "discipline"
  | "super_admin"

export type TeamStatus = "draft" | "submitted" | "approved" | "rejected"

export type MemberType = "player" | "coach" | "assistant_coach" | "staff"

export type PaymentType = "registration" | "participation"

export type PaymentStatus = "pending" | "confirmed" | "cancelled"

export type ClaimStatus = "received" | "in_review" | "decided"

export type ClaimDecision = "pending" | "accepted" | "rejected"

export type MatchStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "postponed"

export type MessageThreadKind = "team" | "broadcast"

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  coach_id: string
  name: string
  church: string
  contact_phone: string
  status: TeamStatus
  submitted_at: string | null
  approved_at: string | null
  rejection_reason: string | null
  payment_declared_at: string | null
  roster_unlocked_until: string | null
  created_at: string
  updated_at: string
}

export interface RosterMember {
  id: string
  team_id: string
  full_name: string
  phone: string | null
  member_type: MemberType
  jersey_number: number | null
  position: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  scheduled_at: string
  venue: string
  round: string | null
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  team_id: string
  payment_type: PaymentType
  amount_fcfa: number
  status: PaymentStatus
  receipt_number: string
  reference: string
  recorded_by: string | null
  recorded_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  team_id: string
  match_id: string | null
  submitted_by: string
  subject: string
  description: string
  status: ClaimStatus
  decision: ClaimDecision
  decision_notes: string | null
  decided_by: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  title: string
  description: string | null
  file_url: string
  category: string
  is_public: boolean
  uploaded_by: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Json
  created_at: string
}

export interface MessageThread {
  id: string
  kind: MessageThreadKind
  team_id: string | null
  subject: string
  created_by: string
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

export interface MessageThreadWithMeta extends MessageThread {
  team?: { name: string } | null
  creator?: { full_name: string } | null
}

export interface MessageWithSender extends Message {
  sender?: { full_name: string; role: UserRole } | null
}

export interface TeamWithCoach extends Team {
  coach?: Profile
}

export interface TeamWithCoachAndRoster extends TeamWithCoach {
  roster: RosterMember[]
}

export interface MatchWithTeams extends Match {
  home_team?: { name: string } | { name: string }[] | null
  away_team?: { name: string } | { name: string }[] | null
}

export interface PaymentWithTeam extends Payment {
  team?: { name: string } | null
}

export interface ClaimWithDetails extends Claim {
  team?: { name: string } | null
  submitter?: { full_name: string } | null
  match?: Pick<Match, "id" | "scheduled_at" | "round"> | null
}

type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        Profile,
        Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<Profile, "id">>
      >
      teams: TableDef<
        Team,
        Omit<Team, "id" | "created_at" | "updated_at" | "submitted_at" | "approved_at" | "rejection_reason" | "payment_declared_at" | "roster_unlocked_until"> & {
          id?: string
          submitted_at?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          payment_declared_at?: string | null
          roster_unlocked_until?: string | null
        },
        Partial<Omit<Team, "id">>
      >
      roster_members: TableDef<
        RosterMember,
        Omit<RosterMember, "id" | "created_at" | "updated_at" | "photo_url" | "position"> & {
          id?: string
          photo_url?: string | null
          position?: string | null
        },
        Partial<Omit<RosterMember, "id" | "team_id">>
      >
      matches: TableDef<
        Match,
        Omit<Match, "id" | "created_at" | "updated_at" | "home_score" | "away_score" | "ended_at"> & {
          id?: string
          home_score?: number | null
          away_score?: number | null
          ended_at?: string | null
        },
        Partial<Omit<Match, "id">>
      >
      payments: TableDef<
        Payment,
        Omit<Payment, "id" | "created_at" | "updated_at" | "receipt_number" | "recorded_by" | "recorded_at"> & {
          id?: string
          receipt_number?: string
          recorded_by?: string | null
          recorded_at?: string | null
        },
        Partial<Omit<Payment, "id">>
      >
      claims: TableDef<
        Claim,
        Omit<Claim, "id" | "created_at" | "updated_at" | "status" | "decision" | "decision_notes" | "decided_by" | "decided_at" | "match_id"> & {
          id?: string
          match_id?: string | null
          status?: ClaimStatus
          decision?: ClaimDecision
          decision_notes?: string | null
          decided_by?: string | null
          decided_at?: string | null
        },
        Partial<Omit<Claim, "id">>
      >
      documents: TableDef<
        Document,
        Omit<Document, "id" | "created_at"> & { id?: string },
        Partial<Omit<Document, "id">>
      >
      message_threads: TableDef<
        MessageThread,
        Omit<MessageThread, "id" | "created_at" | "updated_at" | "last_message_at" | "team_id"> & {
          id?: string
          team_id?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        },
        Partial<Omit<MessageThread, "id">>
      >
      messages: TableDef<
        Message,
        Omit<Message, "id" | "created_at"> & {
          id?: string
          created_at?: string
        },
        Partial<Omit<Message, "id">>
      >
      audit_logs: {
        Row: AuditLog
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      declare_team_payment: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      team_status: TeamStatus
      member_type: MemberType
      payment_type: PaymentType
      payment_status: PaymentStatus
      claim_status: ClaimStatus
      claim_decision: ClaimDecision
      match_status: MatchStatus
      message_thread_kind: MessageThreadKind
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
