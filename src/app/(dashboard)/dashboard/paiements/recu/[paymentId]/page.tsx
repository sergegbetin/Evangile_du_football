import { notFound } from "next/navigation"
import { getCoachPaymentById } from "@/lib/actions/payments"
import { TOURNAMENT } from "@/lib/constants"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ReceiptPrintActions } from "@/components/dashboard/receipt-print-actions"

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  registration: "Frais d'inscription",
  participation: "Frais de participation",
}

interface ReceiptPageProps {
  params: Promise<{ paymentId: string }>
}

export async function generateMetadata({ params }: ReceiptPageProps) {
  const { paymentId } = await params
  const payment = await getCoachPaymentById(paymentId)
  return {
    title: payment ? `Reçu ${payment.receipt_number}` : "Reçu",
  }
}

export default async function PaymentReceiptPage({ params }: ReceiptPageProps) {
  const { paymentId } = await params
  const payment = await getCoachPaymentById(paymentId)

  if (!payment || payment.status !== "confirmed") {
    notFound()
  }

  const recordedAt = payment.recorded_at
    ? format(new Date(payment.recorded_at), "d MMMM yyyy", { locale: fr })
    : "—"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <ReceiptPrintActions />

      <article className="mt-6 rounded-2xl border border-white/[0.1] bg-white p-8 text-[#0a0c10] shadow-sm print:mt-0 print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-[#0a0c10]/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A6B]">
            {TOURNAMENT.name}
          </p>
          <h1 className="mt-2 text-2xl font-bold">Reçu de paiement</h1>
          <p className="mt-1 text-sm text-[#0a0c10]/60">{TOURNAMENT.edition}</p>
        </header>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">N° de reçu</dt>
            <dd className="mt-1 font-mono text-lg font-semibold">{payment.receipt_number}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">Date</dt>
            <dd className="mt-1 text-lg font-semibold">{recordedAt}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">Équipe</dt>
            <dd className="mt-1 text-lg font-semibold">{payment.team_name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">Type</dt>
            <dd className="mt-1 text-lg font-semibold">
              {PAYMENT_TYPE_LABELS[payment.payment_type] ?? payment.payment_type}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">Montant</dt>
            <dd className="mt-1 text-2xl font-bold text-[#1A3A6B]">
              {payment.amount_fcfa.toLocaleString("fr-FR")} FCFA
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[#0a0c10]/50">Référence</dt>
            <dd className="mt-1 text-lg font-semibold">{payment.reference || "—"}</dd>
          </div>
        </dl>

        <p className="mt-10 text-sm leading-relaxed text-[#0a0c10]/70">
          Paiement enregistré par le comité d&apos;organisation après versement en
          espèces. Ce document constitue un reçu officiel pour {TOURNAMENT.name}.
        </p>

        <footer className="mt-8 border-t border-[#0a0c10]/10 pt-4 text-xs text-[#0a0c10]/45">
          {TOURNAMENT.venue} — {TOURNAMENT.city} · Secrétariat {TOURNAMENT.contacts.whatsapp}
        </footer>
      </article>
    </div>
  )
}
