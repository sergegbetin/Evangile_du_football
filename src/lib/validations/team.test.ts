import { describe, expect, it } from "vitest"
import { teamRegistrationSchema, teamReviewSchema, teamSubmitSchema } from "@/lib/validations/team"
import { TEST_UUID } from "@/lib/validations/test-ids"

describe("teamRegistrationSchema", () => {
  it("accepts a valid team registration", () => {
    const result = teamRegistrationSchema.safeParse({
      name: "Disciples FC",
      church: "Église Évangélique de Godomey",
      contact_phone: "01 62 93 91 66",
    })
    expect(result.success).toBe(true)
  })

  it("rejects names that are too short", () => {
    const result = teamRegistrationSchema.safeParse({
      name: "D",
      church: "Église",
      contact_phone: "01 62 93 91 66",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing church", () => {
    const result = teamRegistrationSchema.safeParse({
      name: "Disciples FC",
      church: "A",
      contact_phone: "01 62 93 91 66",
    })
    expect(result.success).toBe(false)
  })

  it("rejects names that are too long", () => {
    const result = teamRegistrationSchema.safeParse({
      name: "A".repeat(51),
      church: "Église",
      contact_phone: "01 62 93 91 66",
    })
    expect(result.success).toBe(false)
  })
})

describe("teamSubmitSchema", () => {
  it("requires a valid UUID", () => {
    expect(teamSubmitSchema.safeParse({ teamId: "not-a-uuid" }).success).toBe(false)
    expect(teamSubmitSchema.safeParse({ teamId: TEST_UUID }).success).toBe(true)
  })
})

describe("teamReviewSchema", () => {
  it("accepts approve without a rejection reason", () => {
    const result = teamReviewSchema.safeParse({
      teamId: TEST_UUID,
      action: "approve",
    })
    expect(result.success).toBe(true)
  })

  it("accepts reject with a rejection reason", () => {
    const result = teamReviewSchema.safeParse({
      teamId: TEST_UUID,
      action: "reject",
      rejectionReason: "Dossier incomplet",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid action", () => {
    const result = teamReviewSchema.safeParse({
      teamId: TEST_UUID,
      action: "delete",
    })
    expect(result.success).toBe(false)
  })
})
