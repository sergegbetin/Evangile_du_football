import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"
import {
  computeGroupStageMatchCount,
  computeKnockoutMatchCount,
  computeTeamPaymentSummary,
  computeTotalMatchCount,
  getClaimDeadlineMessage,
  getRosterLockMessage,
  isClaimSubmissionAllowed,
  isRosterLocked,
} from "@/lib/tournament-rules"
import { TOURNAMENT } from "@/lib/constants"

describe("computeTotalMatchCount", () => {
  it("returns 18 for the official 8-team / 2-pool format", () => {
    expect(computeTotalMatchCount({ poolCount: 2, poolSize: 4 })).toBe(18)
  })

  it("breaks down into 12 group + 6 knockout matches", () => {
    expect(computeGroupStageMatchCount(2, 4)).toBe(12)
    expect(computeKnockoutMatchCount(2, 4)).toBe(6)
  })
})

describe("isRosterLocked", () => {
  it("locks the roster once the team is approved", () => {
    expect(isRosterLocked({ status: "approved" }, null)).toBe(true)
  })

  it("keeps the roster open for draft, rejected, and submitted teams with no match", () => {
    expect(isRosterLocked({ status: "draft" }, null)).toBe(false)
    expect(isRosterLocked({ status: "rejected" }, null)).toBe(false)
    expect(isRosterLocked({ status: "submitted" }, null)).toBe(false)
  })

  it("locks 24h before the first scheduled match", () => {
    const now = new Date("2026-07-25T12:00:00.000Z")
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const matchInTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
    const matchInTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

    expect(isRosterLocked({ status: "draft" }, matchInTwelveHours)).toBe(true)
    expect(isRosterLocked({ status: "draft" }, matchInTwoDays)).toBe(false)

    vi.useRealTimers()
  })
})

describe("getRosterLockMessage", () => {
  it("returns a generic message when there is no scheduled match", () => {
    expect(getRosterLockMessage(null)).toMatch(/verrouillé/i)
  })

  it("includes the computed lock date when a match is scheduled", () => {
    const message = getRosterLockMessage("2026-07-26T15:00:00.000Z")
    expect(message).toMatch(/verrouillé/i)
  })
})

describe("isClaimSubmissionAllowed", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("rejects claims for matches that are not completed", () => {
    vi.setSystemTime(new Date("2026-07-27T12:00:00.000Z"))
    expect(
      isClaimSubmissionAllowed({
        status: "scheduled",
        scheduled_at: "2026-07-27T10:00:00.000Z",
      })
    ).toBe(false)
  })

  it("allows claims within the deadline using ended_at when available", () => {
    vi.setSystemTime(new Date("2026-07-27T13:00:00.000Z"))
    expect(
      isClaimSubmissionAllowed({
        status: "completed",
        scheduled_at: "2026-07-27T10:00:00.000Z",
        ended_at: "2026-07-27T12:00:00.000Z",
      })
    ).toBe(true)
  })

  it("rejects claims after the deadline has passed", () => {
    vi.setSystemTime(new Date("2026-07-29T13:00:00.000Z"))
    expect(
      isClaimSubmissionAllowed({
        status: "completed",
        scheduled_at: "2026-07-27T10:00:00.000Z",
        ended_at: "2026-07-27T12:00:00.000Z",
      })
    ).toBe(false)
  })

  it("falls back to a 2h post-kickoff estimate when ended_at is missing", () => {
    // scheduled_at + 2h estimate + 24h deadline = 2026-07-28T12:00:00Z
    vi.setSystemTime(new Date("2026-07-28T11:00:00.000Z"))
    expect(
      isClaimSubmissionAllowed({
        status: "completed",
        scheduled_at: "2026-07-27T10:00:00.000Z",
      })
    ).toBe(true)

    vi.setSystemTime(new Date("2026-07-28T13:00:00.000Z"))
    expect(
      isClaimSubmissionAllowed({
        status: "completed",
        scheduled_at: "2026-07-27T10:00:00.000Z",
      })
    ).toBe(false)
  })
})

describe("getClaimDeadlineMessage", () => {
  it("mentions the configured claim deadline in hours", () => {
    expect(getClaimDeadlineMessage()).toContain(String(TOURNAMENT.claimDeadlineHours))
  })
})

describe("computeTeamPaymentSummary", () => {
  it("reports impaye when nothing has been confirmed", () => {
    const summary = computeTeamPaymentSummary([])
    expect(summary.status).toBe("impaye")
    expect(summary.totalPaidFcfa).toBe(0)
    expect(summary.balanceFcfa).toBe(TOURNAMENT.totalFeeFcfa)
  })

  it("reports partiel when some but not all fees are confirmed", () => {
    const summary = computeTeamPaymentSummary([
      { amount_fcfa: TOURNAMENT.registrationFeeFcfa, status: "confirmed" },
    ])
    expect(summary.status).toBe("partiel")
    expect(summary.balanceFcfa).toBe(
      TOURNAMENT.totalFeeFcfa - TOURNAMENT.registrationFeeFcfa
    )
  })

  it("reports paye once the full fee is confirmed", () => {
    const summary = computeTeamPaymentSummary([
      { amount_fcfa: TOURNAMENT.registrationFeeFcfa, status: "confirmed" },
      { amount_fcfa: TOURNAMENT.participationFeeFcfa, status: "confirmed" },
    ])
    expect(summary.status).toBe("paye")
    expect(summary.balanceFcfa).toBe(0)
  })

  it("ignores pending and cancelled payments", () => {
    const summary = computeTeamPaymentSummary([
      { amount_fcfa: TOURNAMENT.totalFeeFcfa, status: "pending" },
      { amount_fcfa: TOURNAMENT.totalFeeFcfa, status: "cancelled" },
    ])
    expect(summary.totalPaidFcfa).toBe(0)
    expect(summary.status).toBe("impaye")
  })
})
