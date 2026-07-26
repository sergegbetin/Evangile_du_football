import { z } from "zod"

export const documentCategories = [
  "reglement",
  "calendrier",
  "communique",
  "autre",
] as const

export const documentUploadSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  category: z.enum(documentCategories).default("autre"),
  is_public: z.boolean().default(true),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
