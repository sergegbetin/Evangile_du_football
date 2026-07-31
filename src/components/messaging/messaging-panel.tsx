"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  createCoachThread,
  createCommitteeThread,
  replyToThread,
} from "@/lib/actions/messages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardEmptyState } from "@/components/layout/dashboard-empty-state"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type {
  MessageThreadWithMeta,
  MessageWithSender,
  UserRole,
} from "@/types/database"

const ROLE_LABELS: Record<UserRole, string> = {
  coach: "Coach",
  committee: "Comité",
  referee: "Arbitre",
  discipline: "Discipline",
  super_admin: "Administrateur",
}

interface TeamOption {
  id: string
  name: string
}

interface MessagingPanelProps {
  mode: "coach" | "admin"
  threads: MessageThreadWithMeta[]
  messagesByThread: Record<string, MessageWithSender[]>
  teams?: TeamOption[]
  currentUserId: string
}

export function MessagingPanel({
  mode,
  threads,
  messagesByThread,
  teams = [],
  currentUserId,
}: MessagingPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(threads[0]?.id ?? null)
  const [reply, setReply] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [kind, setKind] = useState<"team" | "broadcast">(
    mode === "admin" ? "broadcast" : "team"
  )
  const [teamId, setTeamId] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const selected = threads.find((t) => t.id === selectedId) ?? null
  const messages = selectedId ? messagesByThread[selectedId] ?? [] : []

  async function handleCompose() {
    setError(null)
    setSuccess(null)
    setIsPending(true)
    const formData = new FormData()
    formData.set("subject", subject)
    formData.set("body", body)

    const result =
      mode === "admin"
        ? (() => {
            formData.set("kind", kind)
            if (kind === "team") formData.set("teamId", teamId)
            return createCommitteeThread(formData)
          })()
        : createCoachThread(formData)

    const resolved = await result
    setIsPending(false)
    if (!resolved.success) {
      setError(resolved.error)
      return
    }
    setShowCompose(false)
    setSubject("")
    setBody("")
    setTeamId("")
    setSelectedId(resolved.data?.threadId ?? null)
    setSuccess("Message envoyé")
    router.refresh()
  }

  async function handleReply() {
    if (!selectedId) return
    setError(null)
    setSuccess(null)
    setIsPending(true)
    const formData = new FormData()
    formData.set("threadId", selectedId)
    formData.set("body", reply)
    const result = await replyToThread(formData)
    setIsPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setReply("")
    setSuccess("Réponse envoyée")
    router.refresh()
  }

  return (
    <div className="space-y-4">
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

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          onClick={() => setShowCompose((v) => !v)}
        >
          {showCompose
            ? "Fermer"
            : mode === "admin"
              ? "Nouvelle annonce / fil"
              : "Écrire au comité"}
        </Button>
      </div>

      {showCompose && (
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          {mode === "admin" && (
            <>
              <div className="space-y-1">
                <Label>Type</Label>
                <Select
                  value={kind}
                  onValueChange={(v) => setKind((v as "team" | "broadcast") ?? "broadcast")}
                >
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broadcast">Annonce à tous les coachs</SelectItem>
                    <SelectItem value="team">Fil avec une équipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {kind === "team" && (
                <div className="space-y-1">
                  <Label>Équipe</Label>
                  <Select value={teamId || undefined} onValueChange={(v) => setTeamId(v ?? "")}>
                    <SelectTrigger className="min-h-11 w-full">
                      <SelectValue placeholder="Choisir une équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
          <div className="space-y-1">
            <Label htmlFor="msg-subject">Sujet</Label>
            <Input
              id="msg-subject"
              className="min-h-11"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet du message"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="msg-body">Message</Label>
            <Textarea
              id="msg-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Votre message…"
            />
          </div>
          <Button
            type="button"
            className="min-h-11"
            disabled={isPending || !subject.trim() || !body.trim()}
            onClick={handleCompose}
          >
            {isPending ? "Envoi…" : "Envoyer"}
          </Button>
        </div>
      )}

      {threads.length === 0 ? (
        <DashboardEmptyState message="Aucun message pour le moment" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <ul className="space-y-2">
            {threads.map((thread) => {
              const isActive = thread.id === selectedId
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(thread.id)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                      isActive
                        ? "border-[#d4af37]/40 bg-[#d4af37]/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {thread.subject}
                      </p>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {thread.kind === "broadcast" ? "Annonce" : "Équipe"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {thread.team?.name ? `${thread.team.name} · ` : ""}
                      {format(new Date(thread.last_message_at), "dd MMM HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="min-h-[20rem] rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Sélectionnez une conversation</p>
            ) : (
              <>
                <div className="border-b border-white/[0.06] pb-3">
                  <h2 className="text-base font-semibold text-white break-words">
                    {selected.subject}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.kind === "broadcast"
                      ? "Annonce globale"
                      : selected.team?.name ?? "Fil équipe"}
                  </p>
                </div>

                <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
                  {messages.map((message) => {
                    const isMine = message.sender_id === currentUserId
                    const role = message.sender?.role as UserRole | undefined
                    return (
                      <div
                        key={message.id}
                        className={`rounded-lg px-3 py-2 ${
                          isMine
                            ? "ml-4 bg-[#d4af37]/15 text-white"
                            : "mr-4 bg-white/[0.05] text-white/90"
                        }`}
                      >
                        <p className="text-xs text-white/50">
                          {message.sender?.full_name ?? "—"}
                          {role ? ` · ${ROLE_LABELS[role] ?? role}` : ""}
                          {" · "}
                          {format(new Date(message.created_at), "dd MMM HH:mm", {
                            locale: fr,
                          })}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm break-words">
                          {message.body}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                  <Label htmlFor="reply-body">Répondre</Label>
                  <Textarea
                    id="reply-body"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Votre réponse…"
                  />
                  <Button
                    type="button"
                    className="min-h-11"
                    disabled={isPending || !reply.trim()}
                    onClick={handleReply}
                  >
                    {isPending ? "Envoi…" : "Envoyer la réponse"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
