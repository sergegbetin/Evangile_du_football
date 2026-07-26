import { describe, expect, it } from "vitest"
import { rosterMemberFormSchema, rosterMemberSchema } from "@/lib/validations/roster"
import { TEST_UUID } from "@/lib/validations/test-ids"

describe("rosterMemberSchema", () => {
  it("accepts a valid player", () => {
    const result = rosterMemberSchema.safeParse({
      full_name: "Koffi Mensah",
      phone: "01 11 22 33 44",
      member_type: "player",
      jersey_number: 10,
      position: "Attaquant",
    })
    expect(result.success).toBe(true)
  })

  it("accepts staff without a jersey number", () => {
    const result = rosterMemberSchema.safeParse({
      full_name: "Jean Kouassi",
      member_type: "staff",
      jersey_number: null,
    })
    expect(result.success).toBe(true)
  })

  it("rejects a jersey number out of range", () => {
    expect(
      rosterMemberSchema.safeParse({
        full_name: "Koffi Mensah",
        member_type: "player",
        jersey_number: 100,
      }).success
    ).toBe(false)

    expect(
      rosterMemberSchema.safeParse({
        full_name: "Koffi Mensah",
        member_type: "player",
        jersey_number: 0,
      }).success
    ).toBe(false)
  })

  it("rejects an invalid member type", () => {
    const result = rosterMemberSchema.safeParse({
      full_name: "Koffi Mensah",
      member_type: "manager",
      jersey_number: null,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a name that is too short", () => {
    const result = rosterMemberSchema.safeParse({
      full_name: "K",
      member_type: "player",
      jersey_number: 1,
    })
    expect(result.success).toBe(false)
  })
})

describe("rosterMemberFormSchema", () => {
  it("requires a valid team_id in addition to member fields", () => {
    const result = rosterMemberFormSchema.safeParse({
      team_id: TEST_UUID,
      full_name: "Koffi Mensah",
      member_type: "player",
      jersey_number: 10,
    })
    expect(result.success).toBe(true)
  })

  it("rejects a missing team_id", () => {
    const result = rosterMemberFormSchema.safeParse({
      team_id: "not-a-uuid",
      full_name: "Koffi Mensah",
      member_type: "player",
      jersey_number: 10,
    })
    expect(result.success).toBe(false)
  })
})
