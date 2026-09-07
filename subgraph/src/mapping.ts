import { BigDecimal, ethereum, store } from "@graphprotocol/graph-ts";
import { Attested, EAS, Revoked } from "../generated/EAS/EAS";
import { Map } from "../generated/schema";
import { MAP_DATA_TYPE, MAP_SCHEMA_UID } from "./constants";

/**
 * Confirmed maps arrive as EAS attestations on Base Sepolia. The Attested event
 * carries only ids, so the handler reads the attestation struct (which holds the
 * ABI-encoded map payload) via getAttestation, decodes it, and upserts a Map
 * entity. Compose (bag ⋈ maps) runs client-side in src/graph — this subgraph is
 * the maps side only.
 */
export function handleAttested(event: Attested): void {
  if (event.params.schemaUID != MAP_SCHEMA_UID) return;

  let eas = EAS.bind(event.address);
  let attestation = eas.getAttestation(event.params.uid);

  let decoded = ethereum.decode(MAP_DATA_TYPE, attestation.data);
  if (decoded == null) return;
  let tuple = decoded.toTuple();

  let map = new Map(event.params.uid.toHexString());
  map.wallet = event.params.recipient;
  map.symbol = tuple[0].toString();
  map.timeframe = tuple[1].toString();
  map.side = tuple[2].toString();

  // Kills are decimal text. Empty string = no kill on that end, which must stay
  // null (compose treats null as "no kill"; a zero would fake an insolvent check).
  let longKill = tuple[3].toString();
  if (longKill != "") {
    map.longKill = BigDecimal.fromString(longKill);
  }
  let shortKill = tuple[4].toString();
  if (shortKill != "") {
    map.shortKill = BigDecimal.fromString(shortKill);
  }

  map.barTime = tuple[5].toBigInt();
  map.mapHash = tuple[6].toBytes();
  map.positioned = tuple[7].toBoolean();
  map.txHash = event.transaction.hash;
  map.createdAt = event.block.timestamp;
  map.save();
}

/** A revoked attestation kills the map — the wallet returns to unmapped. */
export function handleRevoked(event: Revoked): void {
  let map = Map.load(event.params.uid.toHexString());
  if (map != null) {
    store.remove("Map", map.id);
  }
}
