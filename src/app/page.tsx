import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingStats } from "@/components/landing/landing-stats"
import { LandingCountdown } from "@/components/landing/landing-countdown"
import { LandingPresentation } from "@/components/landing/landing-presentation"
import { LandingValues } from "@/components/landing/landing-values"
import { HomeStandingsBlock } from "@/components/landing/home-standings-block"
import { HomeMatchesBlock } from "@/components/landing/home-matches-block"
import { LandingGallery } from "@/components/landing/landing-gallery"
import { LandingPartners } from "@/components/landing/landing-partners"
import { LandingContact } from "@/components/landing/landing-contact"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />

      <main>
        <LandingHero />
        <LandingStats />
        <LandingCountdown />
        <LandingPresentation />
        <LandingValues />

        <section id="classement" className="bg-[#050608] py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:gap-10">
            <HomeStandingsBlock />
            <HomeMatchesBlock />
          </div>
        </section>

        <LandingGallery />
        <LandingPartners />
        <LandingContact />
      </main>

      <LandingFooter />
    </div>
  )
}
