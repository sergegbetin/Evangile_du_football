type DashboardSection = "coach" | "admin"

const SECTION_LABELS: Record<DashboardSection, string> = {
  coach: "Espace coach",
  admin: "Administration",
}

interface DashboardPageHeaderProps {
  title: string
  description?: string
  section?: DashboardSection
}

export function DashboardPageHeader({
  title,
  description,
  section = "coach",
}: DashboardPageHeaderProps) {
  return (
    <header className="mb-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
        {SECTION_LABELS[section]}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/55">
          {description}
        </p>
      )}
    </header>
  )
}
