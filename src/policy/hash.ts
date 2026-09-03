import { createHash } from "node:crypto";
import type { WavePivot } from "../validator/types";

/** Canonical payload that goes onchain after Confirm. */
export type MapCommit = {
  symbol: string;
  timeframe: "1w" | "1d" | "1h";
  side: "long" | "short" | "both";
  pivots: Pick<WavePivot, "label" | "price" | "time" | "anchor" | "kind">[];
  longKill: number;
  shortKill: number;
  /** Unix seconds of the bar this commit is for (usually weekly close). */
  barTime: number;
};

function roundPx(n: number): number {
  return Math.round(n * 1e8) / 1e8;
}

/** Stable JSON: sorted keys, rounded prices, no extra fields. */
export function canonicalize(commit: MapCommit): string {
  const pivots = [...commit.pivots]
    .sort((a, b) => a.time - b.time || a.label.localeCompare(b.label))
    .map((p) => ({
      label: p.label,
      price: roundPx(p.price),
      time: p.time,
      anchor: p.anchor,
      kind: p.kind,
    }));
  return JSON.stringify({
    barTime: commit.barTime,
    longKill: roundPx(commit.longKill),
    pivots,
    shortKill: roundPx(commit.shortKill),
    side: commit.side,
    symbol: commit.symbol.toUpperCase(),
    timeframe: commit.timeframe,
  });
}

/** SHA-256 of the canonical JSON. Onchain attestations should keccak this same string. */
export function mapHash(commit: MapCommit): `0x${string}` {
  const digest = createHash("sha256").update(canonicalize(commit), "utf8").digest("hex");
  return `0x${digest}`;
}
