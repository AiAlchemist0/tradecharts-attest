import { describe, expect, it } from "vitest";
import { isBlockedToken, isEthAddress } from "./token";

describe("hostile bag metadata", () => {
  it("blocks airdrop / phishing copy", () => {
    expect(isBlockedToken({ symbol: "UDTMESUSCIRCLECLAIMUNTIL280625" })).toBe(true);
    expect(isBlockedToken({ name: "Visit site to claim" })).toBe(true);
    expect(isBlockedToken({ symbol: "ETHCLAIM" })).toBe(true);
  });

  it("keeps real bag tickers and Pendle YTs", () => {
    expect(isBlockedToken({ symbol: "ETH" })).toBe(false);
    expect(isBlockedToken({ symbol: "PENDLE" })).toBe(false);
    expect(isBlockedToken({ symbol: "YTUSDAI15OCT2026", name: "YT USDai 15OCT2026" })).toBe(false);
    expect(isBlockedToken({ symbol: "USDC", name: "USD\u0421" })).toBe(true);
  });

  it("accepts checksum wallets only", () => {
    expect(isEthAddress("0xfA8C53B715755762209De11923fB99BC4607954B")).toBe(true);
    expect(isEthAddress("not-an-address")).toBe(false);
    expect(isEthAddress("0xdead")).toBe(false);
  });
});
