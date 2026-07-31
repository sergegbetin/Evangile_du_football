import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"
import {
  computeGroupStageMatchCount,
  computeKnockoutMatchCount,
  computeTeamPaymentSummary,
  computeTotalMatchCount,
  getClaimDeadlineMessage,
  getPresenceRequiredAt,
  getPresenceRequiredMessage,
  getRosterLockMessage,
  isClaimSubmissionAllowed,
  isRosterLocked,
  beninWallTimeToUtcIso,
  utcIsoToBeninDatetimeLocal,
  formatTournamentDateTime,
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
  it("keeps the roster open for all statuses when no match is scheduled", () => {
    expect(isRosterLocked({ status: "draft" }, null)).toBe(false)
    expect(isRosterLocked({ status: "rejected" }, null)).toBe(false)
    expect(isRosterLocked({ status: "submitted" }, null)).toBe(false)
    expect(isRosterLocked({ status: "approved" }, null)).toBe(false)
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

  it("keeps an approved team editable until 24h before its first match", () => {
    const now = new Date("2026-07-25T12:00:00.000Z")
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const matchInTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
    const matchInTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

    expect(isRosterLocked({ status: "approved" }, matchInTwoDays)).toBe(false)
    expect(isRosterLocked({ status: "approved" }, matchInTwelveHours)).toBe(true)

    vi.useRealTimers()
  })

  it("reopens a locked roster while admin unlock is active", () => {
    const now = new Date("2026-07-25T12:00:00.000Z")
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const matchInTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
    const unlockUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()

    expect(
      isRosterLocked(
        { status: "approved", roster_unlocked_until: unlockUntil },
        matchInTwelveHours
      )
    ).toBe(false)

    expect(
      isRosterLocked(
        { status: "approved", roster_unlocked_until: "2026-07-24T12:00:00.000Z" },
        matchInTwelveHours
      )
    ).toBe(true)

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

describe("getPresenceRequiredAt", () => {
  it("returns the configured number of hours before kickoff", () => {
    const scheduledAt = "2026-07-26T16:00:00.000Z"
    const presenceAt = getPresenceRequiredAt(scheduledAt)

    expect(presenceAt.getTime()).toBe(
      new Date(scheduledAt).getTime()
        - TOURNAMENT.presenceHoursBeforeMatch * 60 * 60 * 1000
    )
  })
})

describe("getPresenceRequiredMessage", () => {
  it("formats presence in Benin local time for a 16h00 kickoff", () => {
    // 16:00 Africa/Porto-Novo == 15:00 UTC
    const message = getPresenceRequiredMessage("2026-07-26T15:00:00.000Z")

    expect(message).toBe(
      "Présence requise à 15h00 pour le match de 16h00"
    )
  })

  it("reflects the configured presence window before kickoff", () => {
    const scheduledAt = "2026-07-26T15:00:00.000Z"
    const kickoff = new Date(scheduledAt)
    const presenceAt = getPresenceRequiredAt(scheduledAt)

    expect(kickoff.getTime() - presenceAt.getTime()).toBe(
      TOURNAMENT.presenceHoursBeforeMatch * 60 * 60 * 1000
    )
  })
})

describe("beninWallTimeToUtcIso", () => {
  it("treats datetime-local as Benin wall time (UTC+1)", () => {
    expect(beninWallTimeToUtcIso("2026-08-02T16:00")).toBe(
      "2026-08-02T15:00:00.000Z"
    )
  })

  it("round-trips with utcIsoToBeninDatetimeLocal", () => {
    const wall = "2026-08-02T16:00"
    const iso = beninWallTimeToUtcIso(wall)
    expect(utcIsoToBeninDatetimeLocal(iso)).toBe(wall)
  })

  it("formats tournament datetime in Benin", () => {
    const formatted = formatTournamentDateTime("2026-08-02T15:00:00.000Z")
    expect(formatted).toMatch(/16/)
    expect(formatted).toMatch(/2026/)
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

  it("reports en_attente when coach declared payment and balance remains", () => {
    const summary = computeTeamPaymentSummary([], {
      paymentDeclaredAt: "2026-07-26T10:00:00.000Z",
    })
    expect(summary.status).toBe("en_attente")
    expect(summary.balanceFcfa).toBe(TOURNAMENT.totalFeeFcfa)
  })

  it("keeps paye even if a declaration timestamp is still set", () => {
    const summary = computeTeamPaymentSummary(
      [
        { amount_fcfa: TOURNAMENT.registrationFeeFcfa, status: "confirmed" },
        { amount_fcfa: TOURNAMENT.participationFeeFcfa, status: "confirmed" },
      ],
      { paymentDeclaredAt: "2026-07-26T10:00:00.000Z" }
    )
    expect(summary.status).toBe("paye")
  })
})
