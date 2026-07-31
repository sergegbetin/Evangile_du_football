import Link from "next/link"
import { ArrowLeft, Circle } from "lucide-react"

interface PublicPageHeaderProps {
  label: string
  title: string
  description?: string
  backHref?: string
  backLabel?: string
}

export function PublicPageHeader({
  label,
  title,
  description,
  backHref = "/",
  backLabel = "Retour à l'accueil",
}: PublicPageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-white/5 bg-[#080c14]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1)_0%,transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <Link
          href={backHref}
          className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-white/50 transition-colors hover:text-[#d4af37]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <p className="landing-section-label inline-flex items-center">
          <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
          {label}
        </p>
        <h1 className="mt-4 text-[clamp(1.75rem,6vw,3rem)] font-bold text-white md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-white/55">{description}</p>
        )}
      </div>
    </div>
  )
}
