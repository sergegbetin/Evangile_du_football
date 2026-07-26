import { cn } from "@/lib/utils"

interface DashboardPanelProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function DashboardPanel({
  title,
  description,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <section className={cn("dashboard-panel", className)}>
      {(title || description) && (
        <header className="border-b border-white/[0.06] px-5 py-4 md:px-6">
          {title && (
            <h2 className="text-base font-semibold text-white">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-white/50">{description}</p>
          )}
        </header>
      )}
      <div className={cn("p-5 md:p-6", contentClassName)}>{children}</div>
    </section>
  )
}
