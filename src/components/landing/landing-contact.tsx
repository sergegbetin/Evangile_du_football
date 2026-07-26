import Link from "next/link"
import { ArrowRight, Circle, Mail, MapPin, Phone, Trophy } from "lucide-react"
import { TOURNAMENT } from "@/lib/constants"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function LandingContact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#080c14] py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <p className="landing-section-label inline-flex items-center">
              <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
              REJOIGNEZ L&apos;AVENTURE
            </p>
            <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Prêts à jouer{" "}
              <span className="landing-text-gold">pour Sa gloire ?</span>
            </h2>
            <p className="mt-6 leading-relaxed text-white/55">
              Les inscriptions sont ouvertes pour le tournoi chrétien de
              football {TOURNAMENT.edition}. Rejoignez {TOURNAMENT.maxTeams}{" "}
              équipes au {TOURNAMENT.venue}.
            </p>

            <ul className="mt-10 space-y-6">
              <li className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#d4af37]">
                    WHATSAPP
                  </p>
                  <a
                    href={TOURNAMENT.contacts.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-white transition-colors hover:text-[#d4af37]"
                  >
                    {TOURNAMENT.contacts.whatsapp}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#d4af37]">
                    TÉLÉPHONE
                  </p>
                  <a
                    href={TOURNAMENT.contacts.phoneUrl}
                    className="mt-1 block text-white transition-colors hover:text-[#d4af37]"
                  >
                    {TOURNAMENT.contacts.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#d4af37]">
                    LIEU
                  </p>
                  <p className="mt-1 text-white">
                    {TOURNAMENT.venue} — {TOURNAMENT.city}
                  </p>
                </div>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="landing-glass rounded-3xl p-8 shadow-2xl shadow-black/40">
              <h3 className="text-xl font-bold text-white">Nous contacter</h3>
              <p className="mt-3 text-sm text-white/55">
                Une question sur le tournoi ou l&apos;inscription ? Écrivez-nous
                sur WhatsApp ou appelez-nous directement.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href={TOURNAMENT.contacts.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 py-4 font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/20"
                >
                  <Mail className="h-5 w-5" />
                  WhatsApp — {TOURNAMENT.contacts.whatsapp}
                </a>

                <a
                  href={TOURNAMENT.contacts.phoneUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <Phone className="h-5 w-5" />
                  Appeler — {TOURNAMENT.contacts.phone}
                </a>

                <Link
                  href="/inscription"
                  className="landing-gold-glow mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02]"
                >
                  <Trophy className="h-5 w-5" />
                  Inscrire mon équipe
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="mt-6 text-center text-xs text-white/35">
                Frais d&apos;inscription :{" "}
                {TOURNAMENT.totalFeeFcfa.toLocaleString("fr-FR")} FCFA par
                équipe
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
