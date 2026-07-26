import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStatCardProps {
  title: string
  icon?: LucideIcon
  href?: string
  linkLabel?: string
  children: React.ReactNode
  className?: string
}

export function DashboardStatCard({
  title,
  icon: Icon,
  href,
  linkLabel = "Voir",
  children,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "dashboard-stat-card flex flex-col justify-between p-5 md:p-6",
        className
      )}
    >
      <div>
        <div className="mb-4 flex items-center gap-2">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10 text-[#d4af37]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          )}
          <p className="text-sm font-medium text-white/60">{title}</p>
        </div>
        {children}
      </div>
      {href && (
        <Link
          href={href}
          className="mt-4 inline-flex text-sm font-medium text-[#d4af37] transition-colors hover:text-[#f0d060]"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
