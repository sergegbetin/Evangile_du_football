import { z } from "zod"
import { TOURNAMENT } from "@/lib/constants"

const paymentTypes = ["registration", "participation"] as const
const paymentStatuses = ["pending", "confirmed", "cancelled"] as const

export const recordPaymentSchema = z.object({
  team_id: z.string().uuid("Équipe invalide"),
  payment_type: z.enum(paymentTypes, {
    message: "Type de paiement invalide",
  }),
  amount_fcfa: z
    .number()
    .int()
    .positive("Le montant doit être positif"),
  status: z.enum(paymentStatuses).default("confirmed"),
  reference: z.string().min(1, "Référence requise").max(200),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export const updatePaymentSchema = z.object({
  payment_id: z.string().uuid(),
  status: z.enum(paymentStatuses),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export const PAYMENT_AMOUNTS = {
  registration: TOURNAMENT.registrationFeeFcfa,
  participation: TOURNAMENT.participationFeeFcfa,
} as const

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
