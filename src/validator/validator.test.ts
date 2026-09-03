import { describe, expect, it } from "vitest";
import { extractJson, validatePivots, validateProposal, type WavePivot } from "./index";

function P(label: string, price: number, time: number, anchor: WavePivot["anchor"], kind: WavePivot["kind"]): WavePivot {
  return { label, price, time, anchor, kind };
}

/** Textbook impulse (ETH-scale prices). Must never be rejected. */
const ethImpulse: WavePivot[] = [
  P("0", 80, 1, "low", "origin"),
  P("1", 210, 2, "high", "impulse"),
  P("2", 120, 3, "low", "impulse"),
  P("3", 3900, 4, "high", "impulse"),
  P("4", 1400, 5, "low", "impulse"),
  P("5", 4100, 6, "high", "impulse"),
];

describe("validator", () => {
  it("accepts a valid impulse (valid or flagged, never rejected)", () => {
    const r = validatePivots(ethImpulse, "impulse");
    expect(r.severity).not.toBe("rejected");
  });

  it("rejects wave 3 as the shortest (H1)", () => {
    const r = validatePivots(
      [
        P("0", 10, 1, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 18, 3, "low", "impulse"),
        P("3", 19, 4, "high", "impulse"),
        P("4", 18.5, 5, "low", "impulse"),
        P("5", 40, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.reasonClass).toBe("rule_violation");
    expect(r.rules.find((x) => x.id === "H1")?.pass).toBe(false);
  });

  it("rejects a wave 4 overlap (H2)", () => {
    const r = validatePivots(
      [
        P("0", 10, 1, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 16, 3, "low", "impulse"),
        P("3", 30, 4, "high", "impulse"),
        P("4", 19, 5, "low", "impulse"),
        P("5", 36, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.rules.find((x) => x.id === "H2")?.pass).toBe(false);
    expect(r.severity).toBe("rejected");
  });

  it("rejects a forecast with no kill (H5)", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: { label: "0", price: 80, time: 1, anchor: "low", kind: "origin" },
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      long: { pivots: [P("tgt", 900, 7, "high", "forecast-up")], target: 900, invalidation: 0 },
      short: { pivots: [P("tgt", 20, 7, "low", "forecast-down")], target: 20, invalidation: 1000 },
    });
    expect(r.severity).toBe("rejected");
    expect(r.rules.find((x) => x.id === "H5")?.pass).toBe(false);
  });

  it("rejects string prices as malformed (P1)", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      pivots: [{ label: "1", price: "207", time: 2, anchor: "high", kind: "impulse" }],
      long: { pivots: [], target: 1, invalidation: 1 },
      short: { pivots: [], target: 1, invalidation: 1 },
    });
    expect(r.severity).toBe("rejected");
    expect(r.reasonClass).toBe("malformed_output");
  });

  it("pulls JSON out of a markdown fence", () => {
    const raw = extractJson("here\n```json\n{\"status\":\"unresolved\",\"reason\":\"thin tape\"}\n```\n");
    expect(raw).toEqual({ status: "unresolved", reason: "thin tape" });
  });

  it("rejects H1/H4 when an impulse has no origin", () => {
    const r = validatePivots(
      [
        P("1", 20, 2, "high", "impulse"),
        P("2", 16, 3, "low", "impulse"),
        P("3", 30, 4, "high", "impulse"),
        P("4", 22, 5, "low", "impulse"),
        P("5", 36, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.rules.find((x) => x.id === "H1")?.pass).toBe(false);
    expect(r.rules.find((x) => x.id === "H4")?.pass).toBe(false);
  });

  it("rejects a 3-wave impulse (H3)", () => {
    const r = validatePivots(
      [
        P("0", 10, 1, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 16, 3, "low", "impulse"),
        P("3", 30, 4, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.reasonClass).toBe("rule_violation");
    expect(r.rules.find((x) => x.id === "H3")?.pass).toBe(false);
  });

  it("rejects wave 2 through the origin (H4)", () => {
    const r = validatePivots(
      [
        P("0", 10, 1, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 9, 3, "low", "impulse"),
        P("3", 30, 4, "high", "impulse"),
        P("4", 22, 5, "low", "impulse"),
        P("5", 36, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.rules.find((x) => x.id === "H4")?.pass).toBe(false);
  });

  it("rejects out-of-order times as malformed (P2)", () => {
    const r = validatePivots(
      [
        P("0", 10, 3, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 16, 4, "low", "impulse"),
        P("3", 30, 5, "high", "impulse"),
        P("4", 22, 6, "low", "impulse"),
        P("5", 36, 7, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.reasonClass).toBe("malformed_output");
    expect(r.rules.find((x) => x.id === "P2")?.pass).toBe(false);
  });

  it("rejects duplicate times as malformed (P2)", () => {
    const r = validatePivots(
      [
        P("0", 10, 1, "low", "origin"),
        P("1", 20, 2, "high", "impulse"),
        P("2", 16, 2, "low", "impulse"),
        P("3", 30, 4, "high", "impulse"),
        P("4", 22, 5, "low", "impulse"),
        P("5", 36, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.rules.find((x) => x.id === "P2")?.pass).toBe(false);
    expect(r.reasonClass).toBe("malformed_output");
  });

  it("rejects a pivot missing required fields (P3)", () => {
    const r = validatePivots(
      [
        { label: "", price: 20, time: 2, anchor: "high", kind: "impulse" },
        P("2", 16, 3, "low", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).toBe("rejected");
    expect(r.reasonClass).toBe("malformed_output");
    expect(r.rules.find((x) => x.id === "P3")?.pass).toBe(false);
  });

  it("flags a 1000× price span (P4) without rejecting", () => {
    const r = validatePivots(
      [
        P("0", 0.05, 1, "low", "origin"),
        P("1", 10, 2, "high", "impulse"),
        P("2", 6, 3, "low", "impulse"),
        P("3", 40, 4, "high", "impulse"),
        P("4", 20, 5, "low", "impulse"),
        P("5", 55, 6, "high", "impulse"),
      ],
      "impulse",
    );
    expect(r.rules.find((x) => x.id === "P4")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("accepts the CHIPUSDT listing-unwind impulse (never rejected)", () => {
    const r = validatePivots(
      [
        P("0", 0.14, 1, "high", "origin"),
        P("1", 0.05128, 2, "low", "impulse"),
        P("2", 0.07587, 3, "high", "impulse"),
        P("3", 0.02741, 4, "low", "impulse"),
        P("4", 0.03903, 5, "high", "impulse"),
        P("5", 0.02147, 6, "low", "impulse"),
      ],
      "impulse",
    );
    expect(r.severity).not.toBe("rejected");
  });

  it("accepts a two-path proposal (never rejected)", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      hold: { price: 207.98, label: "2019 HIGH / HOLD" },
      long: {
        pivots: [P("C", 169.63, 6, "low", "forecast-up"), P("(i)", 257.97, 7, "high", "forecast-up"), P("(ii)", 202.33, 8, "low", "forecast-up")],
        target: 345.16,
        invalidation: 169.63,
      },
      short: {
        pivots: [P("3ofC", 169.63, 6, "low", "forecast-down"), P("4", 257.97, 7, "high", "forecast-down"), P("5", 106.83, 9, "low", "forecast-down")],
        target: 106.83,
        invalidation: 310,
      },
    });
    expect(r.severity).not.toBe("rejected");
    expect(r.rules.find((x) => x.id === "H5")?.pass).toBe(true);
    expect(r.rules.find((x) => x.id === "S1")?.pass).toBe(true);
    expect(r.rules.find((x) => x.id === "S6")?.pass).toBe(true);
  });

  it("flags a deep wave-2 retrace (F2) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: { label: "0", price: 10, time: 1, anchor: "low", kind: "origin" },
      pivots: [
        P("1", 20, 2, "high", "impulse"),
        P("2", 11.5, 3, "low", "impulse"),
        P("3", 40, 4, "high", "impulse"),
        P("4", 28, 5, "low", "impulse"),
        P("5", 50, 6, "high", "impulse"),
      ],
      long: { pivots: [P("tgt", 50, 7, "high", "forecast-up")], target: 50, invalidation: 9 },
      short: { pivots: [P("tgt", 8, 7, "low", "forecast-down")], target: 8, invalidation: 21 },
    });
    expect(r.rules.find((x) => x.id === "F2")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags C/A off the standard ratios (F3) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "corrective",
      origin: { label: "0", price: 10, time: 1, anchor: "low", kind: "origin" },
      pivots: [
        { label: "A", price: 20, time: 2, anchor: "high", kind: "corrective" },
        { label: "B", price: 15, time: 3, anchor: "low", kind: "corrective" },
        { label: "C", price: 17, time: 4, anchor: "high", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 17, 5, "high", "forecast-up")], target: 17, invalidation: 9 },
      short: { pivots: [P("tgt", 8, 5, "low", "forecast-down")], target: 8, invalidation: 21 },
    });
    expect(r.rules.find((x) => x.id === "F3")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags a hold line off Fib of the major range (F6) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      hold: { price: 500, label: "off-fib hold" },
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 881.13, invalidation: 169.63 },
      short: { pivots: [P("tgt", 27, 7, "low", "forecast-down")], target: 27, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "F6")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags a target that misses Fib and printed pivots (F5) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 499, invalidation: 169.63 },
      short: { pivots: [P("tgt", 27, 7, "low", "forecast-down")], target: 73, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "F5")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags a missing Short path (S1) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 881.13, invalidation: 169.63 },
      short: { pivots: [], target: 27, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "S1")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags an alternate path that copies Long (S2) without rejecting", () => {
    const copy = [P("tgt", 881.13, 7, "high", "forecast-up")];
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      long: { pivots: copy, target: 881.13, invalidation: 169.63 },
      short: { pivots: copy, target: 881.13, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "S2")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags forecast labels mixed into the printed count (S3) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: [...ethImpulse.filter((p) => p.label !== "0"), P("tgt", 900, 7, "high", "forecast-up")],
      long: { pivots: [P("tgt", 900, 8, "high", "forecast-up")], target: 900, invalidation: 169.63 },
      short: { pivots: [P("tgt", 20, 8, "low", "forecast-down")], target: 20, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "S3")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags a missing subwave nest (S4) without rejecting the 1–5", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 881.13, invalidation: 169.63 },
      short: { pivots: [P("tgt", 27, 7, "low", "forecast-down")], target: 27, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "S4")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("parses parented internals and flags S4 until 1/3/5 are nested", () => {
    const r = validateProposal({
      status: "ok",
      structure: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      internals: [
        { parent: "1", label: "i", price: 80, time: 1.5, anchor: "high", kind: "impulse" },
        { parent: "2", label: "a", price: 150, time: 2.5, anchor: "low", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 881.13, invalidation: 169.63 },
      short: { pivots: [P("tgt", 27, 7, "low", "forecast-down")], target: 27, invalidation: 310 },
    });
    expect(r.proposal?.internals?.map((p) => p.label)).toEqual(["i/1", "a/2"]);
    expect(r.proposal?.pattern).toBe("impulse");
    expect(r.rules.find((x) => x.id === "S4")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("passes S4 when impulse 1/3/5 have nests", () => {
    const r = validateProposal({
      status: "ok",
      pattern: "impulse",
      origin: ethImpulse[0],
      pivots: ethImpulse.filter((p) => p.label !== "0"),
      internals: [
        { parent: "1", label: "i", price: 80, time: 1.5, anchor: "high", kind: "impulse" },
        { parent: "3", label: "i", price: 400, time: 3.5, anchor: "high", kind: "impulse" },
        { parent: "5", label: "i", price: 700, time: 5.5, anchor: "high", kind: "impulse" },
      ],
      long: { pivots: [P("tgt", 881.13, 7, "high", "forecast-up")], target: 881.13, invalidation: 169.63 },
      short: { pivots: [P("tgt", 27, 7, "low", "forecast-down")], target: 27, invalidation: 310 },
    });
    expect(r.rules.find((x) => x.id === "S4")?.pass).toBe(true);
    expect(r.severity).not.toBe("rejected");
  });

  it("accepts a zigzag A-B-C (H3) and flags missing C internals (S4)", () => {
    const r = validateProposal({
      status: "ok",
      pattern: "zigzag",
      origin: { label: "0", price: 100, time: 1, anchor: "high", kind: "origin" },
      pivots: [
        { label: "A", price: 50, time: 2, anchor: "low", kind: "corrective" },
        { label: "B", price: 70, time: 3, anchor: "high", kind: "corrective" },
        { label: "C", price: 40, time: 4, anchor: "low", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 80, 5, "high", "forecast-up")], target: 80, invalidation: 38 },
      short: { pivots: [P("tgt", 30, 5, "low", "forecast-down")], target: 30, invalidation: 72 },
    });
    expect(r.proposal?.structure).toBe("corrective");
    expect(r.rules.find((x) => x.id === "H3")?.pass).toBe(true);
    expect(r.rules.find((x) => x.id === "S4")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("passes zigzag S4 when reason says C is a three", () => {
    const r = validateProposal({
      status: "ok",
      pattern: "zigzag",
      reason: "Working ABC from the ATH. C is a three.",
      origin: { label: "0", price: 100, time: 1, anchor: "high", kind: "origin" },
      pivots: [
        { label: "A", price: 50, time: 2, anchor: "low", kind: "corrective" },
        { label: "B", price: 70, time: 3, anchor: "high", kind: "corrective" },
        { label: "C", price: 40, time: 4, anchor: "low", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 80, 5, "high", "forecast-up")], target: 80, invalidation: 38 },
      short: { pivots: [P("tgt", 30, 5, "low", "forecast-down")], target: 30, invalidation: 72 },
    });
    expect(r.rules.find((x) => x.id === "S4")?.pass).toBe(true);
    expect(r.severity).not.toBe("rejected");
  });

  it("derives zigzag from legacy structure=corrective", () => {
    const r = validateProposal({
      status: "ok",
      structure: "corrective",
      origin: { label: "0", price: 10, time: 1, anchor: "low", kind: "origin" },
      pivots: [
        { label: "A", price: 20, time: 2, anchor: "high", kind: "corrective" },
        { label: "B", price: 16, time: 3, anchor: "low", kind: "corrective" },
        { label: "C", price: 28, time: 4, anchor: "high", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 32, 5, "high", "forecast-up")], target: 32, invalidation: 9 },
      short: { pivots: [P("tgt", 8, 5, "low", "forecast-down")], target: 8, invalidation: 21 },
    });
    expect(r.proposal?.pattern).toBe("zigzag");
    expect(r.proposal?.structure).toBe("corrective");
    expect(r.rules.find((x) => x.id === "H3")?.pass).toBe(true);
  });

  it("flags a B retrace that misses 38.2/50/61.8 (F4)", () => {
    const r = validateProposal({
      status: "ok",
      structure: "corrective",
      origin: { label: "0", price: 10, time: 1, anchor: "low", kind: "origin" },
      pivots: [
        { label: "A", price: 20, time: 2, anchor: "high", kind: "corrective" },
        { label: "B", price: 19.5, time: 3, anchor: "low", kind: "corrective" },
        { label: "C", price: 32, time: 4, anchor: "high", kind: "corrective" },
      ],
      hold: { price: 16.18, label: "hold" },
      long: { pivots: [P("tgt", 32, 5, "high", "forecast-up")], target: 32, invalidation: 9 },
      short: { pivots: [P("tgt", 8, 5, "low", "forecast-down")], target: 8, invalidation: 21 },
    });
    expect(r.rules.find((x) => x.id === "F4")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("skips S5 when no measure range is passed", () => {
    const r = validateProposal({
      status: "ok",
      pattern: "zigzag",
      reason: "C is a three.",
      origin: { label: "0", price: 4956, time: Date.parse("2025-08-18T00:00:00Z") / 1000, anchor: "high", kind: "origin" },
      pivots: [
        { label: "A", price: 2623, time: Date.parse("2025-11-17T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
        { label: "B", price: 3447, time: Date.parse("2025-12-08T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
        { label: "C", price: 1505, time: Date.parse("2026-06-01T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
      ],
      long: { pivots: [P("tgt", 3094, 7, "high", "forecast-up")], target: 3094, invalidation: 1505 },
      short: { pivots: [P("tgt", 1125, 7, "low", "forecast-down")], target: 1125, invalidation: 2528 },
    });
    expect(r.rules.find((x) => x.id === "S5")).toBeUndefined();
  });

  it("flags a last-year zigzag that misses the cycle low (S5)", () => {
    const r = validateProposal(
      {
        status: "ok",
        pattern: "zigzag",
        reason: "C is a three.",
        origin: { label: "0", price: 4956, time: Date.parse("2025-08-18T00:00:00Z") / 1000, anchor: "high", kind: "origin" },
        pivots: [
          { label: "A", price: 2623, time: Date.parse("2025-11-17T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
          { label: "B", price: 3447, time: Date.parse("2025-12-08T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
          { label: "C", price: 1505, time: Date.parse("2026-06-01T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
        ],
        long: { pivots: [P("tgt", 3094, 7, "high", "forecast-up")], target: 3094, invalidation: 1505 },
        short: { pivots: [P("tgt", 1125, 7, "low", "forecast-down")], target: 1125, invalidation: 2528 },
      },
      { range: { high: 4956, low: 80, highT: "2025-08-18", lowT: "2018-12-17" } },
    );
    expect(r.rules.find((x) => x.id === "S5")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("passes S5 when printed labels include both range extremes", () => {
    const r = validateProposal(
      {
        status: "ok",
        pattern: "impulse",
        origin: { label: "0", price: 80, time: Date.parse("2018-12-17T00:00:00Z") / 1000, anchor: "low", kind: "origin" },
        pivots: [
          P("1", 1400, Date.parse("2021-05-10T00:00:00Z") / 1000, "high", "impulse"),
          P("2", 880, Date.parse("2022-06-20T00:00:00Z") / 1000, "low", "impulse"),
          P("3", 4000, Date.parse("2024-03-11T00:00:00Z") / 1000, "high", "impulse"),
          P("4", 2100, Date.parse("2025-04-07T00:00:00Z") / 1000, "low", "impulse"),
          P("5", 4956, Date.parse("2025-08-18T00:00:00Z") / 1000, "high", "impulse"),
        ],
        internals: [
          { parent: "1", label: "i", price: 400, time: Date.parse("2020-01-06T00:00:00Z") / 1000, anchor: "high", kind: "impulse" },
          { parent: "3", label: "i", price: 2000, time: Date.parse("2023-01-02T00:00:00Z") / 1000, anchor: "high", kind: "impulse" },
          { parent: "5", label: "i", price: 3500, time: Date.parse("2025-06-02T00:00:00Z") / 1000, anchor: "high", kind: "impulse" },
        ],
        long: { pivots: [P("tgt", 6000, 9, "high", "forecast-up")], target: 6000, invalidation: 80 },
        short: { pivots: [P("tgt", 1505, 9, "low", "forecast-down")], target: 1505, invalidation: 4956 },
      },
      { range: { high: 4956, low: 80, highT: "2025-08-18", lowT: "2018-12-17" } },
    );
    expect(r.rules.find((x) => x.id === "S5")?.pass).toBe(true);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags a Long/Short stub parked on C (S6) without rejecting", () => {
    const r = validateProposal({
      status: "ok",
      pattern: "zigzag",
      reason: "C is a three.",
      origin: { label: "0", price: 2817, time: 1, anchor: "low", kind: "origin" },
      pivots: [
        { label: "A", price: 126199, time: 2, anchor: "high", kind: "corrective" },
        { label: "B", price: 60000, time: 3, anchor: "low", kind: "corrective" },
        { label: "C", price: 81771, time: 4, anchor: "high", kind: "corrective" },
      ],
      long: { pivots: [P("(i)", 81771, 4, "high", "forecast-up")], target: 126199, invalidation: 60000 },
      short: { pivots: [P("(c)", 81771, 4, "low", "forecast-down")], target: 60000, invalidation: 126199 },
    });
    expect(r.rules.find((x) => x.id === "S6")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });

  it("passes S6 when Long and Short run from C toward last", () => {
    const r = validateProposal(
      {
        status: "ok",
        pattern: "zigzag",
        reason: "C is a three.",
        origin: { label: "0", price: 2817, time: Date.parse("2017-09-11T00:00:00Z") / 1000, anchor: "low", kind: "origin" },
        pivots: [
          { label: "A", price: 126199, time: Date.parse("2025-10-06T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
          { label: "B", price: 60000, time: Date.parse("2026-02-02T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
          { label: "C", price: 81771, time: Date.parse("2026-08-31T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
        ],
        long: {
          pivots: [
            P("C", 81771, Date.parse("2026-08-31T00:00:00Z") / 1000, "high", "forecast-up"),
            P("(i)", 78000, Date.parse("2026-09-07T00:00:00Z") / 1000, "low", "forecast-up"),
            P("(ii)", 85000, Date.parse("2026-09-21T00:00:00Z") / 1000, "high", "forecast-up"),
          ],
          target: 100000,
          invalidation: 60000,
        },
        short: {
          pivots: [
            P("C", 81771, Date.parse("2026-08-31T00:00:00Z") / 1000, "high", "forecast-down"),
            P("(iv)", 79000, Date.parse("2026-09-07T00:00:00Z") / 1000, "low", "forecast-down"),
            P("(v)", 92000, Date.parse("2026-10-05T00:00:00Z") / 1000, "high", "forecast-down"),
          ],
          target: 92000,
          invalidation: 126199,
        },
      },
      { last: { t: "2026-09-07", c: 81500 } },
    );
    expect(r.rules.find((x) => x.id === "S6")?.pass).toBe(true);
    expect(r.severity).not.toBe("rejected");
  });

  it("flags S6 when paths skip months of tape after the last print", () => {
    const r = validateProposal(
      {
        status: "ok",
        pattern: "zigzag",
        reason: "C is a three.",
        origin: { label: "0", price: 10, time: Date.parse("2018-01-01T00:00:00Z") / 1000, anchor: "low", kind: "origin" },
        pivots: [
          { label: "A", price: 40, time: Date.parse("2020-01-01T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
          { label: "B", price: 22, time: Date.parse("2021-01-01T00:00:00Z") / 1000, anchor: "low", kind: "corrective" },
          { label: "C", price: 30, time: Date.parse("2024-01-01T00:00:00Z") / 1000, anchor: "high", kind: "corrective" },
        ],
        long: {
          pivots: [
            P("(i)", 80, Date.parse("2027-01-01T00:00:00Z") / 1000, "high", "forecast-up"),
            P("(ii)", 60, Date.parse("2027-06-01T00:00:00Z") / 1000, "low", "forecast-up"),
          ],
          target: 80,
          invalidation: 20,
        },
        short: {
          pivots: [
            P("4", 12, Date.parse("2027-01-01T00:00:00Z") / 1000, "low", "forecast-down"),
            P("5", 8, Date.parse("2027-06-01T00:00:00Z") / 1000, "low", "forecast-down"),
          ],
          target: 8,
          invalidation: 40,
        },
      },
      { last: { t: "2026-09-01", c: 28 } },
    );
    expect(r.rules.find((x) => x.id === "S6")?.pass).toBe(false);
    expect(r.severity).not.toBe("rejected");
  });
});
