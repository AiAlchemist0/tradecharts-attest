import { describe, expect, it } from "vitest";
import { isBlockedToken, isEthAddress } from "./token";

describe("hostile bag metadata", () => {
  it("blocks airdrop / phishing copy", () => {
    expect(isBlockedToken({ symbol: "VISITETHCLAIM" })).toBe(true);
    expect(isBlockedToken({ name: "Visit site to claim" })).toBe(true);
    expect(isBlockedToken({ symbol: "ETHCLAIM" })).toBe(true);
  });

  it("keeps ordinary bag tickers", () => {
    expect(isBlockedToken({ symbol: "ETH" })).toBe(false);
    expect(isBlockedToken({ symbol: "SOL" })).toBe(false);
    expect(isBlockedToken({ symbol: "WRAPPEDSTAKE2027" })).toBe(false);
    expect(isBlockedToken({ symbol: "USDC", name: "USD\u0421" })).toBe(true);
  });

  it("accepts checksum wallets only", () => {
    expect(isEthAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")).toBe(true);
    expect(isEthAddress("not-an-address")).toBe(false);
    expect(isEthAddress("0xdead")).toBe(false);
  });
});
