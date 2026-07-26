import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Auth-aligned field geometry under .landing-page / .dashboard-page */
const brandScopeFieldClasses =
  "[.landing-page_&]:h-auto [.landing-page_&]:min-h-[2.75rem] [.landing-page_&]:rounded-xl [.landing-page_&]:border-white/10 [.landing-page_&]:bg-white/5 [.landing-page_&]:px-4 [.landing-page_&]:py-3 [.landing-page_&]:text-sm [.landing-page_&]:text-white [.landing-page_&]:placeholder:text-white/30 [.landing-page_&]:focus-visible:border-[#d4af37]/50 [.landing-page_&]:focus-visible:ring-2 [.landing-page_&]:focus-visible:ring-[#d4af37]/20 [.dashboard-page_&]:h-auto [.dashboard-page_&]:min-h-[2.75rem] [.dashboard-page_&]:rounded-xl [.dashboard-page_&]:border-white/10 [.dashboard-page_&]:bg-white/5 [.dashboard-page_&]:px-4 [.dashboard-page_&]:py-3 [.dashboard-page_&]:text-sm [.dashboard-page_&]:text-white [.dashboard-page_&]:placeholder:text-white/30 [.dashboard-page_&]:focus-visible:border-[#d4af37]/50 [.dashboard-page_&]:focus-visible:ring-2 [.dashboard-page_&]:focus-visible:ring-[#d4af37]/20"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        brandScopeFieldClasses,
        className
      )}
      {...props}
    />
  )
}

export { Input, brandScopeFieldClasses }
