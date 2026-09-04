import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const { Resvg } = createRequire(join(dir, "../../AiAlchemist0-profile/scripts/rasterize.mjs"))(
  join(dir, "../../AiAlchemist0-profile/node_modules/@resvg/resvg-js"),
);

const bg = readFileSync(join(dir, "cover-bg.jpg")).toString("base64");

function pill(x, y, w, label) {
  return `<rect x="${x}" y="${y}" width="${w}" height="36" rx="8" fill="#111114" fill-opacity="0.88" stroke="#3a342c"/>
  <text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13" letter-spacing="1.4" fill="#ecece8">${label}</text>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <image href="data:image/jpeg;base64,${bg}" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/>
  <rect width="720" height="1080" fill="url(#fade)"/>
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#080809" stop-opacity="0.92"/>
      <stop offset="70%" stop-color="#080809" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#080809" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="48" y="48" width="64" height="64" rx="14" fill="#111114" stroke="#3a342c" stroke-width="2"/>
  <path d="M62 90 L74 68 L82 78 L98 52 L110 64" fill="none" stroke="#d8d4cc" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="132" y="78" font-family="Georgia, Times New Roman, serif" font-size="40" letter-spacing="8" fill="#ecece8">TRADECHARTS</text>
  <text x="132" y="106" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="15" letter-spacing="4" fill="#c4a06a">THE MAP IS THE STOP</text>
  <text x="48" y="188" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#ecece8">Elliott. Wyckoff. Your book.</text>
  <text x="48" y="228" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="20" fill="#8b8b86">A validator that refuses a broken count.</text>
  <text x="48" y="258" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="20" fill="#8b8b86">Wallet and Hyperliquid on the same pane.</text>
  <text x="48" y="288" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="20" fill="#8b8b86">When the thesis dies, the position can flatten.</text>
  ${pill(48, 340, 168, "ELLIOTT")}
  ${pill(228, 340, 168, "WYCKOFF")}
  ${pill(408, 340, 168, "VALIDATOR")}
  ${pill(48, 388, 188, "WALLET BOOK")}
  ${pill(248, 388, 188, "HYPERLIQUID")}
  ${pill(448, 388, 168, "TWO MAPS")}
  ${pill(48, 436, 200, "ALIGNED / FIGHTING")}
  ${pill(260, 436, 168, "KILL CLOSE")}
  ${pill(440, 436, 148, "FIB · RSI")}
  <rect x="48" y="520" width="540" height="168" rx="12" fill="#080809" fill-opacity="0.78" stroke="#2a2a2e"/>
  <text x="68" y="552" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12" letter-spacing="3" fill="#c4a06a">BOOK</text>
  <text x="68" y="588" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="#ecece8">ETH</text>
  <text x="200" y="588" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#3dbe8c">aligned</text>
  <text x="360" y="588" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">spot + perp · Long map</text>
  <text x="68" y="628" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="#ecece8">BTC</text>
  <text x="200" y="628" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#d45b4a">fighting</text>
  <text x="360" y="628" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">4x long · Short map</text>
  <text x="68" y="668" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="#ecece8">SOL</text>
  <text x="200" y="668" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">unmapped</text>
  <text x="360" y="668" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">bag, no Confirm</text>
  <text x="48" y="760" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="#ecece8">Your wallet is the desk.</text>
  <text x="48" y="790" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="18" fill="#8b8b86">A validated map can flatten matching perps on a close.</text>
  <text x="48" y="1040" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13" letter-spacing="3" fill="#5c5c58">THE GRAPH  ·  CHAINLINK CLOSE  ·  LEDGER APPROVE</text>
</svg>`;

writeFileSync(join(dir, "cover.svg"), svg);
const png = new Resvg(Buffer.from(svg), { fitTo: { mode: "width", value: 1920 } }).render().asPng();
writeFileSync(join(dir, "cover.png"), png);
console.log("cover", png.length);

const wide = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="500" viewBox="0 0 1500 500">
  <image href="data:image/jpeg;base64,${bg}" width="1500" height="844" y="-80" preserveAspectRatio="xMidYMid slice"/>
  <rect width="560" height="500" fill="url(#fade2)"/>
  <defs>
    <linearGradient id="fade2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#080809" stop-opacity="0.94"/>
      <stop offset="100%" stop-color="#080809" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="36" y="36" width="52" height="52" rx="12" fill="#111114" stroke="#3a342c" stroke-width="1.8"/>
  <path d="M48 72 L58 54 L64 62 L76 42 L86 52" fill="none" stroke="#d8d4cc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="102" y="58" font-family="Georgia, Times New Roman, serif" font-size="28" letter-spacing="6" fill="#ecece8">TRADECHARTS</text>
  <text x="102" y="80" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12" letter-spacing="3" fill="#c4a06a">THE MAP IS THE STOP</text>
  <text x="36" y="140" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#ecece8">Elliott. Wyckoff. Your book.</text>
  <text x="36" y="176" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">Validator. Wallet. Hyperliquid. Kill on close.</text>
  ${pill(36, 210, 140, "ELLIOTT")}
  ${pill(188, 210, 140, "WYCKOFF")}
  ${pill(340, 210, 150, "VALIDATOR")}
  ${pill(36, 258, 160, "WALLET BOOK")}
  ${pill(208, 258, 160, "FIGHTING")}
  ${pill(380, 258, 140, "KILL")}
  <text x="36" y="460" font-family="ui-sans-serif, Segoe UI, Helvetica, Arial, sans-serif" font-size="16" fill="#8b8b86">Your wallet is the desk. A validated map can flatten matching perps on a close.</text>
</svg>`;
writeFileSync(join(dir, "cover-wide.svg"), wide);
const widePng = new Resvg(Buffer.from(wide), { fitTo: { mode: "width", value: 1500 } }).render().asPng();
writeFileSync(join(dir, "cover-wide.png"), widePng);
console.log("wide", widePng.length);
