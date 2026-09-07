import { describe, expect, it } from "bun:test";
import { decide } from "./main";
import { killAction } from "../src/policy/kill";

describe("close-kill decision (TEE logic)", () => {
  it("flattens when the weekly close prints through the long kill", () => {
    const d = decide({ side: "long", kill: 2500, close: 2400, net: 4 }, "ETH");
    expect(d.flatten).toBe(true);
    expect(d.symbol).toBe("ETH");
    expect(d.reasonHash).toMatch(/^[0-9a-f]{8}$/);
  });

  it("holds when the close stays inside the map", () => {
    expect(decide({ side: "long", kill: 2500, close: 2510, net: 4 }, "ETH").flatten).toBe(false);
  });

  it("never fires when the book already left the side", () => {
    expect(killAction({ side: "long", kill: 2500, close: 2400, net: 0 })).toBe("hold");
    expect(killAction({ side: "short", kill: 2500, close: 2600, net: 1 })).toBe("hold");
  });

  it("short kill fires on a close above it", () => {
    expect(decide({ side: "short", kill: 2500, close: 2600, net: -4 }, "ETH").flatten).toBe(true);
  });

  it("hashes the same reason to the same value", () => {
    const a = decide({ side: "long", kill: 2500, close: 2400, net: 4 }, "ETH");
    const b = decide({ side: "long", kill: 2500, close: 2400, net: 4 }, "ETH");
    expect(a.reasonHash).toBe(b.reasonHash);
  });
});
