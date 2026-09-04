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
});
