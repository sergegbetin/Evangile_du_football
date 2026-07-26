import { headers } from "next/headers"
import { requireAuth } from "@/lib/auth"
import { isPreviewMode } from "@/lib/preview-mode"
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()
  await headers()
  const isPreview = isPreviewMode()

  return (
    <div className="dashboard-page min-h-screen">
      <DashboardLayoutClient profile={profile} isPreview={isPreview}>
        {children}
      </DashboardLayoutClient>
    </div>
  )
}
