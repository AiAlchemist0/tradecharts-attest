import { Bytes } from "@graphprotocol/graph-ts";

/**
 * EAS schema for a confirmed TradeCharts map, registered on Base Sepolia:
 * (string symbol, string timeframe, string side, string longKill, string shortKill,
 *  uint256 barTime, bytes32 mapHash, bool positioned)
 *
 * UID = keccak256(abi.encode(schema, resolver=0x0, revocable=true)) — deterministic,
 * so it is known before registration. Attestations under any other schema are ignored.
 */
export const MAP_SCHEMA_UID = Bytes.fromHexString(
  "0x803c0defbc7f0a3f92ba096365fba94da3c8fc046e6212a6a62ac015b0c5b74b",
);

/** ABI tuple type of the attestation data payload. */
export const MAP_DATA_TYPE = "(string,string,string,string,string,uint256,bytes32,bool)";
