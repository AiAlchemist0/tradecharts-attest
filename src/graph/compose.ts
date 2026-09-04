import { conflictOf, type BookRow, type Conflict, type MapBias } from "../policy/conflict";
import type { StandardBagToken } from "./standard";

export type MapRow = {
  symbol: string;
  bias: MapBias;
  longKill: number | null;
  shortKill: number | null;
};

export type PerpRow = {
  symbol: string;
  /** Signed coins. Positive = long. */
  size: number;
  liq: number | null;
};

export type ComposedRow = {
  symbol: string;
  spot: number;
  perp: number;
  liq: number | null;
  bias: MapBias;
  status: Conflict;
};

function norm(sym: string): string {
  return sym.replace(/[-_/]/g, "").toUpperCase().replace(/USDT$|USD$/, "") || sym.toUpperCase();
}

/**
 * Join a standardized bag with our maps (and optional HL perps).
 * Two Graph products → one decision. This is the compose prize.
 */
export function compose(opts: {
  bag: StandardBagToken[];
  maps: MapRow[];
  perps?: PerpRow[];
}): ComposedRow[] {
  const keys = new Set<string>();
  const bagBy = new Map<string, number>();
  for (const t of opts.bag) {
    const k = norm(t.symbol);
    keys.add(k);
    bagBy.set(k, (bagBy.get(k) ?? 0) + t.amount);
  }
  const mapBy = new Map<string, MapRow>();
  for (const m of opts.maps) {
    const k = norm(m.symbol);
    keys.add(k);
    mapBy.set(k, m);
  }
  const perpBy = new Map<string, PerpRow>();
  for (const p of opts.perps ?? []) {
    const k = norm(p.symbol);
    keys.add(k);
    perpBy.set(k, p);
  }

  const out: ComposedRow[] = [];
  for (const symbol of [...keys].sort()) {
    const map = mapBy.get(symbol);
    const perp = perpBy.get(symbol);
    const row: BookRow = {
      symbol,
      spot: bagBy.get(symbol) ?? 0,
      perp: perp?.size ?? 0,
      liq: perp?.liq ?? null,
      bias: map?.bias ?? "none",
      longKill: map?.longKill ?? null,
      shortKill: map?.shortKill ?? null,
    };
    out.push({
      symbol,
      spot: row.spot,
      perp: row.perp,
      liq: row.liq,
      bias: row.bias,
      status: conflictOf(row),
    });
  }
  return out;
}
