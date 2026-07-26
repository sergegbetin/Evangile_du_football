"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { requireCommittee } from "@/lib/auth"
import { isPreviewMode, PREVIEW_MUTATION_ERROR } from "@/lib/preview-mode"
import { STATIC_DOCUMENTS } from "@/lib/demo-data"
import { logAudit } from "@/lib/actions/audit"
import { documentUploadSchema } from "@/lib/validations/document"
import type { ActionResult, Document } from "@/types/database"

const DOCUMENTS_BUCKET = "documents"
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"]

export async function getPublicDocuments(): Promise<Document[]> {
  if (!isSupabaseConfigured()) return STATIC_DOCUMENTS

  const supabase = await createClient()

  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  const dbDocs = (data ?? []) as Document[]
  const hasReglement = dbDocs.some((doc) => doc.file_url === "/reglement.pdf")

  if (hasReglement) return dbDocs

  return [...dbDocs, ...STATIC_DOCUMENTS]
}

export async function getAllDocuments(): Promise<Document[]> {
  if (isPreviewMode()) return STATIC_DOCUMENTS

  await requireCommittee()
  const supabase = await createClient()

  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })

  return (data ?? []) as Document[]
}

export async function uploadDocument(
  formData: FormData
): Promise<ActionResult<Document>> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  const profile = await requireCommittee()
  const parsed = documentUploadSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    category: formData.get("category") || "autre",
    is_public: formData.get("is_public") === "on",
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Un fichier est requis" }
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { success: false, error: "Le fichier dépasse la taille maximale de 10 Mo" }
  }

  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return { success: false, error: "Format non supporté (PDF, JPEG ou PNG requis)" }
  }

  const supabase = await createClient()
  const extension = file.name.split(".").pop() || "pdf"
  const path = `${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return { success: false, error: `Échec de l'envoi du fichier : ${uploadError.message}` }
  }

  const { data: publicUrl } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path)

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      file_url: publicUrl.publicUrl,
      category: parsed.data.category,
      is_public: parsed.data.is_public,
      uploaded_by: profile.id,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  await logAudit("document.uploaded", "documents", data.id)
  revalidatePath("/admin/documents")
  revalidatePath("/documents")
  return { success: true, data }
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  if (isPreviewMode()) return { success: false, error: PREVIEW_MUTATION_ERROR }

  await requireCommittee()
  const supabase = await createClient()

  const { data: deleted, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .select("id")
    .maybeSingle()

  if (error) return { success: false, error: error.message }

  if (!deleted) {
    return { success: false, error: "Document introuvable" }
  }

  await logAudit("document.deleted", "documents", documentId)
  revalidatePath("/admin/documents")
  revalidatePath("/documents")
  return { success: true }
}
