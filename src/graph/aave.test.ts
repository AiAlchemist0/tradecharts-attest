import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchAaveBook } from "./aave";
import { fetchComposed } from "./queries";

const AAVE_URL =
  "https://gateway.thegraph.com/api/test-key/subgraphs/id/4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf";
const MAPS_URL = "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function stubFetch(routes: Record<string, unknown>): void {
  const mock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    for (const [route, body] of Object.entries(routes)) {
      if (url === route) return jsonResponse(body);
    }
    return jsonResponse({ errors: [{ message: `no route for ${url}` }] });
  });
  vi.stubGlobal("fetch", mock);
}

const AAVE_CFG = {
  gatewayUrl: "https://gateway.thegraph.com/api",
  apiKey: "test-key",
  subgraphId: "4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchAaveBook", () => {
  it("maps LENDER to bag and BORROWER to negative perp, converting decimals", async () => {
    stubFetch({
      [AAVE_URL]: {
        data: {
          account: {
            positions: [
              { side: "LENDER", balance: "1500000000000000000", asset: { symbol: "WETH", decimals: 18, id: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" }, market: { name: "Aave Arbitrum WETH" } },
              { side: "BORROWER", balance: "2921223401", asset: { symbol: "USDC", decimals: 6, id: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" }, market: { name: "Aave Arbitrum USDC" } },
              { side: "LENDER", balance: "0", asset: { symbol: "ARB", decimals: 18, id: "0x912ce59144191c1204e64559fe8253a0e49e6548" }, market: { name: "Aave Arbitrum ARB" } },
              { side: "LENDER", balance: "5000000000000000000", asset: { symbol: "VISITETHCLAIM", decimals: 18, id: "0xdead000000000000000000000000000000000001" }, market: { name: "scam" } },
            ],
          },
        },
      },
    });

    const book = await fetchAaveBook("0x00000001fd5f90b69bc5d650985ea1bfe5fea7ac", AAVE_CFG);

    expect(book.bag).toEqual([
      { symbol: "WETH", amount: 1.5, contract: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" },
    ]);
    expect(book.perps).toEqual([{ symbol: "USDC", size: -2921.223401, liq: null }]);
  });

  it("returns empty book for an account the lending subgraph has not seen", async () => {
    stubFetch({ [AAVE_URL]: { data: { account: null } } });
    const book = await fetchAaveBook("0xfA8C53B715755762209De11923fB99BC4607954B", AAVE_CFG);
    expect(book).toEqual({ bag: [], perps: [] });
  });
});

describe("fetchComposed with the Aave source", () => {
  it("joins Messari positions with our maps — borrowed against a confirmed map is fighting", async () => {
    stubFetch({
      [AAVE_URL]: {
        data: {
          account: {
            positions: [
              { side: "BORROWER", balance: "2921223401", asset: { symbol: "USDC", decimals: 6, id: "0xaf88d065e77c8cc2239327c5edb3a432268e5831" }, market: { name: "Aave Arbitrum USDC" } },
            ],
          },
        },
      },
      [MAPS_URL]: {
        data: {
          maps: [{ symbol: "USDC", side: "long", longKill: null, shortKill: null }],
        },
      },
    });

    const rows = await fetchComposed("0x00000001fd5f90b69bc5d650985ea1bfe5fea7ac", {
      aave: AAVE_CFG,
      maps: { endpoint: MAPS_URL },
    });

    // Borrowed USDC = short exposure; a confirmed Long map on it is fighting.
    expect(rows.find((r) => r.symbol === "USDC")?.status).toBe("fighting");
  });
});
