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

/** Empty-chat / MCP starter. Prompt text is this sentence — not a hidden essay. */
export const FIGHTING_ASK = "Is my bag fighting this map?";

export type ComposeAskRow = {
  symbol: string;
  spot: number;
  perp: number;
  bias: string;
  status: string;
};

export type ComposeAskPayload = {
  wallet: string;
  block: number | null;
  error: string | null;
  rows: ComposeAskRow[];
  cites: string[];
  text: string;
};

/**
 * One-line cite the desk strip and Ask AI share.
 * Example: `ETH fighting · confirmed short · spot 5.5 · Graph maps block 12345678`
 */
export function citeComposeRow(r: ComposedRow, block?: number | null): string {
  const bias = r.bias === "none" ? "none" : r.bias;
  const blk = block == null ? "Graph maps block unknown" : `Graph maps block ${block}`;
  return `${r.symbol} ${r.status} · confirmed ${bias} · ${exposure(r)} · ${blk}`;
}

/**
 * Structured facts for a live Ask / MCP turn. Status is conflictOf only.
 * Snapshot brief stays on composePromptBlock; this is the re-fetch payload.
 */
export function composeAskPayload(
  rows: ComposedRow[],
  opts: { wallet?: string; block?: number | null; error?: string | null } = {},
): ComposeAskPayload {
  const wallet = opts.wallet ?? "connected wallet";
  const block = opts.block ?? null;
  const error = opts.error ?? null;
  const compact: ComposeAskRow[] = rows.map((r) => ({
    symbol: r.symbol,
    spot: r.spot,
    perp: r.perp,
    bias: r.bias,
    status: r.status,
  }));
  const cites = rows.map((r) => citeComposeRow(r, block));

  if (error) {
    return {
      wallet,
      block,
      error,
      rows: [],
      cites: [],
      text: [
        `LIVE Graph compose failed for ${wallet}.`,
        `Studio error: ${error}`,
        "Do not invent aligned, fighting, unmapped, or insolvent. Say Studio failed. Do not guess.",
      ].join("\n"),
    };
  }

  if (rows.length === 0) {
    return {
      wallet,
      block,
      error: null,
      rows: compact,
      cites,
      text: [
        `LIVE Graph compose (re-fetched this turn) for ${wallet}.`,
        block == null ? "Graph maps block unknown." : `Graph maps block ${block}.`,
        "No bag and no confirmed maps in this fetch.",
        "Status comes only from conflictOf. Do not invent a status.",
        "Private chart Confirm is not a Graph map.",
      ].join("\n"),
    };
  }

  const allUnmapped = rows.every((r) => r.status === "unmapped");
  const lines = [
    `LIVE Graph compose (re-fetched this turn) for ${wallet}.`,
    block == null ? "Graph maps block unknown." : `Graph maps block ${block}.`,
    "Answer the user's question in their own words (position, long/short, price, bag vs map — whatever they asked).",
    "LIVE rows are bag ⋈ confirmed maps. Status is conflictOf only. Cite status exactly as written. Do not invent a status.",
    "Spot/perp on each cite is the position (long if spot or +perp, short if −perp). Last price and swings are in the desk brief — use those for price movement. Do not invent prints.",
    "Private chart Confirm is not a Graph map.",
  ];
  if (allUnmapped) {
    lines.push(
      "Every row is unmapped. Confirm is not onchain yet — do not treat the private JSON lock as a Graph map.",
    );
  }
  lines.push("", ...cites);

  return { wallet, block, error: null, rows: compact, cites, text: lines.join("\n") };
}

/** Accents stripped so "posición" and "posicion" share a match. */
function foldAsk(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Elliott empty-chat skills — never a Graph look-up. */
function isChartWorkflowAsk(folded: string): boolean {
  if (/^propose\b/.test(folded) && /\b(elliott|map|lock|weekly)\b/.test(folded)) return true;
  if (/^(confirm the map|confirm map)\b/.test(folded)) return true;
  if (/^map the macro\b/.test(folded)) return true;
  if (/\bbuild (wave internals|fib calculations|the wyckoff|the events calendar)\b/.test(folded)) return true;
  if (/\b(analyse|analyze) this chart\b/.test(folded)) return true;
  if (/\brun full analysis\b/.test(folded)) return true;
  if (/\blong short scenarios\b/.test(folded)) return true;
  if (/\brefine daily\b/.test(folded) || /\bsketch live\b/.test(folded)) return true;
  return false;
}

/**
 * Book-intent matcher. Open phrasing: position, long/short, price, bag vs map,
 * and the same idea in other languages. Do not treat Propose / Analyse / Fib
 * as a Graph look-up. The starter sentence always matches.
 */
export function isBookAsk(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t === FIGHTING_ASK) return true;
  const folded = foldAsk(t);
  if (!folded) return false;
  if (isChartWorkflowAsk(folded)) return false;
  if (
    /\b(bag|book|wallet|coin|coins|holding|holdings|portfolio|position|positions|exposure|inventory|allocation)\b/.test(
      folded,
    )
  ) {
    return true;
  }
  if (/\b(fighting|aligned|unmapped|insolvent|conflict)\b/.test(folded)) return true;
  if (/\b(long|short|longs|shorts)\b/.test(folded)) return true;
  if (/\b(price|prices|priced|pnl|profit|loss)\b/.test(folded)) return true;
  if (/\b(am i|do i hold|what do i|whats on|what is on|what i hold|what im holding)\b/.test(folded)) return true;
  if (
    /\b(cartera|posicion|posiciones|largo|corto|bolsa|tenencia|portefeuille|carteira|posicao|longo|curto|posizione|portafoglio|bestand|depot)\b/.test(
      folded,
    )
  ) {
    return true;
  }
  if (/持仓|仓位|钱包|多单|空单|多头|空头|позиция|портфель|лонг|шорт/.test(t)) return true;
  return false;
}
