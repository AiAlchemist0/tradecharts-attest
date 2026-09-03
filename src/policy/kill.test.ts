import { describe, expect, it } from "vitest";
import { killAction, mayAgent } from "./kill";

describe("killAction", () => {
  it("flattens a long only when the close is through the kill", () => {
    expect(killAction({ side: "long", kill: 2800, close: 2799, net: 2 })).toBe("flatten");
    expect(killAction({ side: "long", kill: 2800, close: 2801, net: 2 })).toBe("hold");
  });

  it("ignores a wick-style close if the book is already flat", () => {
    expect(killAction({ side: "long", kill: 2800, close: 2700, net: 0 })).toBe("hold");
  });

  it("flattens a short when close prints above the short kill", () => {
    expect(killAction({ side: "short", kill: 4100, close: 4101, net: -3 })).toBe("flatten");
    expect(killAction({ side: "short", kill: 4100, close: 4099, net: -3 })).toBe("hold");
  });
});

describe("mayAgent", () => {
  it("allows flatten only", () => {
    expect(mayAgent("flatten")).toBe("flatten");
    expect(mayAgent("open")).toBe("forbidden");
    expect(mayAgent("increase")).toBe("forbidden");
    expect(mayAgent("rotate")).toBe("forbidden");
  });
});
