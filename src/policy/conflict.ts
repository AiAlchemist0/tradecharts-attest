export type MapBias = "long" | "short" | "both" | "none";

export type BookRow = {
  symbol: string;
  /** Spot quantity in coins. */
  spot: number;
  /** Signed perp size in coins. Positive = long, negative = short. */
  perp: number;
  /** Hyperliquid (or venue) liquidation price, if any. */
  liq: number | null;
  /** Confirmed map on this coin. */
  bias: MapBias;
  longKill: number | null;
  shortKill: number | null;
};

export type Conflict = "aligned" | "fighting" | "unmapped" | "insolvent";

function netDir(row: BookRow): "long" | "short" | "flat" {
  const net = row.spot + row.perp;
  if (net > 1e-12) return "long";
  if (net < -1e-12) return "short";
  return "flat";
}

/**
 * A row is insolvent when liquidation sits *inside* the still-valid map
 * (the position dies before the thesis does). Fighting is net direction
 * against a one-sided confirmed bias. Unmapped is exposure with no Confirm.
 */
export function conflictOf(row: BookRow): Conflict {
  const dir = netDir(row);
  if (dir === "flat" && row.bias === "none") return "unmapped";
  if (dir !== "flat" && row.bias === "none") return "unmapped";

  if (dir === "long" && row.liq != null && row.longKill != null && row.liq > row.longKill) {
    return "insolvent";
  }
  if (dir === "short" && row.liq != null && row.shortKill != null && row.liq < row.shortKill) {
    return "insolvent";
  }

  if (row.bias === "both" || row.bias === "none") {
    return dir === "flat" ? "unmapped" : "aligned";
  }
  if (dir === "flat") return "aligned";
  if (dir === row.bias) return "aligned";
  return "fighting";
}
