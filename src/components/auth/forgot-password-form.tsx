"use client"

import { useState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight } from "lucide-react"

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await requestPasswordReset(formData)
    if (!result.success) {
      setError(result.error)
    } else {
      setIsSent(true)
    }
    setIsLoading(false)
  }

  if (isSent) {
    return (
      <div className="landing-glass w-full rounded-2xl p-5 sm:p-8 text-center">
        <h2 className="text-xl font-bold text-white">Vérifiez votre boîte mail</h2>
        <p className="mt-3 text-sm text-white/60">
          Si un compte existe pour cette adresse, un lien de réinitialisation vient
          d&apos;être envoyé.
        </p>
        <Link
          href="/connexion"
          className="mt-6 inline-block text-sm font-medium text-[#d4af37] hover:text-[#f0d060]"
        >
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="landing-glass w-full rounded-2xl p-5 sm:p-8">
      <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
      <p className="mt-2 text-sm text-white/50">
        Recevez un lien pour réinitialiser votre mot de passe par e-mail.
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
            placeholder="coach@exemple.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isLoading ? "Envoi..." : "Envoyer le lien"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>

        <p className="text-center text-sm text-white/45">
          <Link href="/connexion" className="font-medium text-[#d4af37] hover:text-[#f0d060]">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  )
}
