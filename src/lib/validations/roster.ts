import { z } from "zod"
import { TOURNAMENT } from "@/lib/constants"

const memberTypes = ["player", "coach", "assistant_coach", "staff"] as const

export const PLAYER_POSITIONS = [
  "Gardien",
  "Défenseur",
  "Milieu",
  "Attaquant",
] as const

export const rosterMemberSchema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom complet est requis")
    .max(100),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),
  member_type: z.enum(memberTypes, {
    message: "Type de membre invalide",
  }),
  jersey_number: z
    .number()
    .int()
    .min(1)
    .max(99)
    .optional()
    .nullable(),
  position: z
    .string()
    .max(40)
    .optional()
    .nullable()
    .or(z.literal("")),
})

export const rosterMemberFormSchema = rosterMemberSchema.extend({
  team_id: z.string().uuid(),
})

export const rosterMemberUpdateSchema = rosterMemberSchema.extend({
  member_id: z.string().uuid(),
})

export const rosterLimits = {
  maxPlayers: TOURNAMENT.maxPlayers,
  maxMembers: TOURNAMENT.maxRosterMembers,
  minPlayersToSubmit: TOURNAMENT.minPlayersToSubmit,
} as const

export type RosterMemberInput = z.infer<typeof rosterMemberSchema>
export type RosterMemberFormInput = z.infer<typeof rosterMemberFormSchema>
export type RosterMemberUpdateInput = z.infer<typeof rosterMemberUpdateSchema>
