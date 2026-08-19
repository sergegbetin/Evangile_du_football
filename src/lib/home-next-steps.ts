import { TOURNAMENT } from "@/lib/constants"
import type { TeamPaymentStatus } from "@/lib/tournament-rules"
import type { TeamStatus } from "@/types/database"

export interface HomeNextStep {
  id: string
  label: string
  href: string
  done: boolean
}

export interface HomeNextStepsSnapshot {
  role: "coach" | "committee"
  teamStatus: TeamStatus | null
  photographedPlayerCount: number
  paymentStatus: TeamPaymentStatus
  submittedTeamCount: number
  pendingCashCount: number
  needsCalendarAction: boolean
}

export function firstIncompleteStep(
  steps: HomeNextStep[]
): HomeNextStep | undefined {
  return steps.find((step) => !step.done)
}

export function getHomeNextSteps(snapshot: HomeNextStepsSnapshot): HomeNextStep[] {
  if (snapshot.role === "committee") {
    return [
      {
        id: "review-teams",
        label: "Valider les inscriptions en attente",
        href: "/admin/equipes",
        done: snapshot.submittedTeamCount === 0,
      },
      {
        id: "confirm-cash",
        label: "Confirmer les paiements en espèces",
        href: "/admin/paiements",
        done: snapshot.pendingCashCount === 0,
      },
      {
        id: "calendar",
        label: "Mettre à jour le calendrier ou un score",
        href: "/admin/calendrier",
        done: !snapshot.needsCalendarAction,
      },
    ]
  }

  const hasTeam = snapshot.teamStatus !== null
  const rosterReady =
    snapshot.photographedPlayerCount >= TOURNAMENT.minPlayersToSubmit
  const submittedOrApproved =
    snapshot.teamStatus === "submitted" || snapshot.teamStatus === "approved"
  const reviewSettled = snapshot.teamStatus !== "submitted"
  const cashSettled =
    snapshot.teamStatus !== "approved" || snapshot.paymentStatus === "paye"

  return [
    {
      id: "create-team",
      label: "Enregistrer votre équipe",
      href: "/dashboard/equipe",
      done: hasTeam,
    },
    {
      id: "roster",
      label: "Ajouter 6 joueurs avec photo",
      href: "/dashboard/effectif",
      done: rosterReady,
    },
    {
      id: "submit",
      label: "Envoyer le dossier au comité",
      href: "/dashboard/equipe",
      done: submittedOrApproved,
    },
    {
      id: "review",
      label:
        snapshot.teamStatus === "rejected"
          ? "Corriger le dossier refusé"
          : "Attendre la validation du comité",
      href: "/dashboard/equipe",
      done: reviewSettled,
    },
    {
      id: "cash",
      label: "Déclarer le règlement auprès du comité",
      href: "/dashboard/paiements",
      done: cashSettled,
    },
  ]
}
