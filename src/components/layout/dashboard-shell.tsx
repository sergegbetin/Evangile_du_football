"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  X,
} from "lucide-react"
import { TOURNAMENT } from "@/lib/constants"
import { isCommitteeRole } from "@/lib/roles"
import type { Profile, UserRole } from "@/types/database"
import { signOut } from "@/lib/actions/auth"
import { TournamentLogo } from "@/components/landing/tournament-logo"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  profile: Profile
  children: React.ReactNode
  currentPath: string
  isPreview: boolean
}

const coachLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/equipe", label: "Mon équipe", icon: Home },
  { href: "/dashboard/effectif", label: "Effectif", icon: Users },
  { href: "/dashboard/paiements", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/reclamations", label: "Réclamations", icon: MessageSquare },
]

const adminLinks = [
  { href: "/admin/equipes", label: "Validation équipes", icon: ClipboardList },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/calendrier", label: "Calendrier", icon: Calendar },
  { href: "/admin/reclamations", label: "Réclamations", icon: MessageSquare },
  { href: "/admin/documents", label: "Documents", icon: FileText },
]

const ROLE_LABELS: Record<UserRole, string> = {
  coach: "Coach",
  committee: "Comité",
  referee: "Arbitre",
  discipline: "Discipline",
  super_admin: "Administrateur",
}

function NavLinks({
  links,
  currentPath,
  onNavigate,
}: {
  links: typeof coachLinks
  currentPath: string
  onNavigate?: () => void
}) {
  return (
    <>
      {links.map((link) => {
        const Icon = link.icon
        const isActive = currentPath === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-[#d4af37]/12 font-medium text-[#f0d060] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.25)]"
                : "text-white/65 hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </>
  )
}

export function DashboardShell({
  profile,
  children,
  currentPath,
  isPreview,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const showAdmin = isCommitteeRole(profile.role) || isPreview

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-[#080c14] md:flex">
        <div className="border-b border-white/5 p-4">
          <Link href="/" className="flex items-center gap-3">
            <TournamentLogo size="sm" />
            <div>
              <span className="block text-sm font-bold text-white">L&apos;Évangile</span>
              <span className="block text-[10px] text-white/70">{TOURNAMENT.edition}</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Navigation tableau de bord">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70">
            Espace coach
          </p>
          <NavLinks links={coachLinks} currentPath={currentPath} />

          {showAdmin && (
            <>
              <p className="mt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Administration
              </p>
              <NavLinks links={adminLinks} currentPath={currentPath} />
            </>
          )}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
            <span className="shrink-0 rounded-md bg-[#d4af37]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#d4af37]">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
          <p className="truncate text-xs text-white/60">{profile.email}</p>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#080c14] transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <TournamentLogo size="sm" />
            <span className="text-sm font-bold text-white">Menu</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-white/70"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavLinks
            links={coachLinks}
            currentPath={currentPath}
            onNavigate={() => setMobileOpen(false)}
          />
          {showAdmin && (
            <>
              <p className="mt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Administration
              </p>
              <NavLinks
                links={adminLinks}
                currentPath={currentPath}
                onNavigate={() => setMobileOpen(false)}
              />
            </>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-white/5 bg-[#080c14]/80 px-4 backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-white"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <TournamentLogo size="sm" />
          </Link>
          <form action={signOut}>
            <button type="submit" className="rounded-lg p-2 text-white/60" aria-label="Déconnexion">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </header>
        <main className="dashboard-main-bg flex-1 p-4 md:p-8 lg:p-10">
          {isPreview && (
            <div className="mb-6 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f0d060]">
              <strong>Mode aperçu</strong> — données fictives. Configurez Supabase pour
              enregistrer et vous connecter réellement.{" "}
              <a href="/connexion" className="underline hover:text-white">
                Connexion
              </a>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
