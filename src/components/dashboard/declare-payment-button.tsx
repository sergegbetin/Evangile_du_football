"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { declareCoachPayment } from "@/lib/actions/payments"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeclarePaymentButtonProps {
  disabled?: boolean
}

export function DeclarePaymentButton({ disabled = false }: DeclarePaymentButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleDeclare() {
    if (
      !window.confirm(
        "Confirmez-vous avoir versé les frais en espèces auprès du comité ?"
      )
    ) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsPending(true)
    const result = await declareCoachPayment()
    setIsPending(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSuccess("Signalement enregistré — en attente de confirmation du comité.")
    router.refresh()
  }

  return (
    <div className="space-y-3">
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
      <Button
        type="button"
        onClick={handleDeclare}
        disabled={disabled || isPending}
        className="bg-[#d4af37] text-[#050608] hover:bg-[#c9a030]"
      >
        {isPending ? "Envoi…" : "J’ai réglé auprès du comité"}
      </Button>
    </div>
  )
}
