import { cn } from "@/lib/utils"

interface DashboardPageShellProps {
  children: React.ReactNode
  className?: string
}

/** Conteneur uniforme pour toutes les pages dashboard */
export function DashboardPageShell({
  children,
  className,
}: DashboardPageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-6", className)}>
      {children}
    </div>
  )
}
