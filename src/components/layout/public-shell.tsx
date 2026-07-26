import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"

interface PublicShellProps {
  children: React.ReactNode
  className?: string
}

export function PublicShell({ children, className = "" }: PublicShellProps) {
  return (
    <div className={`landing-page min-h-screen ${className}`}>
      <LandingNavbar />
      <div className="pt-16">{children}</div>
      <LandingFooter />
    </div>
  )
}
