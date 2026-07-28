import Link from "next/link"
import { PublicShell } from "@/components/layout/public-shell"
import { PublicPageHeader } from "@/components/public/public-page-header"
import { TOURNAMENT } from "@/lib/constants"

export const metadata = {
  title: "Aide",
}

const faqs = [
  {
    question: "Comment s’inscrire ?",
    answer: (
      <>
        Créez un compte coach via{" "}
        <Link href="/inscription" className="text-[#d4af37] underline-offset-4 hover:underline">
          Inscription
        </Link>
        , renseignez votre équipe et un effectif d’au moins{" "}
        {TOURNAMENT.minPlayersToSubmit} joueurs — photo d’identité obligatoire pour chaque
        membre (joueurs, coach, staff) — puis soumettez le dossier au comité.
      </>
    ),
  },
  {
    question: "Comment payer les frais ?",
    answer: (
      <>
        Les frais ({TOURNAMENT.registrationFeeFcfa.toLocaleString("fr-FR")} FCFA d’inscription +{" "}
        {TOURNAMENT.participationFeeFcfa.toLocaleString("fr-FR")} FCFA de participation) se
        règlent <strong className="font-medium text-white">en espèces auprès du comité</strong>.
        Après versement, signalez-le dans votre espace coach (« J’ai réglé auprès du comité »).
        Le suivi et le reçu PDF apparaissent une fois le paiement enregistré par le comité.
      </>
    ),
  },
  {
    question: "Qui contacter en cas de problème ?",
    answer: (
      <>
        Un seul point d’entrée : le{" "}
        <strong className="font-medium text-white">WhatsApp secrétariat</strong>{" "}
        <a
          href={TOURNAMENT.contacts.whatsappUrl}
          className="text-[#d4af37] underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {TOURNAMENT.contacts.whatsapp}
        </a>
        {" "}(compte, photo, soumission, calendrier).
      </>
    ),
  },
  {
    question: "Où voir le calendrier et les reports ?",
    answer: (
      <>
        Consultez le{" "}
        <Link href="/calendrier" className="text-[#d4af37] underline-offset-4 hover:underline">
          calendrier public
        </Link>
        . Les reports et annulations sont annoncés sur WhatsApp et mis à jour sur la plateforme.
      </>
    ),
  },
]

export default function AidePage() {
  return (
    <PublicShell>
      <PublicPageHeader
        label="AIDE"
        title="Questions fréquentes"
        description="Inscription, paiement auprès du comité, et contact secrétariat."
      />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="space-y-8">
          {faqs.map((faq) => (
            <section key={faq.question} className="border-b border-white/[0.08] pb-8 last:border-0">
              <h2 className="text-lg font-semibold text-white">{faq.question}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{faq.answer}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-white/65">
          Règlement complet :{" "}
          <Link href="/documents" className="text-[#d4af37] underline-offset-4 hover:underline">
            Documents officiels
          </Link>
          .
        </p>
      </main>
    </PublicShell>
  )
}
