import { cn } from "@/lib/utils"

interface DashboardEmptyStateProps {
  message: string
  className?: string
}

export function DashboardEmptyState({ message, className }: DashboardEmptyStateProps) {
  return (
    <p
      className={cn(
        "py-10 text-center text-sm text-white/60",
        className
      )}
    >
      {message}
    </p>
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
