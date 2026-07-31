import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"

interface PublicShellProps {
  children: React.ReactNode
  className?: string
}

export function PublicShell({ children, className = "" }: PublicShellProps) {
  return (
    <div className={`landing-page min-h-[100dvh] overflow-x-clip ${className}`}>
      <LandingNavbar />
      <div className="pt-[calc(4rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
      <LandingFooter />
    </div>
  )
}
