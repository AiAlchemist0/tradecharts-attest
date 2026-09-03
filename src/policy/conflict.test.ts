import { describe, expect, it } from "vitest";
import { conflictOf, type BookRow } from "./conflict";

const base: BookRow = {
  symbol: "ETH-USD",
  spot: 0,
  perp: 0,
  liq: null,
  bias: "none",
  longKill: null,
  shortKill: null,
};

describe("conflictOf", () => {
  it("flags a long perp against a confirmed Short map as fighting", () => {
    expect(
      conflictOf({
        ...base,
        perp: 4,
        bias: "short",
        shortKill: 4100,
        longKill: 2800,
      }),
    ).toBe("fighting");
  });

  it("flags unmapped exposure", () => {
    expect(conflictOf({ ...base, spot: 2 })).toBe("unmapped");
  });

  it("flags insolvent when liq sits above the long kill", () => {
    expect(
      conflictOf({
        ...base,
        perp: 12,
        bias: "long",
        longKill: 3000,
        liq: 3200,
      }),
    ).toBe("insolvent");
  });

  it("aligns a long bag with a Long map", () => {
    expect(
      conflictOf({
        ...base,
        spot: 1.5,
        bias: "long",
        longKill: 2800,
      }),
    ).toBe("aligned");
  });
});
