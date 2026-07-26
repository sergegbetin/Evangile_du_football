"use client"

import { usePathname } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Profile } from "@/types/database"

interface DashboardLayoutClientProps {
  profile: Profile
  isPreview: boolean
  children: React.ReactNode
}

export function DashboardLayoutClient({
  profile,
  isPreview,
  children,
}: DashboardLayoutClientProps) {
  const pathname = usePathname()

  return (
    <DashboardShell profile={profile} currentPath={pathname} isPreview={isPreview}>
      {children}
    </DashboardShell>
  )
}
