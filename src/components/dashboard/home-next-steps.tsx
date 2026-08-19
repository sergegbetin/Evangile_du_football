import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"
import {
  firstIncompleteStep,
  type HomeNextStep,
} from "@/lib/home-next-steps"
import { ButtonLink } from "@/components/ui/button-link"
import { cn } from "@/lib/utils"

interface HomeNextStepsListProps {
  steps: HomeNextStep[]
  title?: string
}

export function HomeNextStepsList({
  steps,
  title = "À faire maintenant",
}: HomeNextStepsListProps) {
  const next = firstIncompleteStep(steps)

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      aria-labelledby="home-next-steps-heading"
    >
      <h2 id="home-next-steps-heading" className="text-lg font-semibold text-white">
        {title}
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex min-h-11 items-start gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-white/[0.04]",
                step.done ? "text-white/50" : "text-white"
              )}
            >
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#d4af37]" aria-hidden />
              )}
              <span className={step.done ? "line-through decoration-white/30" : undefined}>
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {next && (
        <ButtonLink href={next.href} className="mt-5">
          {next.label}
        </ButtonLink>
      )}
    </section>
  )
}
