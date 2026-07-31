import { z } from "zod"

export const teamRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de l'équipe doit contenir au moins 2 caractères")
    .max(50, "Le nom de l'équipe ne peut pas dépasser 50 caractères"),
  church: z
    .string()
    .min(2, "Le nom de l'église est requis")
    .max(100, "Le nom de l'église ne peut pas dépasser 100 caractères"),
  contact_phone: z
    .string()
    .min(8, "Numéro de téléphone de contact requis")
    .max(20, "Numéro de téléphone trop long"),
})

export const teamSubmitSchema = z.object({
  teamId: z.string().uuid("Identifiant d'équipe invalide"),
})

export const teamReviewSchema = z.object({
  teamId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
})

export const teamReassignSchema = z.object({
  teamId: z.string().uuid("Identifiant d'équipe invalide"),
  newCoachId: z.string().uuid("Identifiant de coach invalide"),
})

export const teamRosterUnlockSchema = z.object({
  teamId: z.string().uuid("Identifiant d'équipe invalide"),
  hours: z.coerce.number().int().min(1).max(168).default(48),
})

export const teamAdminUpdateSchema = z.object({
  teamId: z.string().uuid("Identifiant d'équipe invalide"),
  name: z
    .string()
    .min(2, "Le nom de l'équipe doit contenir au moins 2 caractères")
    .max(50, "Le nom de l'équipe ne peut pas dépasser 50 caractères"),
  church: z
    .string()
    .min(2, "Le nom de l'église est requis")
    .max(100, "Le nom de l'église ne peut pas dépasser 100 caractères"),
  contact_phone: z
    .string()
    .min(8, "Numéro de téléphone de contact requis")
    .max(20, "Numéro de téléphone trop long"),
})

export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>
export type TeamSubmitInput = z.infer<typeof teamSubmitSchema>
export type TeamReviewInput = z.infer<typeof teamReviewSchema>
export type TeamReassignInput = z.infer<typeof teamReassignSchema>
export type TeamRosterUnlockInput = z.infer<typeof teamRosterUnlockSchema>
export type TeamAdminUpdateInput = z.infer<typeof teamAdminUpdateSchema>
