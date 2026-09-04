/**
 * Hostile ERC-20 metadata in the standardized bag.
 *
 * Token name / symbol / contract from any subgraph or explorer are
 * attacker-controlled. They must not become a compose row, a map key,
 * or a flatten candidate. Hits are dropped silently — do not log them.
 *
 * SSOT: docs/SECURITY.md
 */

const PHISH_COPY =
  /claim|airdrop|visit|http|www\.|t\.me|discord\.gg|telegram|reward|voucher|free.?mint|connect.?wallet|verify.?wallet|bonus|congratulat|you.?won|until\d|\.com\b|\.io\b|\.xyz\b|\.org\b|\.net\b|\.app\b|\.site\b|\.gift\b|\.cash\b|\.link\b|\.click\b|drain|approve.?all/i;

export const BLOCKED_BASES = new Set([
  "USDTAIRDROP",
  "USDCCLIAIM",
  "ETHCLAIM",
  "VISITETHCLAIM",
]);

/** Confirmed scam contracts, lowercase 0x. Grow this when a hash is known. */
export const BLOCKED_ADDRESSES = new Set<string>([]);

export type TokenHint = { symbol?: string; name?: string; address?: string };

function asciiOnly(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 127) return false;
  }
  return true;
}

function compactBase(symbol: string): string {
  return symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isBlockedToken(input: TokenHint): boolean {
  const symbol = input.symbol?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const addr = (input.address ?? "").trim().toLowerCase();
  if (addr && BLOCKED_ADDRESSES.has(addr)) return true;
  if ((symbol && !asciiOnly(symbol)) || (name && !asciiOnly(name))) return true;
  if (symbol && PHISH_COPY.test(symbol)) return true;
  if (name && PHISH_COPY.test(name)) return true;
  const base = compactBase(symbol);
  if (base && BLOCKED_BASES.has(base)) return true;
  if (base.length > 20) return true;
  return false;
}

export function isEthAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}
