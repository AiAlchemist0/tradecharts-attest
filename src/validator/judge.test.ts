import { describe, expect, it } from "vitest";
import { applyAdvisory, parseAdvisory } from "./judge";
import type { ValidationResult } from "./types";

const valid: ValidationResult = {
  severity: "valid",
  reasonClass: "rule_violation",
  rules: [{ id: "H1", pass: true, message: "Wave 3 is not the shortest.", severity: "rejected" }],
};

const rejected: ValidationResult = {
  severity: "rejected",
  reasonClass: "rule_violation",
  rules: [{ id: "H2", pass: false, message: "Wave 4 overlaps wave 1 in a cash impulse.", severity: "rejected" }],
};

describe("advisory judge", () => {
  it("parses agree + flags", () => {
    const p = parseAdvisory({ agree: false, flags: [{ id: "J2", message: "C looks unfinished." }] });
    expect(p?.agree).toBe(false);
    expect(p?.flags?.[0]?.message).toContain("unfinished");
  });

  it("does not upgrade a reject when the judge agrees", () => {
    const next = applyAdvisory(rejected, { agree: true, notes: ["looks fine"] });
    expect(next.severity).toBe("rejected");
    expect(next.advisory).toEqual({ ran: true, agree: true });
    expect(next.rules.some((r) => r.id === "J0")).toBe(true);
  });

  it("flags extra caution when the judge disputes a valid gate", () => {
    const next = applyAdvisory(valid, { agree: false, flags: [{ id: "J1", message: "Working range looks local." }] });
    expect(next.severity).toBe("flagged");
    expect(next.rules.some((r) => r.severity === "rejected" && !r.pass)).toBe(false);
  });

  it("is a no-op when the judge did not run", () => {
    const next = applyAdvisory(valid, null);
    expect(next.severity).toBe("valid");
    expect(next.advisory).toEqual({ ran: false, agree: null });
  });
});
