import Image from "next/image"
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
              <figure className="group relative overflow-hidden rounded-2xl border border-[#d4af37]/15">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent" />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold text-white">{image.alt}</p>
                  <p className="mt-1 text-xs text-white/55">Édition 2026</p>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
