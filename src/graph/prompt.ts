/**
 * Format compose rows into the block the desk's Ask AI prepends to its prompt
 * — the "AI decides from the Graph row" leg of the AI Use Case line. The desk
 * copies this file verbatim (SSOT lives here; src/index.ts re-exports it).
 */

import type { ComposedRow } from "./compose";

function fmt(n: number): string {
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 6;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function exposure(r: ComposedRow): string {
  if (r.perp < 0) return `debt/short ${fmt(Math.abs(r.perp))}`;
  if (r.perp > 0) return `long ${fmt(r.perp)}${r.spot > 0 ? ` + spot ${fmt(r.spot)}` : ""}`;
  if (r.spot > 0) return `spot ${fmt(r.spot)}`;
  return "no exposure";
}

export function composePromptBlock(rows: ComposedRow[], wallet?: string): string {
  if (rows.length === 0) {
    return `Graph compose (${wallet ?? "connected wallet"}): no bag and no confirmed maps yet.`;
  }
  const lines = rows.map(
    (r) =>
      `- ${r.symbol}: ${exposure(r)}; confirmed map ${r.bias === "none" ? "none" : r.bias}; status ${r.status}`,
  );
  const fighting = rows.filter((r) => r.status === "fighting");
  const verdict = fighting.length
    ? `${fighting.length} coin${fighting.length > 1 ? "s" : ""} on this book FIGHT${fighting.length > 1 ? "" : "S"} the confirmed map: ${fighting.map((r) => r.symbol).join(", ")}.`
    : "No coin on this book is fighting its confirmed map.";
  return [`Graph compose (${wallet ?? "connected wallet"}):`, ...lines, verdict].join("\n");
}
