"use client"

import { useState } from "react"
import Link from "next/link"
import { signUp } from "@/lib/actions/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Trophy } from "lucide-react"
import { TOURNAMENT } from "@/lib/constants"

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setInfo(null)
    const result = await signUp(formData)
    if (result && "needsConfirmation" in result && result.needsConfirmation) {
      setInfo(result.message)
      setIsLoading(false)
      return
    }
    if (result && !result.success) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="landing-glass w-full rounded-2xl p-5 sm:p-8">
      <h2 className="text-xl font-bold text-white">Inscription coach</h2>
      <p className="mt-2 text-sm text-white/50">
        Créez votre compte pour inscrire votre équipe
      </p>

      <form action={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {info && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10">
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}

        {[
          { id: "full_name", name: "full_name", label: "NOM COMPLET", placeholder: "Jean Dupont", type: "text", required: true },
          { id: "phone", name: "phone", label: "TÉLÉPHONE", placeholder: "01 XX XX XX XX", type: "tel", required: false },
          { id: "email", name: "email", label: "ADRESSE E-MAIL", placeholder: "coach@exemple.com", type: "email", required: true },
          { id: "password", name: "password", label: "MOT DE PASSE", placeholder: "Minimum 6 caractères", type: "password", required: true, minLength: 6 },
        ].map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="mb-2 block text-[10px] font-semibold tracking-widest text-white/40"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.name}
              type={field.type}
              required={field.required}
              minLength={field.minLength}
              autoComplete={field.id === "email" ? "email" : field.id === "password" ? "new-password" : undefined}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/20"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c9a030] py-4 font-bold text-[#050608] transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          <Trophy className="h-5 w-5" />
          {isLoading ? "Inscription..." : "Créer mon compte"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>

        <p className="text-center text-xs text-white/35">
          Frais : {TOURNAMENT.totalFeeFcfa.toLocaleString("fr-FR")} FCFA par équipe
        </p>

        <p className="text-center text-sm text-white/45">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-[#d4af37] hover:text-[#f0d060]">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}
