import Image from "next/image"

const sizes = {
  sm: { box: "h-10 w-10", image: 40 },
  md: { box: "h-16 w-16", image: 64 },
  lg: { box: "h-20 w-20", image: 80 },
  xl: { box: "h-28 w-28", image: 112 },
} as const

interface TournamentLogoProps {
  size?: keyof typeof sizes
  className?: string
  withGlow?: boolean
}

export function TournamentLogo({
  size = "sm",
  className = "",
  withGlow = false,
}: TournamentLogoProps) {
  const { box, image } = sizes[size]

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${
        withGlow ? "animate-pulse-gold shadow-2xl shadow-[#d4af37]/30" : ""
      } ${box} ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Logo L'Évangile selon le Football"
        width={image}
        height={image}
        className="h-full w-full object-contain"
        priority={size === "lg" || size === "xl"}
      />
    </div>
  )
}
