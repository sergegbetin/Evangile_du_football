"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signIn } from "@/lib/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, KeyRound } from "lucide-react"
import { DEMO_CREDENTIALS } from "@/lib/demo-data"

const isDev = process.env.NODE_ENV !== "production"

export function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/dashboard"
  const authError = searchParams.get("error")
  const [error, setError] = useState<string | null>(() => {
    if (authError === "auth") {
      return "Échec de l'authentification. Réessayez."
    }
    if (authError === "config") {
      return "Application non configurée. Contactez l'administrateur."
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    formData.set("redirect", redirect)
    const result = await signIn(formData)
    if (result && !result.success) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {isDev && (
        <div className="landing-glass rounded-2xl border border-[#d4af37]/20 p-5">
          <div className="flex items-center gap-2 text-[#d4af37]">
            <KeyRound className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-widest">
              Comptes de démonstration
            </p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <span className="text-white/40">Coach :</span>{" "}
              {DEMO_CREDENTIALS.coach.email} / {DEMO_CREDENTIALS.coach.password}
            </li>
            <li>
              <span className="text-white/40">Comité :</span>{" "}
              {DEMO_CREDENTIALS.committee.email} / {DEMO_CREDENTIALS.committee.password}
            </li>
          </ul>
          <p className="mt-3 text-xs text-white/35">
            Lancez <code className="text-[#d4af37]">npm run seed:demo</code> après
            configuration Supabase.
          </p>
        </div>
      )}

      <div className="landing-glass w-full rounded-2xl p-5 sm:p-8">
        <h2 className="text-xl font-bold text-white">Connexion</h2>
        <p className="mt-2 text-sm text-white/50">
          Accédez à votre espace coach ou comité
        </p>

        <form action={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
            >
              ADRESSE E-MAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={isDev ? DEMO_CREDENTIALS.coach.email : undefined}
              placeholder="coach@exemple.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
            >
              MOT DE PASSE
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              defaultValue={isDev ? DEMO_CREDENTIALS.coach.password : undefined}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-sm">
            <Link href="/mot-de-passe-oublie" className="text-white/45 hover:text-white/70">
              Mot de passe oublié ?
            </Link>
          </p>

          <p className="text-center text-sm text-white/45">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-medium text-[#d4af37] hover:text-[#f0d060]">
              S&apos;inscrire
            </Link>
          </p>
          <p className="text-center text-xs text-white/60">
            Les comptes comité sont créés par l&apos;organisateur — contactez le
            secrétariat. Ne pas utiliser l&apos;inscription coach.
          </p>
        </form>
      </div>
    </div>
  )
}
