"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePassword } from "@/lib/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight } from "lucide-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password")?.toString() ?? ""
    const confirmation = formData.get("password_confirmation")?.toString() ?? ""

    if (password !== confirmation) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await updatePassword(formData)
    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setIsDone(true)
    setIsLoading(false)
    setTimeout(() => router.push("/dashboard"), 1500)
  }

  if (isDone) {
    return (
      <div className="landing-glass w-full rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white">Mot de passe mis à jour</h2>
        <p className="mt-3 text-sm text-white/60">Redirection vers votre tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="landing-glass w-full rounded-2xl p-8">
      <h2 className="text-xl font-bold text-white">Nouveau mot de passe</h2>
      <p className="mt-2 text-sm text-white/50">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <form action={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
          >
            NOUVEAU MOT DE PASSE
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
          >
            CONFIRMER LE MOT DE PASSE
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {isLoading ? "Mise à jour..." : "Mettre à jour"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
