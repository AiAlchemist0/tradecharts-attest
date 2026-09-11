import { BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import { Confirmed as ConfirmedEvent } from "../generated/MapConfirmed/MapConfirmed";
import { Map } from "../generated/schema";

/**
 * Confirmed maps arrive as MapConfirmed events on Base — one event is one map,
 * emitted by the seed script (desk Confirm is still a private save). Compose
 * (bag ⋈ maps) runs client-side in src/graph — this subgraph is the maps side.
 */
export function handleConfirmed(event: ConfirmedEvent): void {
  let p = event.params;

  let map = new Map(event.transaction.hash.toHexString() + "-" + event.logIndex.toString());
  map.wallet = p.wallet;
  map.symbol = p.symbol;
  map.timeframe = p.timeframe;
  map.side = p.side;

  // Kills are decimal text. Empty string = no kill on that end, which must stay
  // null (compose treats null as "no kill"; a zero would fake an insolvent check).
  if (p.longKill != "") {
    map.longKill = BigDecimal.fromString(p.longKill);
  }
  if (p.shortKill != "") {
    map.shortKill = BigDecimal.fromString(p.shortKill);
  }

  map.barTime = p.barTime;
  map.mapHash = p.mapHash;
  map.positioned = p.positioned;
  map.txHash = event.transaction.hash;
  map.createdAt = event.block.timestamp;
  map.save();
}
