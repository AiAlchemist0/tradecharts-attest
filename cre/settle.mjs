/**
 * Write a close-kill decision onchain (KillSettled, Base Sepolia).
 *
 *   node settle.mjs '{"flatten":true,"symbol":"ETH","close":2400,"kill":2500,"side":"long","net":4,"reasonHash":"1a2b3c4d"}'
 *
 * Reads the settlement wallet from EAS_ATTESTER_KEY (env) or the keys folder.
 * The decision JSON is the workflow's public output — the private policy
 * (kills) stays in the TEE until the owner anchors the decision here.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Contract, JsonRpcProvider, Wallet, formatEther } from "ethers";

const RPC = "https://sepolia.base.org";
const KILL_SETTLED = process.env.KILL_SETTLED ?? "DEPLOY_AND_SET_ADDRESS";

const ABI = [
  "function settle(string symbol, bool flatten, int256 closePrice, int256 kill, string side, int256 net, bytes8 reasonHash) external",
  "event Settled(string symbol, bool flatten, int256 closePrice, int256 kill, string side, int256 net, bytes8 reasonHash, uint64 decidedAt)",
];

function loadKey() {
  if (process.env.EAS_ATTESTER_KEY) return process.env.EAS_ATTESTER_KEY;
  const file = join(homedir(), ".tradecharts-keys", "eas-attester-wallet.txt");
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith("PRIVATE_KEY="));
  if (!line) throw new Error("no settlement key: set EAS_ATTESTER_KEY or fill the keys file");
  return line.slice("PRIVATE_KEY=".length).trim();
}

const decision = JSON.parse(process.argv[2] ?? "{}");
for (const k of ["flatten", "symbol", "close", "kill", "side", "net", "reasonHash"]) {
  if (!(k in decision)) throw new Error(`decision JSON missing ${k} — paste the workflow output`);
}

// World / AgentBook gate: the agent may settle only when it resolves to a
// verified human. Override with --allow-unregistered for local tests.
const allowUnregistered = process.argv.includes("--allow-unregistered");
const AGENT_BOOK = "0xA23aB2712eA7BBa896930544C7d6636a96b944dA";
const lookup = await fetch("https://worldchain-mainnet.g.alchemy.com/public", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [
      {
        to: AGENT_BOOK,
        data: "0x451a02f4" + "0".repeat(24) + process.env.AGENT_ADDRESS?.replace(/^0x/, "").toLowerCase(),
      },
      "latest",
    ],
  }),
}).then((r) => r.json());
const agentAddress = process.env.AGENT_ADDRESS ?? "";
const humanBacked = lookup.result && lookup.result !== "0x" + "0".repeat(64);
if (!humanBacked && !allowUnregistered) {
  throw new Error(
    `agent ${agentAddress || "(AGENT_ADDRESS unset)"} is not human-backed in AgentBook — register it first (world/README.md)`,
  );
}
console.log(humanBacked ? `agent human-backed (id ${lookup.result}) — settle may proceed` : "UNREGISTERED settle allowed (--allow-unregistered)");

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(loadKey(), provider);
console.log(`settler ${wallet.address} (${formatEther(await provider.getBalance(wallet.address))} ETH)`);
if (KILL_SETTLED.startsWith("DEPLOY")) throw new Error("set KILL_SETTLED=<deployed address> first");

const c = new Contract(KILL_SETTLED, ABI, wallet);
const tx = await c.settle(
  decision.symbol,
  decision.flatten,
  BigInt(Math.round(decision.close)),
  BigInt(Math.round(decision.kill)),
  decision.side,
  BigInt(Math.round(decision.net)),
  "0x" + String(decision.reasonHash).replace(/^0x/, "").padStart(16, "0"),
);
const rc = await tx.wait();
const ev = rc.logs.map((l) => { try { return c.interface.parseLog(l); } catch { return null; } }).find(Boolean);
console.log(`KillSettled flatten=${decision.flatten} ${decision.symbol} tx ${rc.hash}`);
console.log(`decidedAt ${ev?.args?.decidedAt ?? "?"} reasonHash ${decision.reasonHash}`);
