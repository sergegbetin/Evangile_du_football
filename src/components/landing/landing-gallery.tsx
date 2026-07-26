import { Circle, Play } from "lucide-react"
import Image from "next/image"
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

        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {GALLERY_IMAGES.map((image, index) => (
            <ScrollReveal key={image.src} delay={index * 60} className="mb-4 break-inside-avoid">
              <div className="group relative overflow-hidden rounded-2xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={800}
                  height={index % 2 === 0 ? 600 : 500}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <div className="flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-[#d4af37] text-[#050608] shadow-xl transition-transform duration-300 group-hover:scale-100">
                    <Play className="h-6 w-6 fill-current pl-0.5" aria-hidden />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
