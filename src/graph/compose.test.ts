import { describe, expect, it } from "vitest";
import { compose } from "./compose";

describe("compose", () => {
  it("flags a long bag against a confirmed Short map as fighting", () => {
    const rows = compose({
      bag: [{ symbol: "ETH", amount: 2, contract: null }],
      maps: [{ symbol: "ETH-USD", bias: "short", longKill: 2800, shortKill: 4100 }],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("fighting");
  });

  it("drops airdrop / phishing bag tickers before join", () => {
    const rows = compose({
      bag: [
        { symbol: "ETH", amount: 1, contract: null },
        { symbol: "VISITETHCLAIM", amount: 1e18, contract: "0xdead" },
      ],
      maps: [{ symbol: "ETH-USD", bias: "long", longKill: 2800, shortKill: null }],
    });
    expect(rows.map((r) => r.symbol)).toEqual(["ETH"]);
    expect(rows[0]?.status).toBe("aligned");
  });

  it("marks exposure with no map as unmapped", () => {
    const rows = compose({
      bag: [{ symbol: "SOL", amount: 10, contract: null }],
      maps: [],
    });
    expect(rows[0]?.status).toBe("unmapped");
  });

  it("joins bag + perp + map on ticker aliases", () => {
    const rows = compose({
      bag: [{ symbol: "BTC", amount: 0.1, contract: null }],
      maps: [{ symbol: "BTCUSDT", bias: "long", longKill: 90_000, shortKill: null }],
      perps: [{ symbol: "BTC-USD", size: 1, liq: 95_000 }],
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("insolvent");
  });

  it("seed story: ETH long / BTC short / VIRTUAL short", () => {
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
    const by = Object.fromEntries(rows.map((r) => [r.symbol, r.status]));
    expect(by.ETH).toBe("aligned");
    expect(by.BTC).toBe("fighting");
    expect(by.VIRTUAL).toBe("fighting");
  });
});
