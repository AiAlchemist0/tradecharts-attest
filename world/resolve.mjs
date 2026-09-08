/**
 * Resolve an agent's human backing in AgentBook (World Chain).
 *
 *   node world/resolve.mjs 0x…
 *
 * Canonical AgentBook: 0xA23aB2712eA7BBa896930544C7d6636a96b944dA.
 * lookupHuman(address) returns the anonymous human id (0 = not registered).
 */
const AGENT_BOOK = "0xA23aB2712eA7BBa896930544C7d6636a96b944dA";
const RPC = "https://worldchain-mainnet.g.alchemy.com/public";

// keccak256("lookupHuman(address)")[0:4] = 0x451a02f4 (computed with ethers, verified live)
const DATA_FOR = (addr) => "0x451a02f4" + addr.replace(/^0x/, "").toLowerCase().padStart(64, "0");

async function main() {
  const address = process.argv[2];
  if (!/^0x[a-fA-F0-9]{40}$/.test(address ?? "")) {
    console.error("usage: node world/resolve.mjs <agent-address>");
    process.exit(1);
  }
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: AGENT_BOOK, data: DATA_FOR(address) }, "latest"],
    }),
  });
  const json = await res.json();
  if (json.error) {
    console.error("rpc error:", json.error.message);
    process.exit(1);
  }
  const zero = "0x" + "0".repeat(64);
  if (!json.result || json.result === zero) {
    console.log(`${address}: NOT registered — no human backing`);
    process.exit(2);
  }
  console.log(`${address}: human-backed (anonymous id ${json.result})`);
}

main();
