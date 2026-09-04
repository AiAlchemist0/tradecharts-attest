/** Deterministic validator contract. Hard Elliott rules reject; Fib guidelines flag. */

export type WavePattern = "impulse" | "zigzag" | "flat" | "unresolved";

export type Severity = "valid" | "flagged" | "rejected";
export type ReasonClass = "rule_violation" | "malformed_output";

export type WavePivot = {
  label: string;
  price: number;
  time: number;
  anchor: "high" | "low";
  kind: "impulse" | "corrective" | "forecast-up" | "forecast-down" | "origin";
};

export type RuleResult = {
  id: string;
  pass: boolean;
  message: string;
  severity: Severity;
};

export type AdvisoryReport = {
  ran: boolean;
  agree: boolean | null;
};

export type ValidationResult = {
  severity: Severity;
  reasonClass: ReasonClass;
  rules: RuleResult[];
  advisory?: AdvisoryReport;
};

/** Working-range extremes from the measure packet. Optional — skip S5 when absent. */
export type MeasureBounds = {
  high: number;
  low: number;
  highT: string;
  lowT: string;
};

/** Last measured bar — S6 uses this as “current price”. */
export type MeasureLast = {
  t: string;
  c: number;
};

export type ValidateOpts = {
  range?: MeasureBounds;
  last?: MeasureLast;
};

export type PathSide = {
  pivots: WavePivot[];
  target: number;
  invalidation: number;
};

export type Proposal = {
  status: "ok" | "unresolved";
  reason?: string;
  /** Derived: impulse → impulse; zigzag / flat / unresolved → corrective. */
  structure: "impulse" | "corrective";
  pattern: WavePattern;
  /** Working degree in one phrase — e.g. weekly zigzag from ATH. */
  degree?: string;
  origin?: WavePivot;
  pivots: WavePivot[];
  /** Subwaves under each parent (i/1, a/2, i/C). Separate from 1–5 so P2 does not collide. */
  internals?: WavePivot[];
  hold?: { price: number; label: string };
  long: PathSide;
  short: PathSide;
  decision?: { boxLow: number; boxHigh: number; confirm: number; killA: number; killB: number };
  weights?: { long: number; short: number };
};
