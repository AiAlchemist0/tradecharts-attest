/**
 * Pure validator. Raw model JSON never reaches the canvas without this gate.
 * Spec: docs/SPEC.md
 */

import type {
  MeasureBounds,
  Proposal,
  ReasonClass,
  RuleResult,
  Severity,
  ValidateOpts,
  ValidationResult,
  WavePattern,
  WavePivot,
} from "./types";

export type {
  AdvisoryReport,
  MeasureBounds,
  MeasureLast,
  Proposal,
  ReasonClass,
  RuleResult,
  Severity,
  ValidateOpts,
  ValidationResult,
  WavePattern,
  WavePivot,
} from "./types";

export { applyAdvisory, parseAdvisory } from "./judge";
export type { AdvisoryPayload } from "./judge";

export function structureOf(pattern: WavePattern): "impulse" | "corrective" {
  return pattern === "impulse" ? "impulse" : "corrective";
}

export function resolvePattern(raw: Record<string, unknown>): WavePattern | null {
  const p = raw.pattern;
  if (p === "impulse" || p === "zigzag" || p === "flat" || p === "unresolved") return p;
  if (raw.structure === "impulse") return "impulse";
  if (raw.structure === "corrective") return "zigzag";
  return null;
}

const KINDS = new Set<WavePivot["kind"]>(["impulse", "corrective", "forecast-up", "forecast-down", "origin"]);
const ANCHORS = new Set<WavePivot["anchor"]>(["high", "low"]);

const IMPULSE = /^(?:\(?([1-5])\)?|wave\s*([1-5]))$/i;
const CORRECTIVE = /^(?:\(?([abc])\)?|wave\s*([abc]))$/i;

function rule(id: string, pass: boolean, message: string, severity: Severity): RuleResult {
  return { id, pass, message, severity };
}

function worst(rules: RuleResult[]): Severity {
  if (rules.some((r) => !r.pass && r.severity === "rejected")) return "rejected";
  if (rules.some((r) => !r.pass && r.severity === "flagged")) return "flagged";
  return "valid";
}

function reasonOf(rules: RuleResult[]): ReasonClass {
  const bad = rules.find((r) => !r.pass && r.severity === "rejected");
  if (bad?.id.startsWith("P")) return "malformed_output";
  return "rule_violation";
}

function isNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function parseTime(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const iso = Date.parse(value.length === 7 ? `${value}-01T00:00:00Z` : `${value.slice(0, 10)}T00:00:00Z`);
    if (!Number.isNaN(iso)) return Math.floor(iso / 1000);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export function parsePivot(raw: unknown): WavePivot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const price = typeof o.price === "string" ? Number(o.price) : o.price;
  const time = parseTime(o.time ?? o.t);
  const label = o.label;
  const anchor = o.anchor;
  const kind = o.kind;
  if (typeof label !== "string" || !label.trim()) return null;
  if (!isNum(price) || price <= 0) return null;
  if (time == null) return null;
  if (anchor !== "high" && anchor !== "low") return null;
  if (typeof kind !== "string" || !KINDS.has(kind as WavePivot["kind"])) return null;
  if (!ANCHORS.has(anchor)) return null;
  return { label: label.trim(), price, time, anchor, kind: kind as WavePivot["kind"] };
}

