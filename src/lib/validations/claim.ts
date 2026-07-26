import { z } from "zod"

const claimStatuses = ["received", "in_review", "decided"] as const
const claimDecisions = ["pending", "accepted", "rejected"] as const

export const createClaimSchema = z.object({
  team_id: z.string().uuid(),
  match_id: z.string().uuid("Sélectionnez le match concerné"),
  subject: z
    .string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(200),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(2000),
})

export const processClaimSchema = z.object({
  claim_id: z.string().uuid(),
  status: z.enum(claimStatuses),
  decision: z.enum(claimDecisions),
  decision_notes: z.string().max(1000).optional().or(z.literal("")),
})

export type CreateClaimInput = z.infer<typeof createClaimSchema>
export type ProcessClaimInput = z.infer<typeof processClaimSchema>
