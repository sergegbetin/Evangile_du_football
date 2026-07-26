import Link from "next/link"
import { Eye, LayoutDashboard, Shield } from "lucide-react"
import { isPreviewMode } from "@/lib/preview-mode"

const previewLinks = [
  {
    href: "/dashboard",
    label: "Dashboard coach",
    description: "Équipe, effectif, paiements, réclamations",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/equipes",
    label: "Administration comité",
    description: "Validation, paiements, calendrier, réclamations",
    icon: Shield,
  },
]

export function PreviewExplorerLinks() {
  if (!isPreviewMode()) return null

  return (
    <div className="landing-glass w-full max-w-md rounded-2xl border border-emerald-500/20 p-6">
      <div className="flex items-center gap-2 text-emerald-400">
        <Eye className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-widest">
          Explorer sans Supabase
        </p>
      </div>
      <p className="mt-2 text-sm text-white/50">
        Parcourez toutes les interfaces avec des données fictives — aucune connexion
        requise.
      </p>
      <ul className="mt-4 space-y-2">
        {previewLinks.map((link) => {
          const Icon = link.icon
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#d4af37]/30 hover:bg-white/[0.07]"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#d4af37]" />
                <span>
                  <span className="block font-semibold text-white">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-white/45">
                    {link.description}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
