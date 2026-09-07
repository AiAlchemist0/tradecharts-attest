import { Bytes } from "@graphprotocol/graph-ts";

/**
 * EAS schema for a confirmed TradeCharts map, registered on Base Sepolia:
 * (string symbol, string timeframe, string side, string longKill, string shortKill,
 *  uint256 barTime, bytes32 mapHash, bool positioned)
 *
 * UID read from the Registered event of the registration tx
 * 0x0b097f557985736d871e2f254da2088c406b92d6f010ad4b9af01edd3c745c75 —
 * this EAS deployment's UID formula differs from both keccak(abi.encode)
 * and keccak(abi.encodePacked), so the onchain value is the source of truth.
 * Attestations under any other schema are ignored.
 */
export const MAP_SCHEMA_UID = Bytes.fromHexString(
  "0xd33f63c5fe4b01cd52272ebde987a52e291b00e80aa9b6ff4ecfa433f8ec99d3",
);

/** ABI tuple type of the attestation data payload. */
export const MAP_DATA_TYPE = "(string,string,string,string,string,uint256,bytes32,bool)";
