import { describe, expect, it } from "vitest"
import { PAYMENT_AMOUNTS, recordPaymentSchema, updatePaymentSchema } from "@/lib/validations/payment"
import { TOURNAMENT } from "@/lib/constants"

import { TEST_UUID } from "@/lib/validations/test-ids"

const validTeamId = TEST_UUID

describe("recordPaymentSchema", () => {
  it("accepts a valid registration payment with a reference", () => {
    const result = recordPaymentSchema.safeParse({
      team_id: validTeamId,
      payment_type: "registration",
      amount_fcfa: TOURNAMENT.registrationFeeFcfa,
      reference: "MM-45821",
    })
    expect(result.success).toBe(true)
  })

  it("requires a non-empty reference", () => {
    const result = recordPaymentSchema.safeParse({
      team_id: validTeamId,
      payment_type: "registration",
      amount_fcfa: TOURNAMENT.registrationFeeFcfa,
      reference: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects a non-positive amount", () => {
    const result = recordPaymentSchema.safeParse({
      team_id: validTeamId,
      payment_type: "registration",
      amount_fcfa: -100,
      reference: "MM-45821",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid payment type", () => {
    const result = recordPaymentSchema.safeParse({
      team_id: validTeamId,
      payment_type: "donation",
      amount_fcfa: 1000,
      reference: "MM-45821",
    })
    expect(result.success).toBe(false)
  })

  it("defaults status to confirmed when omitted", () => {
    const result = recordPaymentSchema.safeParse({
      team_id: validTeamId,
      payment_type: "participation",
      amount_fcfa: TOURNAMENT.participationFeeFcfa,
      reference: "REF-1",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe("confirmed")
    }
  })
})

describe("updatePaymentSchema", () => {
  it("accepts a status update", () => {
    const result = updatePaymentSchema.safeParse({
      payment_id: validTeamId,
      status: "cancelled",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid status", () => {
    const result = updatePaymentSchema.safeParse({
      payment_id: validTeamId,
      status: "refunded",
    })
    expect(result.success).toBe(false)
  })
})

describe("PAYMENT_AMOUNTS", () => {
  it("matches the tournament fee constants", () => {
    expect(PAYMENT_AMOUNTS.registration).toBe(TOURNAMENT.registrationFeeFcfa)
    expect(PAYMENT_AMOUNTS.participation).toBe(TOURNAMENT.participationFeeFcfa)
  })
})
