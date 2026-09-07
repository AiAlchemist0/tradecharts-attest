import { isEthAddress } from "../safety/token";
import { compose, type ComposedRow, type MapRow, type PerpRow } from "./compose";
import { fetchStandardBag, queryUrl, type GraphConfig } from "./standard";

export type MapsConfig = GraphConfig;

const MAPS_QUERY = /* GraphQL */ `
  query Maps($wallet: Bytes!) {
    maps(where: { wallet: $wallet }, first: 100, orderBy: createdAt, orderDirection: desc) {
      symbol
      side
      longKill
      shortKill
    }
  }
`;

function biasFromSide(side: string): MapRow["bias"] {
  const s = side.toLowerCase();
  if (s === "long" || s === "short" || s === "both") return s;
  return "none";
}

export async function fetchMaps(wallet: string, cfg: MapsConfig): Promise<MapRow[]> {
  if (!isEthAddress(wallet)) throw new Error("bad wallet");
  const res = await fetch(queryUrl(cfg), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: MAPS_QUERY,
      variables: { wallet: wallet.toLowerCase() },
    }),
  });
  if (!res.ok) throw new Error(`maps subgraph HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      maps?: { symbol: string; side: string; longKill: string | null; shortKill: string | null }[];
    };
  };
  return (json.data?.maps ?? []).map((m) => ({
    symbol: m.symbol,
    bias: biasFromSide(m.side),
    longKill: m.longKill == null ? null : Number(m.longKill),
    shortKill: m.shortKill == null ? null : Number(m.shortKill),
  }));
}

/** Live join: standardized bag ⋈ our maps. Two Graph products, two endpoints. */
export async function fetchComposed(
  wallet: string,
  opts: { standard: GraphConfig; maps: MapsConfig; perps?: PerpRow[] },
): Promise<ComposedRow[]> {
  const [bag, maps] = await Promise.all([
    fetchStandardBag(wallet, opts.standard),
    fetchMaps(wallet, opts.maps),
  ]);
  return compose({ bag, maps, perps: opts.perps });
}
