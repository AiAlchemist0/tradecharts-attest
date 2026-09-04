/**
 * Client for a *standardized* token/balance subgraph (Messari or The Graph
 * published token standard). This is Graph prize #2 — we do not write our own
 * balances subgraph.
 *
 * Set GRAPH_STANDARD_SUBGRAPH_ID to a live Studio / Market id.
 */

export type StandardBagToken = {
  symbol: string;
  amount: number;
  contract: string | null;
};

export type GraphConfig = {
  gatewayUrl: string;
  apiKey: string;
  subgraphId: string;
};

const BAG_QUERY = /* GraphQL */ `
  query Bag($wallet: String!) {
    tokenBalances(first: 100, where: { account: $wallet }) {
      token { symbol id }
      value
    }
  }
`;

export async function fetchStandardBag(
  wallet: string,
  cfg: GraphConfig,
): Promise<StandardBagToken[]> {
  const url = `${cfg.gatewayUrl.replace(/\/$/, "")}/${cfg.apiKey}/subgraphs/id/${cfg.subgraphId}`;
  const res = await fetch(url, {
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
      tokenBalances?: { token: { symbol: string; id: string }; value: string }[];
    };
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  const rows = json.data?.tokenBalances ?? [];
  return rows.map((r) => ({
    symbol: r.token.symbol.toUpperCase(),
    amount: Number(r.value) || 0,
    contract: r.token.id,
  }));
}
