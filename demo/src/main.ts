/**
 * Judges' demo: paste any address → the two live Graph products are joined
 * (Base ERC-20 bag ⋈ confirmed wave maps) into aligned / fighting / unmapped /
 * insolvent rows. No desk, no keys — both subgraphs are public Studio deploys.
 *
 * Endpoints default to our Studio deployments and can be overridden with
 * ?bag=<url> and ?maps=<url> query params.
 */
// Direct module imports (not the src/index barrel) — the barrel also exports
// policy/hash.ts, which uses node:crypto and cannot run in the browser.
import { fetchComposed } from "../../src/graph/queries";
import type { ComposedRow } from "../../src/graph/compose";

const DEFAULT_BAG =
  "https://api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest";
const DEFAULT_MAPS =
  "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";
const BUILDER_WALLET = "0xfA8C53B715755762209De11923fB99BC4607954B";

const bagUrl = new URLSearchParams(location.search).get("bag") ?? DEFAULT_BAG;
const mapsUrl = new URLSearchParams(location.search).get("maps") ?? DEFAULT_MAPS;

const STATUS_TONE: Record<ComposedRow["status"], string> = {
  aligned: "up",
  fighting: "down",
  unmapped: "muted",
  insolvent: "warn",
};

function fmtAmount(n: number): string {
  if (n === 0) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 6;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function row(r: ComposedRow): string {
  return `<tr>
    <td class="mono">${r.symbol}</td>
    <td class="mono num">${fmtAmount(r.spot)}</td>
    <td class="mono num">${r.perp === 0 ? "—" : fmtAmount(r.perp)}</td>
    <td class="mono">${r.bias === "none" ? "—" : r.bias}</td>
    <td><span class="status ${STATUS_TONE[r.status]}">${r.status}</span></td>
  </tr>`;
}

async function run(wallet: string): Promise<void> {
  const out = document.getElementById("out")!;
  out.innerHTML = `<p class="loading">Querying both subgraphs…</p>`;
  try {
    const rows = await fetchComposed(wallet, {
      standard: { endpoint: bagUrl },
      maps: { endpoint: mapsUrl },
    });
    if (rows.length === 0) {
      out.innerHTML = `<p class="loading">No bag and no maps for this address in the indexed window.</p>`;
      return;
    }
    const fighting = rows.filter((r) => r.status === "fighting").length;
    const aligned = rows.filter((r) => r.status === "aligned").length;
    out.innerHTML = `
      <p class="summary">${rows.length} rows · ${aligned} aligned · ${fighting} fighting</p>
      <table>
        <thead><tr><th>Symbol</th><th>Bag (Base)</th><th>Perp</th><th>Map</th><th>Status</th></tr></thead>
        <tbody>${rows.map(row).join("")}</tbody>
      </table>`;
  } catch (e) {
    out.innerHTML = `<p class="error">${e instanceof Error ? e.message : "compose failed"}</p>`;
  }
}

document.getElementById("app")!.innerHTML = `
  <header>
    <h1>TradeCharts Attest — compose</h1>
    <p>Two live Graph products, one join: a Base ERC-20 balances subgraph ⋈ confirmed wave maps.
       Every coin on the book is <b class="up">aligned</b>, <b class="down">fighting</b>, or
       <b class="muted">unmapped</b> against its map.</p>
  </header>
  <form id="f">
    <input id="w" placeholder="Paste any wallet address" spellcheck="false" autocomplete="off" />
    <button type="submit">Compose</button>
    <button type="button" id="preset">Builder wallet</button>
  </form>
  <section id="out" aria-live="polite"><p class="loading">Paste an address to join its bag with confirmed maps.</p></section>
  <footer>
    <p class="mono">bag: <a href="${bagUrl}" target="_blank" rel="noreferrer">${bagUrl.replace("https://api.studio.thegraph.com/query/", "…/")}</a></p>
    <p class="mono">maps: <a href="${mapsUrl}" target="_blank" rel="noreferrer">${mapsUrl.replace("https://api.studio.thegraph.com/query/", "…/")}</a></p>
    <p>Bag balances cover Transfers in the subgraph's indexed window (≈90 days). Maps are MapConfirmed events on Base Sepolia.
       Source: <a href="https://github.com/AiAlchemist0/tradecharts-attest" target="_blank" rel="noreferrer">tradecharts-attest</a> · live desk: <a href="https://tradecharts.app" target="_blank" rel="noreferrer">tradecharts.app</a></p>
  </footer>`;

const form = document.getElementById("f") as HTMLFormElement;
const input = document.getElementById("w") as HTMLInputElement;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const wallet = input.value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) run(wallet);
  else document.getElementById("out")!.innerHTML = `<p class="error">That is not a 0x… address.</p>`;
});
document.getElementById("preset")!.addEventListener("click", () => {
  input.value = BUILDER_WALLET;
  run(BUILDER_WALLET);
});
