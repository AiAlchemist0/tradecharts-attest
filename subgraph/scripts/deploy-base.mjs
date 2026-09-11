/**
 * Deploy MapConfirmed on Base and seed ETH long / BTC short / VIRTUAL short
 * for the builder book. Never prints keys.
 *
 *   node subgraph/scripts/deploy-base.mjs
 *
 * Key: ~/.tradecharts-keys/eas-attester-wallet.txt (or EAS_ATTESTER_KEY).
 * Needs Base ETH on the attester. Sepolia ETH does not count.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ContractFactory, Contract, JsonRpcProvider, Wallet, formatEther } from "ethers";
import solc from "solc";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RPC = process.env.BASE_RPC ?? "https://mainnet.base.org";
const BOOK = "0xfA8C53B715755762209De11923fB99BC4607954B";
const ATTESTER = "0x09759E44aF6CFC013586ae9a0ecdBC3D27734C7b";
const MIN_ETH = 0.00025;

const SEEDS = [
  { symbol: "ETH", side: "long", hash: "0x" + "0".repeat(63) + "1", positioned: true },
  { symbol: "BTC", side: "short", hash: "0x" + "0".repeat(63) + "2", positioned: false },
  { symbol: "VIRTUAL", side: "short", hash: "0x" + "0".repeat(63) + "3", positioned: false },
];

function loadKey() {
  if (process.env.EAS_ATTESTER_KEY) return process.env.EAS_ATTESTER_KEY.trim();
  const file = join(homedir(), ".tradecharts-keys", "eas-attester-wallet.txt");
  const line = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("PRIVATE_KEY="));
  if (!line) throw new Error("no attester key — set EAS_ATTESTER_KEY or fill eas-attester-wallet.txt");
  return line.slice("PRIVATE_KEY=".length).trim();
}

function compile() {
  const source = readFileSync(join(ROOT, "contracts", "MapConfirmed.sol"), "utf8");
  const input = {
    language: "Solidity",
    sources: { "MapConfirmed.sol": { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
    },
  };
  const raw = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = (raw.errors ?? []).filter((e) => e.severity === "error");
  if (errors.length) throw new Error(errors.map((e) => e.formattedMessage).join("\n"));
  const art = raw.contracts["MapConfirmed.sol"].MapConfirmed;
  return { abi: art.abi, bytecode: "0x" + art.evm.bytecode.object };
}

function patchYaml(address, startBlock) {
  const path = join(ROOT, "subgraph.yaml");
  let yaml = readFileSync(path, "utf8");
  yaml = yaml.replace(/network: .*/, "network: base");
  yaml = yaml.replace(/address: "0x[0-9a-fA-F]+"/, `address: "${address}"`);
  yaml = yaml.replace(/startBlock: \d+/, `startBlock: ${startBlock}`);
  yaml = yaml.replace(
    /Confirmed maps are MapConfirmed events on[^.]+\./,
    "Confirmed maps are MapConfirmed events on Base.",
  );
  writeFileSync(path, yaml);
  console.log(`patched subgraph.yaml → base ${address} startBlock ${startBlock}`);
}

const provider = new JsonRpcProvider(RPC);
const wallet = new Wallet(loadKey(), provider);
if (wallet.address.toLowerCase() !== ATTESTER.toLowerCase()) {
  throw new Error(`attester key is ${wallet.address}, expected ${ATTESTER}`);
}
const bal = Number(formatEther(await provider.getBalance(wallet.address)));
console.log(`attester ${wallet.address} ${bal} ETH on Base`);
if (bal < MIN_ETH) {
  console.error(
    [
      "Need Base ETH on the attester to deploy maps (Sepolia ETH does not count).",
      `Send ~0.0008 ETH on Base from ${BOOK} → ${ATTESTER}`,
      "then re-run: node subgraph/scripts/deploy-base.mjs",
    ].join("\n"),
  );
  process.exit(2);
}

const { abi, bytecode } = compile();
if (bytecode.length < 10) throw new Error("empty bytecode");
console.log(`bytecode ${((bytecode.length - 2) / 2) | 0} bytes`);

const factory = new ContractFactory(abi, bytecode, wallet);
const deployed = await factory.deploy();
const rc = await deployed.deploymentTransaction().wait();
const address = await deployed.getAddress();
const startBlock = rc.blockNumber;
console.log(`MapConfirmed ${address} block ${startBlock} tx ${rc.hash}`);

const c = new Contract(address, abi, wallet);
const txs = [];
for (const row of SEEDS) {
  const tx = await c.confirm(BOOK, row.symbol, "1wk", row.side, "", "", 0, row.hash, row.positioned);
  const seeded = await tx.wait();
  txs.push({ symbol: row.symbol, side: row.side, tx: seeded.hash, block: seeded.blockNumber });
  console.log(`seed ${row.symbol} ${row.side} ${seeded.hash}`);
}

patchYaml(address, startBlock);

const record = { chain: "base", address, startBlock, deployTx: rc.hash, seeds: txs, book: BOOK };
const out = join(ROOT, "deployments", "base.json");
mkdirSync(join(ROOT, "deployments"), { recursive: true });
writeFileSync(out, JSON.stringify(record, null, 2) + "\n");
console.log(`wrote ${out}`);
console.log("next: cd subgraph && npm run codegen && npm run deploy");
