/**
 * Optional advisory judge. Extra flags only — never upgrades a reject,
 * never paints pivots. Spec: docs/VALIDATOR-SCOPE.md
 */

import type { AdvisoryReport, RuleResult, ValidationResult } from "./types";

export type AdvisoryFlag = { id: string; message: string };

export type AdvisoryPayload = {
  agree: boolean;
  notes?: string[];
  flags?: AdvisoryFlag[];
};

function rule(id: string, pass: boolean, message: string): RuleResult {
  return { id, pass, message, severity: "flagged" };
}

function worst(rules: RuleResult[]): ValidationResult["severity"] {
  if (rules.some((r) => !r.pass && r.severity === "rejected")) return "rejected";
  if (rules.some((r) => !r.pass && r.severity === "flagged")) return "flagged";
  return "valid";
}

function jId(raw: string, i: number): string {
  const m = raw.trim().toUpperCase().match(/^J(\d{1,2})$/);
  if (m) return `J${m[1]}`;
  return `J${i + 1}`;
}

export function parseAdvisory(raw: unknown): AdvisoryPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.agree !== "boolean") return null;
  const notes = Array.isArray(o.notes)
    ? o.notes.filter((n): n is string => typeof n === "string" && n.trim().length > 0).map((n) => n.trim())
    : [];
  const flags: AdvisoryFlag[] = [];
  if (Array.isArray(o.flags)) {
    for (const row of o.flags) {
      if (!row || typeof row !== "object") continue;
      const f = row as Record<string, unknown>;
      if (typeof f.message !== "string" || !f.message.trim()) continue;
      const id = typeof f.id === "string" ? f.id : "J1";
      flags.push({ id, message: f.message.trim() });
    }
  }
  return { agree: o.agree, notes, flags };
}

/** Merge judge output. Deterministic P/H still own reject. */
export function applyAdvisory(
  verdict: ValidationResult,
  payload: AdvisoryPayload | null,
): ValidationResult {
  if (!payload) {
    return { ...verdict, advisory: { ran: false, agree: null } };
  }
  const extra: RuleResult[] = [];
  (payload.flags ?? []).forEach((f, i) => {
    extra.push(rule(jId(f.id, i), false, f.message));
  });
  for (const note of payload.notes ?? []) {
    if (!extra.some((r) => r.message === note)) extra.push(rule("J", false, note));
  }
  if (payload.agree === false && verdict.severity !== "rejected") {
    extra.push(
      rule("J0", false, "Advisory judge disputes this count. The deterministic gate still stands — Confirm is yours."),
    );
  }
  if (payload.agree === true && verdict.severity === "rejected") {
    extra.push(rule("J0", false, "Advisory judge would allow this; the gate still rejects. Rules win."));
  }
  const rules = [...verdict.rules, ...extra];
  const advisory: AdvisoryReport = { ran: true, agree: payload.agree };
  return { ...verdict, rules, severity: worst(rules), advisory };
}
