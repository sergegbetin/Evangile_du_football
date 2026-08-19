import { cn } from "@/lib/utils"
import { ButtonLink } from "@/components/ui/button-link"

interface DashboardEmptyStateProps {
  message: string
  className?: string
  actionHref?: string
  actionLabel?: string
}

export function DashboardEmptyState({
  message,
  className,
  actionHref,
  actionLabel,
}: DashboardEmptyStateProps) {
  return (
    <div className={cn("py-10 text-center", className)}>
      <p className="text-sm text-white/60">{message}</p>
      {actionHref && actionLabel && (
        <ButtonLink href={actionHref} className="mt-4">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  )
}

interface DashboardTableEmptyRowProps {
  colSpan: number
  message: string
}

export function DashboardTableEmptyRow({ colSpan, message }: DashboardTableEmptyRowProps) {
  return (
    <tr className="border-white/[0.06]">
      <td colSpan={colSpan} className="p-0">
        <DashboardEmptyState message={message} />
      </td>
    </tr>
  )
}
