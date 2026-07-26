"use client"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"

export function ReceiptPrintActions() {
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <Button
        type="button"
        onClick={() => window.print()}
        className="bg-[#d4af37] text-[#050608] hover:bg-[#c9a030]"
      >
        Imprimer / Enregistrer en PDF
      </Button>
      <ButtonLink
        href="/dashboard/paiements"
        variant="outline"
        className="border-white/15 text-white hover:bg-white/[0.04]"
      >
        Retour aux paiements
      </ButtonLink>
    </div>
  )
}
