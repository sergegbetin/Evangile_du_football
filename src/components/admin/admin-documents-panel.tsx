"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteDocument, uploadDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { documentCategories } from "@/lib/validations/document"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import type { Document } from "@/types/database"

const CATEGORY_LABELS: Record<string, string> = {
  reglement: "Règlement",
  calendrier: "Calendrier",
  communique: "Communiqué",
  autre: "Autre",
}

interface AdminDocumentsPanelProps {
  documents: Document[]
}

export function AdminDocumentsPanel({ documents }: AdminDocumentsPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [category, setCategory] = useState<string>("autre")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleUpload(formData: FormData) {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    formData.set("category", category)
    if (isPublic) formData.set("is_public", "on")
    const result = await uploadDocument(formData)
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Document publié")
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer ce document définitivement ?")) return
    setError(null)
    setSuccess(null)
    const result = await deleteDocument(id)
    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess("Document supprimé")
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Publier un document</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleUpload} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "autre")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="file">Fichier (PDF, JPEG ou PNG — 10 Mo max)</Label>
              <Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png" required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked === true)}
              />
              <Label htmlFor="is_public" className="cursor-pointer font-normal">
                Visible publiquement (sans connexion)
              </Label>
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours…" : "Publier"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents publiés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Visibilité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <DashboardEmptyState message="Aucun document publié" />
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {doc.title}
                      </a>
                    </TableCell>
                    <TableCell>{CATEGORY_LABELS[doc.category] ?? doc.category}</TableCell>
                    <TableCell>
                      <Badge variant={doc.is_public ? "default" : "secondary"}>
                        {doc.is_public ? "Public" : "Interne"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
