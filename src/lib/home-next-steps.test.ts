import { describe, expect, it } from "vitest"
import {
  firstIncompleteStep,
  getHomeNextSteps,
  type HomeNextStepsSnapshot,
} from "@/lib/home-next-steps"

const coachBase: HomeNextStepsSnapshot = {
  role: "coach",
  teamStatus: null,
  photographedPlayerCount: 0,
  paymentStatus: "impaye",
  submittedTeamCount: 0,
  pendingCashCount: 0,
  needsCalendarAction: false,
}

describe("getHomeNextSteps", () => {
  it("sends a coach with no team to /dashboard/equipe", () => {
    const steps = getHomeNextSteps(coachBase)
    expect(firstIncompleteStep(steps)?.href).toBe("/dashboard/equipe")
  })

  it("sends a draft team with five photographed players to effectif", () => {
    const steps = getHomeNextSteps({
      ...coachBase,
      teamStatus: "draft",
      photographedPlayerCount: 5,
    })
    expect(firstIncompleteStep(steps)?.href).toBe("/dashboard/effectif")
  })

  it("sends an approved unpaid coach to /dashboard/paiements", () => {
    const steps = getHomeNextSteps({
      ...coachBase,
      teamStatus: "approved",
      photographedPlayerCount: 6,
      paymentStatus: "impaye",
    })
    expect(firstIncompleteStep(steps)?.href).toBe("/dashboard/paiements")
  })

  it("sends committee with submitted teams to /admin/equipes", () => {
    const steps = getHomeNextSteps({
      ...coachBase,
      role: "committee",
      submittedTeamCount: 2,
    })
    expect(firstIncompleteStep(steps)?.href).toBe("/admin/equipes")
  })

  it("marks all committee steps done when queues are empty", () => {
    const steps = getHomeNextSteps({
      ...coachBase,
      role: "committee",
      submittedTeamCount: 0,
      pendingCashCount: 0,
      needsCalendarAction: false,
    })
    expect(steps.every((step) => step.done)).toBe(true)
    expect(firstIncompleteStep(steps)).toBeUndefined()
  })
})
