import { TOURNAMENT } from "@/lib/constants"
import { computeTotalMatchCount } from "@/lib/tournament-rules"

const TOURNAMENT_POOL_COUNT = 2

export const LANDING_STATS = [
  { value: TOURNAMENT.maxTeams, suffix: "", label: "ÉQUIPES" },
  { value: TOURNAMENT.maxTeams * TOURNAMENT.maxPlayers, suffix: "+", label: "JOUEURS" },
  {
    value: computeTotalMatchCount({
      poolCount: TOURNAMENT_POOL_COUNT,
      poolSize: TOURNAMENT.maxTeams / TOURNAMENT_POOL_COUNT,
    }),
    suffix: "",
    label: "MATCHS",
  },
  { value: 1, suffix: "", label: "CHAMPION" },
] as const

export const LANDING_VALUES = [
  {
    title: "Foi",
    icon: "heart",
    description:
      "Le tournoi est ancré dans une foi vivante. Chaque match commence par la prière et se conclut par un temps de partage spirituel.",
    verse: "Je puis tout par celui qui me fortifie.",
    reference: "Phil. 4:13",
  },
  {
    title: "Fair-play",
    icon: "shield",
    description:
      "L'intégrité sur le terrain est notre témoignage. Nous jouons avec excellence, respect et dans l'esprit du Seigneur.",
    verse: "Que tout ce que vous faites soit fait avec amour.",
    reference: "1 Cor. 16:14",
  },
  {
    title: "Évangélisation",
    icon: "globe",
    description:
      "Chaque édition est l'occasion d'annoncer l'Évangile aux spectateurs, aux joueurs adverses et à toute la communauté.",
    verse: "Allez par tout le monde...",
    reference: "Marc 16:15",
  },
] as const

export const LANDING_CHECKPOINTS = [
  "Ouvert aux églises évangéliques et équipes invitées",
  "Cultes et temps de prière entre les matchs",
  "Programme d'évangélisation dans les quartiers",
  "Remise du trophée lors d'une cérémonie officielle",
] as const

export const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    alt: "Stade illuminé la nuit",
  },
  {
    src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    alt: "Ballon au fond du filet",
  },
  {
    src: "https://images.unsplash.com/photo-1560272564-c83b66b1ad44?w=800&q=80",
    alt: "Trophée sur le gazon",
  },
  {
    src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
    alt: "Joueur en action",
  },
  {
    src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80",
    alt: "Match en cours",
  },
  {
    src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    alt: "Célébration victoire",
  },
] as const

export const LANDING_PARTNERS = [
  { name: "CEG Godomey", role: "Partenaire Terrain" },
  { name: "Comité d'Organisation", role: "Partenaire Principal" },
  { name: "Églises Évangéliques", role: "Partenaire Spirituel" },
  { name: "Petit Camp", role: "Partenaire Événementiel" },
  { name: "HK Hippolyte", role: "Partenaire Médias" },
  { name: "Youth Impact", role: "Partenaire Jeunesse" },
] as const

/** Date cible du compte à rebours : match d'ouverture */
export const COUNTDOWN_TARGET = new Date("2026-07-26T16:00:00+01:00")

export const TIMELINE_EVENTS = [
  {
    date: "19 JUILLET 2026",
    title: "Tirage au sort",
    description:
      "Composition des groupes et programme complet du tournoi.",
    icon: "target",
  },
  {
    date: "26 JUILLET 2026",
    title: "Match d'ouverture",
    description:
      "Cérémonie d'ouverture et premier match officiel du tournoi.",
    icon: "play",
  },
] as const
