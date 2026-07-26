import Image from "next/image"
import { getTeamInitials, getTeamLogoPath } from "@/lib/pool-data"
import { cn } from "@/lib/utils"

interface TeamBadgeProps {
  name: string
  size?: "sm" | "md"
  showName?: boolean
  align?: "start" | "end"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
} as const

export function TeamBadge({
  name,
  size = "md",
  showName = true,
  align = "start",
  className,
}: TeamBadgeProps) {
  const logoPath = getTeamLogoPath(name)
  const initials = getTeamInitials(name)

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "end" && "flex-row-reverse text-right",
        className
      )}
    >
      {logoPath ? (
        <span
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/5",
            sizeClasses[size]
          )}
        >
          <Image
            src={logoPath}
            alt={`Logo ${name}`}
            fill
            className="object-cover"
            sizes={size === "sm" ? "32px" : "40px"}
          />
        </span>
      ) : (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 font-bold tracking-wide text-[#d4af37]",
            sizeClasses[size]
          )}
          aria-hidden
        >
          {initials}
        </span>
      )}
      {showName ? <span className="font-semibold text-white">{name}</span> : null}
    </div>
  )
}
