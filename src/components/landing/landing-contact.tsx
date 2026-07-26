"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, Circle, Mail, MapPin, Phone, Trophy } from "lucide-react"
import { TOURNAMENT } from "@/lib/constants"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function LandingContact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

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
                  <p className="mt-1 text-white">{TOURNAMENT.contacts.whatsapp}</p>
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
                  <p className="mt-1 text-white">{TOURNAMENT.contacts.phone}</p>
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
              <h3 className="text-xl font-bold text-white">
                Inscrire mon équipe
              </h3>

              {submitted ? (
                <div className="mt-8 text-center">
                  <p className="text-white/70">
                    Merci ! Finalisez votre inscription sur la plateforme.
                  </p>
                  <Link
                    href="/inscription"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#050608]"
                  >
                    Continuer l&apos;inscription
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {[
                    {
                      name: "team",
                      label: "NOM DE L'ÉQUIPE",
                      placeholder: "Ex: Disciples FC",
                    },
                    {
                      name: "captain",
                      label: "RESPONSABLE / CAPITAINE",
                      placeholder: "Prénom et nom",
                    },
                    {
                      name: "email",
                      label: "EMAIL DE CONTACT",
                      placeholder: "contact@eglise.bj",
                      type: "email",
                    },
                    {
                      name: "phone",
                      label: "TÉLÉPHONE",
                      placeholder: "01 XX XX XX XX",
                    },
                    {
                      name: "church",
                      label: "ÉGLISE / ORGANISATION",
                      placeholder: "Nom de votre église",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type ?? "text"}
                        required
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="landing-gold-glow mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02]"
                  >
                    <Trophy className="h-5 w-5" />
                    Envoyer l&apos;inscription
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-white/35">
                    Frais d&apos;inscription :{" "}
                    {TOURNAMENT.totalFeeFcfa.toLocaleString("fr-FR")} FCFA par
                    équipe • Réponse sous 48h
                  </p>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
