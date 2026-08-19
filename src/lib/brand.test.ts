import { describe, expect, it } from "vitest"
import { PUBLIC_GOLD, PUBLIC_NAVY, TOURNAMENT } from "@/lib/constants"

describe("public brand tokens", () => {
  it("uses the navy token as tournament brandColor", () => {
    expect(TOURNAMENT.brandColor).toBe(PUBLIC_NAVY)
    expect(PUBLIC_NAVY).toBe("#1A3A6B")
    expect(PUBLIC_GOLD).toBe("#d4af37")
  })
})
