/**
 * Client for the *standardized* bag side of the compose join.
 *
 * We do not write our own balances subgraph. We deploy the community
 * token-balances subgraph (SwaprHQ schema: Account -> Balance -> Token)
 * unchanged to Subgraph Studio and query it here. Composing that Graph
 * product with our maps subgraph is Graph prize #2.
 *
 * Two config modes:
 *  - Studio: `endpoint` is the full public query URL — no key needed.
 *  - Network gateway: `gatewayUrl` + `apiKey` + `subgraphId`.
 * Never commit the key.
 */

import { isBlockedToken, isEthAddress } from "../safety/token";

export type StandardBagToken = {
  symbol: string;
  amount: number;
  contract: string | null;
};

export type GraphConfig = {
  /** Full Subgraph Studio query URL (public, keyless). */
  endpoint?: string;
  /** Graph Network gateway mode (alternative to endpoint). */
  gatewayUrl?: string;
  apiKey?: string;
  subgraphId?: string;
};

export function queryUrl(cfg: GraphConfig): string {
  if (cfg.endpoint) return cfg.endpoint;
  if (cfg.gatewayUrl && cfg.apiKey && cfg.subgraphId) {
    return `${cfg.gatewayUrl.replace(/\/$/, "")}/${cfg.apiKey}/subgraphs/id/${cfg.subgraphId}`;
  }
  throw new Error("GraphConfig needs endpoint, or gatewayUrl + apiKey + subgraphId");
}

const BAG_QUERY = /* GraphQL */ `
  query Bag($wallet: ID!) {
    accounts(where: { id: $wallet }, first: 1) {
      balances(first: 100) {
        token {
          symbol
          id
          decimals
        }
        balance
      }
    }
  }
`;

export async function fetchStandardBag(
  wallet: string,
  cfg: GraphConfig,
): Promise<StandardBagToken[]> {
  if (!isEthAddress(wallet)) throw new Error("bad wallet");
  const res = await fetch(queryUrl(cfg), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: BAG_QUERY,
      variables: { wallet: wallet.toLowerCase() },
    }),
  });
  if (!res.ok) {
    throw new Error(`standard subgraph HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: {
      accounts?: {
        balances?: {
          token: { symbol: string; id: string; decimals: number };
          balance: string;
        }[];
      }[];
    };
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  const rows = json.data?.accounts?.[0]?.balances ?? [];
  return rows
    .map((r) => ({
      symbol: r.token.symbol.toUpperCase(),
      amount: Number(r.balance) / 10 ** (r.token.decimals || 0),
      contract: r.token.id,
    }))
    .filter((t) => t.amount > 0)
    .filter((t) => !isBlockedToken({ symbol: t.symbol, address: t.contract ?? undefined }));
}
