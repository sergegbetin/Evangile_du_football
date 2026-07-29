import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { isPreviewMode } from "@/lib/preview-mode"

const protectedPrefixes = ["/dashboard", "/admin"]

const coachOnlyPrefixes = [
  "/dashboard/equipe",
  "/dashboard/effectif",
  "/dashboard/paiements",
  "/dashboard/reclamations",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // One auth round-trip for session refresh + identity (no duplicate getUser).
  const { response: supabaseResponse, user, supabase } = await updateSession(request)

  if (!isProtected) {
    return supabaseResponse
  }

  if (!isSupabaseConfigured()) {
    if (isPreviewMode()) {
      return supabaseResponse
    }

    const url = request.nextUrl.clone()
    url.pathname = "/connexion"
    url.searchParams.set("error", "config")
    return NextResponse.redirect(url)
  }

  if (!user || !supabase) {
    const url = request.nextUrl.clone()
    url.pathname = "/connexion"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const needsRoleCheck =
    pathname.startsWith("/admin")
    || coachOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (needsRoleCheck) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (pathname.startsWith("/admin")) {
      if (
        !profile ||
        !["committee", "super_admin"].includes(profile.role)
      ) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    } else if (profile && profile.role !== "coach") {
      const url = request.nextUrl.clone()
      url.pathname = ["committee", "super_admin"].includes(profile.role)
        ? "/admin/equipes"
        : "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
