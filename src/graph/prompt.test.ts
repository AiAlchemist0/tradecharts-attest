import { describe, expect, it } from "vitest";
import { compose } from "./compose";
import { composePromptBlock } from "./prompt";

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
