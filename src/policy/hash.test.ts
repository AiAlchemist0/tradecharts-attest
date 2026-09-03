import { describe, expect, it } from "vitest";
import { canonicalize, mapHash, type MapCommit } from "./hash";

const sample: MapCommit = {
  symbol: "eth-usd",
  timeframe: "1w",
  side: "both",
  barTime: 1_700_000_000,
  longKill: 2800.123456789,
  shortKill: 4100,
  pivots: [
    { label: "1", price: 210, time: 2, anchor: "high", kind: "impulse" },
    { label: "0", price: 80, time: 1, anchor: "low", kind: "origin" },
  ],
};

describe("mapHash", () => {
  it("is stable across key order and symbol case", () => {
    const a = mapHash(sample);
    const b = mapHash({ ...sample, symbol: "ETH-USD" });
    expect(a).toBe(b);
    expect(a).toMatch(/^0x[a-f0-9]{64}$/);
  });

  it("sorts pivots so insertion order does not change the hash", () => {
    const flipped: MapCommit = {
      ...sample,
      pivots: [...sample.pivots].reverse(),
    };
    expect(canonicalize(flipped)).toBe(canonicalize(sample));
    expect(mapHash(flipped)).toBe(mapHash(sample));
  });

  it("changes when the kill changes", () => {
    expect(mapHash({ ...sample, longKill: 2700 })).not.toBe(mapHash(sample));
  });
});
