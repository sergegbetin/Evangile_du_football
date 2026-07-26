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

export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>
export type TeamSubmitInput = z.infer<typeof teamSubmitSchema>
export type TeamReviewInput = z.infer<typeof teamReviewSchema>