function schemaRules(pivots: WavePivot[], rawOk: boolean, stringPrice: boolean): RuleResult[] {
  const out: RuleResult[] = [];
  if (!rawOk || stringPrice) {
    out.push(rule("P1", false, "Pivots must parse as numbers. No NaN, no string prices.", "rejected"));
    return out;
  }
  out.push(rule("P1", pivots.length > 0, pivots.length ? "Pivots parsed." : "No usable pivots.", "rejected"));
  if (!pivots.length) return out;

  const times = pivots.map((p) => p.time);
  const ordered = times.every((t, i) => i === 0 || t >= times[i - 1]!);
  const dup = new Set(times).size !== times.length;
  out.push(rule("P2", ordered && !dup, ordered && !dup ? "Times are chronological." : "Pivots must be chronological with no duplicate times.", "rejected"));

  const fields = pivots.every((p) => p.label && isNum(p.price) && isNum(p.time) && ANCHORS.has(p.anchor) && KINDS.has(p.kind));
  out.push(rule("P3", fields, fields ? "Required fields present." : "Each pivot needs label, price, time, anchor, kind.", "rejected"));

  const prices = pivots.map((p) => p.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const spanOk = min > 0 && max / min <= 1000;
  out.push(rule("P4", spanOk, spanOk ? "Price range is plausible." : "Prices span more than 1000× — likely a decimal error.", "flagged"));
  return out;
}

function impulseIndex(label: string): number | null {
  const m = label.trim().match(IMPULSE);
  if (!m) return null;
  return Number(m[1] || m[2]);
}

function abcIndex(label: string): "A" | "B" | "C" | null {
  const m = label.trim().match(CORRECTIVE);
  if (!m) return null;
  return (m[1] || m[2] || "").toUpperCase() as "A" | "B" | "C";
}

function pickImpulse(pivots: WavePivot[]): WavePivot[] {
  const map = new Map<number, WavePivot>();
  for (const p of pivots) {
    const n = impulseIndex(p.label);
    if (n) map.set(n, p);
  }
  return [1, 2, 3, 4, 5].map((n) => map.get(n)).filter((p): p is WavePivot => p != null);
}

function pickAbc(pivots: WavePivot[]): WavePivot[] {
  const map = new Map<string, WavePivot>();
  for (const p of pivots) {
    const n = abcIndex(p.label);
    if (n) map.set(n, p);
  }
  return (["A", "B", "C"] as const).map((n) => map.get(n)).filter((p): p is WavePivot => p != null);
}

function findOrigin(pivots: WavePivot[]): WavePivot | undefined {
  return pivots.find((p) => p.kind === "origin") ?? pivots.find((p) => p.label === "0" || p.label === "(0)");
}

function elliottRules(pivots: WavePivot[], structure: "impulse" | "corrective"): RuleResult[] {
  const out: RuleResult[] = [];
  if (structure === "impulse") {
    const legs = pickImpulse(pivots);
    out.push(rule("H3", legs.length === 5, legs.length === 5 ? "Impulse has 1–5." : `Impulse needs 1–5 (found ${legs.length}).`, "rejected"));
    if (legs.length === 5) {
      const [w1, w2, w3, w4, w5] = legs;
      const origin = findOrigin(pivots);
      const l3 = Math.abs(w3.price - w2.price);
      const l5 = Math.abs(w5.price - w4.price);
      if (!origin) {
        out.push(rule("H1", false, "Impulse origin required to measure whether wave 3 is shortest.", "rejected"));
        out.push(rule("H4", false, "Impulse origin required to measure wave 2 vs origin.", "rejected"));
      } else {
        const l1 = Math.abs(w1.price - origin.price);
        const h1 = !(l3 <= l1 && l3 <= l5);
        out.push(rule("H1", h1, h1 ? "Wave 3 is not the shortest." : "Wave 3 cannot be the shortest of 1/3/5.", "rejected"));
        const bull = w5.price > w1.price;
        const h4 = bull ? w2.price > origin.price : w2.price < origin.price;
        out.push(rule("H4", h4, h4 ? "Wave 2 holds the origin." : "Wave 2 retraced through the origin.", "rejected"));
      }

      const bull = w5.price > w1.price;
      const h2 = bull ? w4.price > w1.price : w4.price < w1.price;
      out.push(rule("H2", h2, h2 ? "Wave 4 does not overlap wave 1." : "Wave 4 overlaps wave 1 in a cash impulse.", "rejected"));
    }
  } else {
    const abc = pickAbc(pivots);
    out.push(rule("H3", abc.length === 3, abc.length === 3 ? "Corrective has A-B-C." : `Corrective needs A-B-C (found ${abc.length}).`, "rejected"));
  }
  return out;
}

function killRules(longKill?: number, shortKill?: number): RuleResult[] {
  const ok = isNum(longKill) && longKill > 0 && isNum(shortKill) && shortKill > 0;
  return [rule("H5", ok, ok ? "Both paths carry an invalidation." : "Every forecast must have a kill price.", "rejected")];
}

/** Relative band for “near a ratio.” Exact overshoot tolerance is product-owned, not in this module. */
const FIB_NEAR_BAND = 0.08;

function nearRatio(value: number, targets: number[], tol = FIB_NEAR_BAND): boolean {
  return targets.some((t) => Math.abs(value - t) / t <= tol);
}

const FIB_RATIOS = [0.236, 0.382, 0.5, 0.618, 0.786, 0.886, 1, 1.236, 1.618, 2.618];

function majorRange(pivots: WavePivot[]): { low: number; high: number } | null {
  if (pivots.length < 2) return null;
  const prices = pivots.map((p) => p.price);
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

function nearFibOfRange(price: number, range: { low: number; high: number }): boolean {
  const span = range.high - range.low;
  if (span <= 0) return false;
  const pos = (price - range.low) / span;
  return nearRatio(pos, FIB_RATIOS) || nearRatio(price / range.high, FIB_RATIOS);
}

function fibRules(
  pivots: WavePivot[],
  structure: "impulse" | "corrective",
  extra?: { hold?: number; longTarget?: number; shortTarget?: number; anchors?: WavePivot[] },
): RuleResult[] {
  const out: RuleResult[] = [];
  const origin = findOrigin(pivots);
  const range = majorRange(pivots);

  if (range) {
    const interior = pivots.filter((p) => p.kind !== "origin" && p.label !== "0");
    const near = interior.filter((p) => nearFibOfRange(p.price, range));
    const f1 = interior.length === 0 || near.length > 0;
    out.push(rule("F1", f1, f1 ? "Key pivots sit near a standard Fib of the major range." : "No interior pivot sits near a standard Fib of the major range.", "flagged"));
  }

  if (structure === "impulse") {
    const legs = pickImpulse(pivots);
    if (legs.length === 5) {
      const [w1, w2] = legs;
      if (origin) {
        const denom = Math.abs(w1.price - origin.price);
        const retrace = denom > 0 ? Math.abs(w2.price - w1.price) / denom : 0;
        const deep = retrace > 0.7;
        out.push(rule("F2", !deep, deep ? `Wave 2 retrace ${(retrace * 100).toFixed(1)}% is deep (flag).` : "Wave 2 retrace is in the textbook pocket.", "flagged"));
      }
    }
  } else {
    const abc = pickAbc(pivots);
    if (abc.length === 3) {
      const [a, b, c] = abc;
      const bc = Math.abs(c.price - b.price);
      const ab = Math.abs(b.price - a.price);
      const cOverA = ab > 0 ? bc / ab : 0;
      const f3 = nearRatio(cOverA, [1, 1.236, 1.618]);
      out.push(rule("F3", f3, f3 ? `C/A ${cOverA.toFixed(3)} sits on a standard ratio.` : `C/A ${cOverA.toFixed(3)} misses 1.0 / 1.236 / 1.618.`, "flagged"));
      if (!origin) {
        out.push(rule("F4", false, "B retrace of A needs origin.", "flagged"));
      } else {
        const aLen = Math.abs(a.price - origin.price);
        const retrace = aLen > 0 ? ab / aLen : 0;
        const f4 = nearRatio(retrace, [0.382, 0.5, 0.618]);
        out.push(rule("F4", f4, f4 ? `B retrace of A ${(retrace * 100).toFixed(1)}% sits on 38.2 / 50 / 61.8.` : `B retrace of A ${(retrace * 100).toFixed(1)}% misses 38.2 / 50 / 61.8.`, "flagged"));
      }
    }
  }

  if (extra && range) {
    const anchors = extra.anchors ?? pivots;
    const hits = (price: number) =>
      nearFibOfRange(price, range) || anchors.some((p) => Math.abs(p.price - price) / Math.max(price, 1e-9) < 0.01);
    const longOk = extra.longTarget == null || hits(extra.longTarget);
    const shortOk = extra.shortTarget == null || hits(extra.shortTarget);
    const f5 = longOk && shortOk;
    out.push(rule("F5", f5, f5 ? "Targets sit on the measured range or a printed pivot." : "A target is not near a Fib of the major range or a printed pivot.", "flagged"));
    if (extra.hold != null) {
      const f6 = nearFibOfRange(extra.hold, range);
      out.push(rule("F6", f6, f6 ? "Hold line sits near a Fib of the major range." : "Hold line is not near a Fib of the major range.", "flagged"));
    }
  }
  return out;
}

const PRICE_NEAR = 0.02;
const SPAN_FRAC = 0.5;

function nearRel(a: number, b: number): boolean {
  const denom = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / denom <= PRICE_NEAR;
}

/** Printed 0–5 / ABC must cover the measured working range — not a last-swing sketch. */
export function spanRules(printed: WavePivot[], bounds?: MeasureBounds): RuleResult[] {
  if (!bounds || printed.length < 2) return [];
  const hitsHigh = printed.some((p) => nearRel(p.price, bounds.high));
  const hitsLow = printed.some((p) => nearRel(p.price, bounds.low));
  if (hitsHigh && hitsLow) {
    return [rule("S5", true, "Printed count includes both working-range extremes.", "flagged")];
  }
  const r0 = parseTime(bounds.highT);
  const r1 = parseTime(bounds.lowT);
  const t0 = Math.min(...printed.map((p) => p.time));
  const t1 = Math.max(...printed.map((p) => p.time));
  const rangeSpan = r0 != null && r1 != null ? Math.abs(r1 - r0) : 0;
  const countSpan = t1 - t0;
  const spanOk = (hitsHigh || hitsLow) && rangeSpan > 0 && countSpan >= rangeSpan * SPAN_FRAC;
  return [
    rule(
      "S5",
      spanOk,
      spanOk
        ? "Printed count spans most of the working range."
        : `Map is a local sketch. Label both working-range extremes (${bounds.highT} ${bounds.high} and ${bounds.lowT} ${bounds.low}) or span most of that range.`,
      "flagged",
    ),
  ];
}

const WEEK = 7 * 86_400;

function isoToTime(t: string): number | undefined {
  const ms = Date.parse(t.includes("T") ? t : `${t}T00:00:00Z`);
  return Number.isFinite(ms) ? ms / 1000 : undefined;
}

function nearPrice(a: number, b: number, frac = 0.008): boolean {
  return Math.abs(a - b) / Math.max(Math.abs(b), 1e-9) < frac;
}

/** Live legs after the last printed parent — last print may start the line. */
export function pathTowardLast(
  path: WavePivot[],
  lastPrinted?: WavePivot,
  lastBar?: { time: number; c: number },
): boolean {
  if (path.length < 2) return false;
  const after = lastPrinted
    ? path.filter((p) => p.time > lastPrinted.time && !nearPrice(p.price, lastPrinted.price))
    : path;
  if (after.length < 2) return false;
  if (lastPrinted && lastBar && lastBar.time - lastPrinted.time > 14 * 86_400) {
    const onTape = after.some((p) => p.time <= lastBar.time + WEEK);
    const nearNow = after.some((p) => nearPrice(p.price, lastBar.c, 0.08));
    if (!onTape && !nearNow) return false;
  }
  return true;
}

function structuralRules(
  longPivots: WavePivot[],
  shortPivots: WavePivot[],
  printed: WavePivot[],
  lastBar?: { time: number; c: number },
): RuleResult[] {
  const two = longPivots.length > 0 && shortPivots.length > 0;
  const altCopy =
    two &&
    longPivots.length === shortPivots.length &&
    longPivots.every((p, i) => p.price === shortPivots[i]?.price);
  const mixedForecast = printed.some((p) => p.kind === "forecast-up" || p.kind === "forecast-down");
  const lastPrinted = printed[printed.length - 1];
  const complete =
    pathTowardLast(longPivots, lastPrinted, lastBar) && pathTowardLast(shortPivots, lastPrinted, lastBar);
  return [
    rule("S1", two, two ? "Two forward paths present." : "Need both Long and Short paths.", "flagged"),
    rule("S2", two && !altCopy, altCopy ? "Alternate path is a copy of Long." : two ? "Alternate path preserved." : "Alternate path missing.", "flagged"),
    rule("S3", !mixedForecast, mixedForecast ? "Forecast labels mixed into the printed count." : "Printed count stays on its pane.", "flagged"),
    rule(
      "S6",
      complete,
      complete
        ? "Long and Short complete toward the last print."
        : "Long and Short must be full paths from the last printed label toward the last bar. Do not park one label on 5 / C — emit the printed legs already on the tape, then the next Fib legs.",
      "flagged",
    ),
  ];
}

function internalParent(label: string): string {
  const i = label.lastIndexOf("/");
  return i >= 0 ? label.slice(i + 1).replace(/[()]/g, "").toUpperCase() : "";
}

function hasParentNest(internals: WavePivot[] | undefined, parent: string): boolean {
  if (!internals?.length) return false;
  const want = parent.toUpperCase();
  return internals.some((p) => internalParent(p.label) === want);
}

const C_IS_THREE = /\bc\b.{0,24}\bthree\b|\bthree\b.{0,16}\bc\b|do not (?:force|5-count)/i;

function internalRules(
  internals: WavePivot[] | undefined,
  pattern: WavePattern,
  reason?: string,
): RuleResult[] {
  const out: RuleResult[] = [];
  if (pattern === "impulse") {
    const nested = hasParentNest(internals, "1") && hasParentNest(internals, "3") && hasParentNest(internals, "5");
    out.push(
      rule(
        "S4",
        nested,
        nested ? "Motive legs 1/3/5 have subwaves." : "Impulse missing i–v under 1, 3, or 5. Skeleton only — finer swings unused.",
        "flagged",
      ),
    );
  } else if (pattern === "zigzag" || pattern === "flat") {
    const cThree = Boolean(reason && C_IS_THREE.test(reason));
    const cNest = hasParentNest(internals, "C");
    const ok = cNest || cThree;
    out.push(
      rule(
        "S4",
        ok,
        cThree
          ? "C stays a three — no forced 5-count."
          : cNest
            ? "C has type-proof internals."
            : `${pattern === "flat" ? "Flat" : "Zigzag"} C has no i–v. Say C is a three, or nest from the finer list.`,
        "flagged",
      ),
    );
  }
  if (internals && internals.length > 1) {
    const times = internals.map((p) => p.time);
    const ordered = times.every((t, i) => i === 0 || t > times[i - 1]!);
    out.push(
      rule(
        "I1",
        ordered,
        ordered ? "Subwaves are chronological." : "Subwaves must be strictly later each step (no shared dates).",
        "flagged",
      ),
    );
  }
  return out;
}

export function validatePivots(pivots: WavePivot[], structure: "impulse" | "corrective" = "impulse"): ValidationResult {
  const rules = [...schemaRules(pivots, true, false), ...elliottRules(pivots, structure)];
  const severity = worst(rules);
  return { severity, reasonClass: reasonOf(rules), rules };
}

export function extractJson(text: string): unknown {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no-json");
  return JSON.parse(body.slice(start, end + 1));
}

function parseSide(raw: unknown): { side: Proposal["long"] | null; stringPrice: boolean } {
  if (!raw || typeof raw !== "object") return { side: null, stringPrice: false };
  const o = raw as Record<string, unknown>;
  const target = typeof o.target === "string" ? Number(o.target) : o.target;
  const invalidation = typeof o.invalidation === "string" ? Number(o.invalidation) : o.invalidation;
  const stringPrice = typeof o.target === "string" || typeof o.invalidation === "string";
  const pivots = Array.isArray(o.pivots) ? o.pivots.map(parsePivot).filter((p): p is WavePivot => p != null) : [];
  if (!isNum(target) || !isNum(invalidation)) return { side: null, stringPrice };
  return { side: { pivots, target, invalidation }, stringPrice };
}

export function parseProposal(raw: unknown): { proposal: Proposal | null; stringPrice: boolean } {
  if (!raw || typeof raw !== "object") return { proposal: null, stringPrice: false };
  const o = raw as Record<string, unknown>;
  if (o.status === "unresolved") {
    const pattern = resolvePattern(o) ?? "unresolved";
    return {
      proposal: {
        status: "unresolved",
        reason: typeof o.reason === "string" ? o.reason : "unresolved",
        pattern,
        structure: structureOf(pattern),
        degree: typeof o.degree === "string" ? o.degree : undefined,
        pivots: [],
        long: { pivots: [], target: 0, invalidation: 0 },
        short: { pivots: [], target: 0, invalidation: 0 },
      },
      stringPrice: false,
    };
  }
  const pattern = resolvePattern(o);
  if (!pattern || pattern === "unresolved") return { proposal: null, stringPrice: false };
  const structure = structureOf(pattern);
  let stringPrice = false;
  const pivots: WavePivot[] = [];
  if (Array.isArray(o.pivots)) {
    for (const row of o.pivots) {
      if (row && typeof row === "object" && typeof (row as { price?: unknown }).price === "string") stringPrice = true;
      const p = parsePivot(row);
      if (p) pivots.push(p);
    }
  }
  const origin = o.origin ? parsePivot(o.origin) : undefined;
  if (origin && typeof (o.origin as { price?: unknown }).price === "string") stringPrice = true;
  const long = parseSide(o.long);
  const short = parseSide(o.short);
  if (long.stringPrice || short.stringPrice) stringPrice = true;
  if (!long.side || !short.side) return { proposal: null, stringPrice };
  const decision = o.decision && typeof o.decision === "object" ? (o.decision as Proposal["decision"]) : undefined;
  const hold = o.hold && typeof o.hold === "object" ? (o.hold as Proposal["hold"]) : undefined;
  const weights = o.weights && typeof o.weights === "object" ? (o.weights as Proposal["weights"]) : undefined;
  const internals: WavePivot[] = [];
  if (Array.isArray(o.internals)) {
    for (const row of o.internals) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      if (typeof rec.price === "string") stringPrice = true;
      const parent = typeof rec.parent === "string" ? rec.parent.trim() : "";
      const parsed = parsePivot(row);
      if (!parsed) continue;
      const label = parent && !parsed.label.includes("/") ? `${parsed.label}/${parent}` : parsed.label;
      internals.push({ ...parsed, label });
    }
  }
  return {
    proposal: {
      status: "ok",
      reason: typeof o.reason === "string" ? o.reason : undefined,
      pattern,
      structure,
      degree: typeof o.degree === "string" && o.degree.trim() ? o.degree.trim() : undefined,
      origin: origin ?? undefined,
      pivots,
      internals: internals.length ? internals : undefined,
      hold,
      long: long.side,
      short: short.side,
      decision,
      weights,
    },
    stringPrice,
  };
}

export function validateProposal(raw: unknown, opts?: ValidateOpts): ValidationResult & { proposal?: Proposal } {
  const parsed = parseProposal(raw);
  if (!parsed.proposal) {
    const rules = [rule("P1", false, "Proposal JSON did not match the schema.", "rejected")];
    return { severity: "rejected", reasonClass: "malformed_output", rules };
  }
  if (parsed.proposal.status === "unresolved") {
    const rules = [rule("P1", false, parsed.proposal.reason || "Model abstained.", "rejected")];
    return { severity: "rejected", reasonClass: "malformed_output", rules, proposal: parsed.proposal };
  }

  const printed = [...(parsed.proposal.origin ? [parsed.proposal.origin] : []), ...parsed.proposal.pivots];
  const lastTime = opts?.last ? isoToTime(opts.last.t) : undefined;
  const lastBar = opts?.last && lastTime != null ? { time: lastTime, c: opts.last.c } : undefined;
  const rules = [
    ...schemaRules(printed, true, parsed.stringPrice),
    ...elliottRules(printed, parsed.proposal.structure),
    ...killRules(parsed.proposal.long.invalidation, parsed.proposal.short.invalidation),
    ...fibRules(printed, parsed.proposal.structure, {
      hold: parsed.proposal.hold?.price,
      longTarget: parsed.proposal.long.target,
      shortTarget: parsed.proposal.short.target,
      anchors: [...printed, ...parsed.proposal.long.pivots, ...parsed.proposal.short.pivots],
    }),
    ...structuralRules(parsed.proposal.long.pivots, parsed.proposal.short.pivots, printed, lastBar),
    ...internalRules(parsed.proposal.internals, parsed.proposal.pattern, parsed.proposal.reason),
    ...spanRules(printed, opts?.range),
  ];
  const severity = worst(rules);
  return { severity, reasonClass: reasonOf(rules), rules, proposal: parsed.proposal };
}

export function caveats(result: ValidationResult): string[] {
  return result.rules.filter((r) => !r.pass).map((r) => `${r.id}: ${r.message}`);
}
