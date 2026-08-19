import { Circle } from "lucide-react"
import { GALLERY_IMAGES } from "@/lib/landing-data"
import { ScrollReveal } from "@/components/landing/scroll-reveal"

export function LandingGallery() {
  return (
    <section id="galerie" className="bg-[#050608] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal className="text-center">
          <p className="landing-section-label inline-flex items-center">
            <Circle className="mx-2 h-1.5 w-1.5 fill-[#d4af37] text-[#d4af37]" />
            GALERIE
          </p>
          <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
            Les moments forts
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_IMAGES.map((image, index) => (
            <ScrollReveal key={image.alt} delay={index * 60}>
              <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/15 bg-gradient-to-br from-[#1A3A6B] to-[#050608] p-8">
                <p className="text-lg font-semibold text-white">{image.alt}</p>
                <p className="mt-2 text-sm text-white/50">Édition 2026</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
