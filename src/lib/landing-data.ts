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
  { alt: "Prière avant le coup d'envoi" },
  { alt: "Football à 6 au CEG Godomey" },
  { alt: "Trophée de l'édition" },
  { alt: "Fair-play entre églises" },
  { alt: "Public autour du terrain" },
  { alt: "Célébration en équipe" },
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
