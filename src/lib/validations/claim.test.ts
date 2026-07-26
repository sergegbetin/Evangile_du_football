import { describe, expect, it } from "vitest"
import { createClaimSchema, processClaimSchema } from "@/lib/validations/claim"

import { TEST_UUID } from "@/lib/validations/test-ids"

const validId = TEST_UUID

describe("createClaimSchema", () => {
  it("accepts a valid claim", () => {
    const result = createClaimSchema.safeParse({
      team_id: validId,
      match_id: validId,
      subject: "Score contesté",
      description: "Le score affiché ne correspond pas à ce qui s'est passé sur le terrain.",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a subject that is too short", () => {
    const result = createClaimSchema.safeParse({
      team_id: validId,
      match_id: validId,
      subject: "Scor",
      description: "Le score affiché ne correspond pas à ce qui s'est passé sur le terrain.",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a description that is too short", () => {
    const result = createClaimSchema.safeParse({
      team_id: validId,
      match_id: validId,
      subject: "Score contesté",
      description: "Trop court",
    })
    expect(result.success).toBe(false)
  })

  it("requires a valid match_id", () => {
    const result = createClaimSchema.safeParse({
      team_id: validId,
      match_id: "not-a-uuid",
      subject: "Score contesté",
      description: "Le score affiché ne correspond pas à ce qui s'est passé sur le terrain.",
    })
    expect(result.success).toBe(false)
  })
})

describe("processClaimSchema", () => {
  it("accepts a valid decision", () => {
    const result = processClaimSchema.safeParse({
      claim_id: validId,
      status: "decided",
      decision: "accepted",
      decision_notes: "Vérifié avec la feuille de match officielle.",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid status", () => {
    const result = processClaimSchema.safeParse({
      claim_id: validId,
      status: "closed",
      decision: "accepted",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid decision", () => {
    const result = processClaimSchema.safeParse({
      claim_id: validId,
      status: "decided",
      decision: "maybe",
    })
    expect(result.success).toBe(false)
  })
})
