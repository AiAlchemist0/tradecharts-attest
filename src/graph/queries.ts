import { isEthAddress } from "../safety/token";
import { compose, type ComposedRow, type MapRow, type PerpRow } from "./compose";
import { fetchAaveBook } from "./aave";
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
    _meta {
      block {
        number
      }
    }
  }
`;

export type MapsFetch = {
  maps: MapRow[];
  block: number | null;
};

function biasFromSide(side: string): MapRow["bias"] {
  const s = side.toLowerCase();
  if (s === "long" || s === "short" || s === "both") return s;
  return "none";
}

export async function fetchMapsMeta(wallet: string, cfg: MapsConfig): Promise<MapsFetch> {
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
      _meta?: { block?: { number: number } };
    };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "maps error");
  return {
    maps: (json.data?.maps ?? []).map((m) => ({
      symbol: m.symbol,
      bias: biasFromSide(m.side),
      longKill: m.longKill == null ? null : Number(m.longKill),
      shortKill: m.shortKill == null ? null : Number(m.shortKill),
    })),
    block: json.data?._meta?.block?.number ?? null,
  };
}

export async function fetchMaps(wallet: string, cfg: MapsConfig): Promise<MapRow[]> {
  return (await fetchMapsMeta(wallet, cfg)).maps;
}

/**
 * Live join: bag ⋈ our maps. Two Graph products, two endpoints — the bag is
 * either our Base balances subgraph (`standard`), a Messari standardized
 * lending subgraph (`aave`), or both merged. Perp rows (HL reads or Aave
 * borrows) join the perp side.
 */
export type ComposeOpts = {
  standard?: GraphConfig;
  aave?: GraphConfig;
  maps: MapsConfig;
  perps?: PerpRow[];
};

export async function fetchComposedLive(
  wallet: string,
  opts: ComposeOpts,
): Promise<{ rows: ComposedRow[]; block: number | null }> {
  const sources: Promise<{ bag: import("./standard").StandardBagToken[]; perps?: PerpRow[] }>[] = [];
  if (opts.standard) sources.push(fetchStandardBag(wallet, opts.standard).then((bag) => ({ bag })));
  if (opts.aave) sources.push(fetchAaveBook(wallet, opts.aave));
  if (sources.length === 0) throw new Error("fetchComposed needs a bag source: standard or aave");

  const [results, meta] = await Promise.all([Promise.all(sources), fetchMapsMeta(wallet, opts.maps)]);
  const bag = results.flatMap((r) => r.bag);
  const extraPerps = results.flatMap((r) => r.perps ?? []);
  return {
    rows: compose({ bag, maps: meta.maps, perps: [...(opts.perps ?? []), ...extraPerps] }),
    block: meta.block,
  };
}

export async function fetchComposed(wallet: string, opts: ComposeOpts): Promise<ComposedRow[]> {
  return (await fetchComposedLive(wallet, opts)).rows;
}
