import Link from "next/link"
import { Heart } from "lucide-react"
import { TournamentLogo } from "@/components/landing/tournament-logo"
import { TOURNAMENT } from "@/lib/constants"

const tournoiLinks = [
  { href: "/#tournoi", label: "Présentation" },
  { href: "/documents", label: "Règlement" },
  { href: "/aide", label: "Aide" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/classement#poules", label: "Poules" },
  { href: "/classement", label: "Classement" },
  { href: "/#galerie", label: "Galerie" },
]

const participerLinks = [
  { href: "/inscription", label: "Inscrire une équipe" },
  { href: "/connexion", label: "Espace coach" },
  { href: "/#contact", label: "Devenir partenaire" },
  { href: "/#contact", label: "Contact" },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#050608]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <TournamentLogo size="sm" />
              <div>
                <p className="font-bold text-white">L&apos;Évangile</p>
                <p className="text-xs text-white/40">selon le Football</p>
              </div>
            </div>
            <p className="mt-4 text-sm tracking-widest text-[#d4af37]/70">
              Jouer • Annoncer • Édifier
            </p>
            <p className="mt-2 text-sm text-white/40">
              Tournoi chrétien de football — {TOURNAMENT.edition}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest text-[#d4af37]">
              TOURNOI
            </h3>
            <ul className="mt-4 space-y-2">
              {tournoiLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-[#d4af37]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest text-[#d4af37]">
              PARTICIPER
            </h3>
            <ul className="mt-4 space-y-2">
              {participerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-[#d4af37]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest text-[#d4af37]">
              CONTACT
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/50">
              <li>
                WhatsApp :{" "}
                <a
                  href={TOURNAMENT.contacts.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#d4af37]"
                >
                  {TOURNAMENT.contacts.whatsapp}
                </a>
              </li>
              <li>
                Tél :{" "}
                <a
                  href={TOURNAMENT.contacts.phoneUrl}
                  className="transition-colors hover:text-[#d4af37]"
                >
                  {TOURNAMENT.contacts.phone}
                </a>
              </li>
              <li>{TOURNAMENT.city}</li>
              <li>{TOURNAMENT.venue}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-white/35 md:flex-row">
          <p>
            © 2026 {TOURNAMENT.name}. Tous droits réservés.
          </p>
          <p className="flex items-center gap-1.5 text-[#d4af37]/60">
            <Heart className="h-3.5 w-3.5 fill-current" />
            Fait pour Sa gloire
          </p>
        </div>
      </div>
    </footer>
  )
}
