import { describe, expect, it } from "vitest";
import { compose } from "./compose";
import { citeComposeRow, composeAskPayload, composePromptBlock, FIGHTING_ASK, isBookAsk } from "./prompt";

describe("composePromptBlock", () => {
  it("names fighting coins and carries exposure + map side per row", () => {
    const rows = compose({
      bag: [
        { symbol: "ETH", amount: 4, contract: null },
        { symbol: "WETH", amount: 1.5, contract: "0x4200000000000000000000000000000000000006" },
        { symbol: "AERO", amount: 100, contract: null },
      ],
      maps: [{ symbol: "ETH", bias: "short", longKill: null, shortKill: 2350.5 }],
    });
    const block = composePromptBlock(rows, "0xfA8C…954B");
    expect(block).toContain("Graph compose (0xfA8C…954B):");
    expect(block).toContain("- ETH: spot 5.5; confirmed map short; status fighting");
    expect(block).toContain("- AERO: spot 100; confirmed map none; status unmapped");
    expect(block).toContain("1 coin on this book FIGHTS the confirmed map: ETH.");
  });

  it("states the all-clear when nothing fights", () => {
    const rows = compose({
      bag: [{ symbol: "ETH", amount: 2, contract: null }],
      maps: [{ symbol: "ETH", bias: "long", longKill: null, shortKill: null }],
    });
    expect(composePromptBlock(rows)).toContain("No coin on this book is fighting its confirmed map.");
  });

  it("handles the empty book", () => {
    expect(composePromptBlock([], "0xabc")).toContain("no bag and no confirmed maps yet");
  });
});

describe("citeComposeRow / composeAskPayload", () => {
  const fighting = compose({
    bag: [
      { symbol: "ETH", amount: 4, contract: null },
      { symbol: "WETH", amount: 1.5, contract: "0x4200000000000000000000000000000000000006" },
    ],
    maps: [{ symbol: "ETH", bias: "short", longKill: null, shortKill: 2350.5 }],
  });

  it("cites status, confirmed side, exposure, and maps block", () => {
    expect(citeComposeRow(fighting[0]!, 12_345_678)).toBe(
      "ETH fighting · confirmed short · spot 5.5 · Graph maps block 12345678",
    );
  });

  it("builds a live payload the desk and MCP share", () => {
    const payload = composeAskPayload(fighting, {
      wallet: "0xfa8c53b715755762209de11923fb99bc4607954b",
      block: 12_345_678,
    });
    expect(payload.error).toBeNull();
    expect(payload.block).toBe(12_345_678);
    expect(payload.rows[0]).toEqual({
      symbol: "ETH",
      spot: 5.5,
      perp: 0,
      bias: "short",
      status: "fighting",
    });
    expect(payload.cites[0]).toBe("ETH fighting · confirmed short · spot 5.5 · Graph maps block 12345678");
    expect(payload.text).toContain("LIVE Graph compose (re-fetched this turn)");
    expect(payload.text).toContain(payload.cites[0]);
    expect(payload.text).toContain("Status is conflictOf only");
    expect(payload.text).toContain("Answer the user's question in their own words");
  });

  it("does not fabricate a status when Studio failed", () => {
    const payload = composeAskPayload(fighting, { wallet: "0xabc", error: "maps HTTP 502" });
    expect(payload.rows).toEqual([]);
    expect(payload.cites).toEqual([]);
    expect(payload.error).toBe("maps HTTP 502");
    expect(payload.text).toContain("Studio error: maps HTTP 502");
    expect(payload.text).toContain("Say Studio failed");
    expect(payload.text).not.toMatch(/ETH fighting/);
  });

  it("seed story cites match the strip words (ETH aligned, BTC/VIRTUAL fighting)", () => {
    const rows = compose({
      bag: [
        { symbol: "ETH", amount: 0.003, contract: null },
        { symbol: "BTC", amount: 0.01, contract: null },
        { symbol: "VIRTUAL", amount: 100, contract: null },
      ],
      maps: [
        { symbol: "ETH", bias: "long", longKill: null, shortKill: null },
        { symbol: "BTC", bias: "short", longKill: null, shortKill: null },
        { symbol: "VIRTUAL", bias: "short", longKill: null, shortKill: null },
      ],
    });
    const payload = composeAskPayload(rows, { wallet: "0xabc", block: 51_160_101 });
    expect(citeComposeRow(rows.find((r) => r.symbol === "ETH")!, 51_160_101)).toContain(
      "ETH aligned · confirmed long",
    );
    expect(citeComposeRow(rows.find((r) => r.symbol === "BTC")!, 51_160_101)).toContain(
      "BTC fighting · confirmed short",
    );
    expect(citeComposeRow(rows.find((r) => r.symbol === "VIRTUAL")!, 51_160_101)).toContain(
      "VIRTUAL fighting · confirmed short",
    );
    expect(payload.cites.join("\n")).toMatch(/ETH aligned/);
    expect(payload.cites.join("\n")).toMatch(/BTC fighting/);
    expect(payload.cites.join("\n")).toMatch(/VIRTUAL fighting/);
    expect(payload.cites.join("\n")).toMatch(/Graph maps block 51160101/);
  });

  it("says Confirm is not onchain when every row is unmapped", () => {
    const rows = compose({
      bag: [{ symbol: "SOL", amount: 10, contract: null }],
      maps: [],
    });
    const payload = composeAskPayload(rows, { wallet: "0xabc", block: 99 });
    expect(payload.text).toContain("Every row is unmapped");
    expect(payload.text).toContain("Confirm is not onchain yet");
    expect(payload.cites[0]).toBe("SOL unmapped · confirmed none · spot 10 · Graph maps block 99");
  });
});

describe("isBookAsk", () => {
  it("matches the starter and book status words", () => {
    expect(isBookAsk(FIGHTING_ASK)).toBe(true);
    expect(isBookAsk("is ETH fighting the map?")).toBe(true);
    expect(isBookAsk("what's on this wallet")).toBe(true);
    expect(isBookAsk("is my bag aligned")).toBe(true);
    expect(isBookAsk("any unmapped coins")).toBe(true);
  });

  it("matches open phrasing — position, long/short, price, other languages", () => {
    expect(isBookAsk("what is my position")).toBe(true);
    expect(isBookAsk("What's my ETH exposure?")).toBe(true);
    expect(isBookAsk("am I long or short")).toBe(true);
    expect(isBookAsk("long or short on this")).toBe(true);
    expect(isBookAsk("how are price movements")).toBe(true);
    expect(isBookAsk("how's price doing vs my map")).toBe(true);
    expect(isBookAsk("cuál es mi posición")).toBe(true);
    expect(isBookAsk("je suis long ou short")).toBe(true);
    expect(isBookAsk("我的持仓")).toBe(true);
  });

  it("does not treat Elliott Propose / Analyse as a Graph look-up", () => {
    expect(isBookAsk("Propose Elliott map")).toBe(false);
    expect(isBookAsk("Confirm the map")).toBe(false);
    expect(isBookAsk("Run full analysis on this chart")).toBe(false);
    expect(isBookAsk("Map the macro")).toBe(false);
    expect(isBookAsk("Build Fib calculations on this tape.")).toBe(false);
    expect(isBookAsk("Long / Short scenarios")).toBe(false);
    expect(isBookAsk("Refine daily wicks")).toBe(false);
  });
});
