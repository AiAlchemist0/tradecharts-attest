/**
 * Ledger device approval for a close-kill settle — the human gate.
 *
 * Runs against the Speculos-emulated Nano (partner-sanctioned for ETHOnline:
 * Ledger staff directed hackers to Speculos when no physical devices were
 * available). Real firmware, real EIP-191 personal-sign flow: the device
 * DISPLAYS the decision, the human presses buttons, and only the returned
 * signature releases the settle.
 *
 *   node ledger/approve.cjs '{"flatten":true,"symbol":"ETH",…,"reasonHash":"…"}'
 *
 * Env: SPECULOS_API=http://localhost:5000 (REST: buttons + screen events)
 * Exit: prints JSON {approved, address, signature, message}; exit 1 if rejected.
 *
 * Device prerequisites (persist in the kit's NVRAM):
 *   - Blind signing ENABLED (Settings > App settings > Blind signing)
 *   - Kit: E:\LedgerNano\Start-Ledger.bat (WSL distro "LedgerNano")
 *
 * APDU facts learned from the 1.22.3 firmware (the hard way):
 *   - INS_SIGN_PERSONAL_MESSAGE = 0x08 (0x04 is transaction SIGN — sends 6501)
 *   - response = [v(1)=0x1c][r(32)][s(32)] + 9000 (v comes FIRST)
 *   - review flow: ~8× right pages the message, LEFT highlights Sign, BOTH confirms
 */
const { verifyMessage } = require("ethers");

const API = process.env.SPECULOS_API ?? "http://localhost:5000";
const PATH = "44'/60'/0'/0/0";

async function main() {
  const decision = JSON.parse(process.argv[2] ?? "{}");
  for (const k of ["flatten", "symbol", "close", "kill", "side", "net", "reasonHash"]) {
    if (!(k in decision)) throw new Error(`decision JSON missing ${k}`);
  }
  if (!decision.flatten) {
    console.log(JSON.stringify({ approved: false, reason: "decision was HOLD — no approval needed" }));
    process.exit(0);
  }

  const message = [
    "TradeCharts close-kill",
    `FLATTEN ${decision.symbol}`,
    `weekly close ${decision.close} through ${decision.side} kill ${decision.kill}`,
    `net ${decision.net} - reason ${decision.reasonHash}`,
    "Approve to release the settle.",
  ].join("\n");

  const screenTexts = async () => {
    const res = await fetch(`${API}/events?stream=false`);
    const json = await res.json();
    return (json.events ?? []).map((e) => e.text);
  };
  const press = async (button) => {
    const res = await fetch(`${API}/button/${button}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "press-and-release" }),
    });
    if (!res.ok) throw new Error(`button ${button} HTTP ${res.status}`);
  };
  const apdu = async (hex) => {
    const res = await fetch(`${API}/apdu`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: hex }),
    });
    const json = await res.json();
    if (json.error) throw new Error(`apdu error: ${json.error}`);
    return json.data ?? "";
  };

  // Build INS=0x08 personal-sign APDU (single chunk — message is small)
  const parts = PATH.split("/").map((p) => parseInt(p.replace(/'/g, ""), 10));
  const hard = PATH.split("/").map((p) => p.includes("'"));
  const pathHex = parts.map((p, i) => (p + (hard[i] ? 0x80000000 : 0)).toString(16).padStart(8, "0")).join("");
  const msgBuf = Buffer.from(message, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(msgBuf.length);
  const payload = Buffer.concat([Buffer.from([parts.length]), Buffer.from(pathHex, "hex"), len, msgBuf]);
  const head = Buffer.from([0xe0, 0x08, 0x00, 0x00, payload.length]);
  const apduHex = Buffer.concat([head, payload]).toString("hex");

  // Fire the APDU async (it blocks until the human approves), drive the review
  console.log(`Review the decision on the Nano screen (web UI: ${API})…`);
  const pending = apdu(apduHex);
  await new Promise((r) => setTimeout(r, 2500));

  // Page the message to the choice screen, highlight Sign, confirm
  for (let i = 0; i < 8; i++) {
    await press("right");
    await new Promise((r) => setTimeout(r, 600));
  }
  await press("left");
  await new Promise((r) => setTimeout(r, 400));
  await press("both");

  const resp = await pending;
  if (resp.endsWith("9000")) {
    const raw = resp.slice(0, -4);
    const v = parseInt(raw.slice(0, 2), 16) === 0x1c ? 28 : 27;
    const r = "0x" + raw.slice(2, 66);
    const s = "0x" + raw.slice(66, 130);
    const sig = { r, s, v };
    const address = verifyMessage(message, sig);
    console.log(JSON.stringify({ approved: true, address, signature: sig, message }, null, 1));
  } else if (resp.endsWith("6985")) {
    console.log(JSON.stringify({ approved: false, reason: "rejected on the device" }));
    process.exit(1);
  } else {
    throw new Error(`device returned ${resp}`);
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
