/**
 * One-liner for judges / the video:
 *   npm run compose -- 0x…
 */

import { composeWallet, type ComposeSource } from "./wallet";

const address = process.argv[2] ?? "";
const raw = process.argv[3];
const source: ComposeSource = raw === "aave" || raw === "both" || raw === "base" ? raw : "base";

if (!address) {
  console.error("usage: npm run compose -- <0xaddress> [base|aave|both]");
  process.exit(1);
}

const payload = await composeWallet({ address, source });
console.log(JSON.stringify(payload, null, 2));
if (payload.error) process.exit(2);
