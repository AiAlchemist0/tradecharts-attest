/**
 * Client for a Messari standardized-schema lending subgraph (Aave V3,
 * Arbitrum) served by The Graph Network — the standardized leg of the compose
 * join. We did not write this subgraph; we consume the shared schema
 * (Account / Position / Market / Token) unchanged.
 *
 * Mapping into compose: LENDER positions are spot (bag side); BORROWER
 * positions are debt, i.e. negative size on the perp side. compose() itself
 * is untouched.
 *
 * Config: Graph Network gateway mode — { gatewayUrl, apiKey, subgraphId }.
 * Never commit the key.
 */

import { isBlockedToken, isEthAddress } from "../safety/token";
import type { PerpRow } from "./compose";
import { queryUrl, type GraphConfig, type StandardBagToken } from "./standard";

export const AAVE_SUBGRAPH_ID = "4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf";

const AAVE_QUERY = /* GraphQL */ `
  query Aave($wallet: ID!) {
    account(id: $wallet) {
      positions(first: 100, where: { blockNumberClosed: null }) {
        side
        balance
        asset {
          symbol
          decimals
          id
        }
        market {
          name
        }
      }
    }
  }
`;

type AavePositionRow = {
  side: string;
  balance: string;
  asset: { symbol: string; decimals: number; id: string };
  market: { name: string };
};

export async function fetchAaveBook(
  wallet: string,
  cfg: GraphConfig,
): Promise<{ bag: StandardBagToken[]; perps: PerpRow[] }> {
  if (!isEthAddress(wallet)) throw new Error("bad wallet");
  const res = await fetch(queryUrl(cfg), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: AAVE_QUERY,
      variables: { wallet: wallet.toLowerCase() },
    }),
  });
  if (!res.ok) throw new Error(`aave subgraph HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: { account?: { positions?: AavePositionRow[] } };
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const bag: StandardBagToken[] = [];
  const perps: PerpRow[] = [];
  for (const p of json.data?.account?.positions ?? []) {
    const symbol = p.asset.symbol.toUpperCase();
    if (isBlockedToken({ symbol, address: p.asset.id })) continue;
    const amount = Number(p.balance) / 10 ** (p.asset.decimals || 0);
    if (amount <= 0) continue;
    if (p.side === "BORROWER") {
      perps.push({ symbol, size: -amount, liq: null });
    } else if (p.side === "LENDER") {
      bag.push({ symbol, amount, contract: p.asset.id });
    }
  }
  return { bag, perps };
}
