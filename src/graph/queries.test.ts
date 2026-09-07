import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchComposed, fetchMaps } from "./queries";
import { fetchStandardBag, queryUrl } from "./standard";

const STANDARD_URL = "https://api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest";
const MAPS_URL = "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/** Stub global fetch with a URL → body map for GraphQL POSTs. */
function stubFetch(routes: Record<string, unknown>): ReturnType<typeof vi.fn> {
  const mock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    for (const [route, body] of Object.entries(routes)) {
      if (url === route) return jsonResponse(body);
    }
    return jsonResponse({ errors: [{ message: `no route for ${url}` }] });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("queryUrl", () => {
  it("uses the Studio endpoint as-is", () => {
    expect(queryUrl({ endpoint: MAPS_URL })).toBe(MAPS_URL);
  });

  it("builds the Network gateway URL from the trio", () => {
    expect(
      queryUrl({ gatewayUrl: "https://gateway.thegraph.com/", apiKey: "k", subgraphId: "QmX" }),
    ).toBe("https://gateway.thegraph.com/k/subgraphs/id/QmX");
  });

  it("throws when neither mode is configured", () => {
    expect(() => queryUrl({})).toThrow(/endpoint/);
  });
});

describe("fetchStandardBag", () => {
  it("converts raw balances to human amounts and drops zero + phishing tokens", async () => {
    stubFetch({
      [STANDARD_URL]: {
        data: {
          accounts: [
            {
              balances: [
                { token: { symbol: "WETH", id: "0x4200000000000000000000000000000000000006", decimals: 18 }, balance: "1500000000000000000" },
                { token: { symbol: "USDC", id: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6 }, balance: "0" },
                { token: { symbol: "VISITETHCLAIM", id: "0xdead000000000000000000000000000000000001", decimals: 18 }, balance: "5000000000000000000" },
              ],
            },
          ],
        },
      },
    });

    const bag = await fetchStandardBag("0xfA8C53B715755762209De11923fB99BC4607954B", {
      endpoint: STANDARD_URL,
    });

    expect(bag).toEqual([
      {
        symbol: "WETH",
        amount: 1.5,
        contract: "0x4200000000000000000000000000000000000006",
      },
    ]);
  });

  it("returns an empty bag for an account the balances subgraph has not seen", async () => {
    stubFetch({ [STANDARD_URL]: { data: { accounts: [] } } });
    const bag = await fetchStandardBag("0xfA8C53B715755762209De11923fB99BC4607954B", {
      endpoint: STANDARD_URL,
    });
    expect(bag).toEqual([]);
  });
});

describe("fetchMaps", () => {
  it("maps side → bias and keeps kills as numbers", async () => {
    stubFetch({
      [MAPS_URL]: {
        data: {
          maps: [
            { symbol: "ETH", side: "short", longKill: null, shortKill: "2350.5" },
            { symbol: "AERO", side: "weird", longKill: null, shortKill: null },
          ],
        },
      },
    });

    const maps = await fetchMaps("0xfA8C53B715755762209De11923fB99BC4607954B", {
      endpoint: MAPS_URL,
    });

    expect(maps).toEqual([
      { symbol: "ETH", bias: "short", longKill: null, shortKill: 2350.5 },
      { symbol: "AERO", bias: "none", longKill: null, shortKill: null },
    ]);
  });
});

describe("fetchComposed", () => {
  it("joins both Graph products into conflict rows", async () => {
    stubFetch({
      [STANDARD_URL]: {
        data: {
          accounts: [
            {
              balances: [
                { token: { symbol: "WETH", id: "0x4200000000000000000000000000000000000006", decimals: 18 }, balance: "2000000000000000000" },
                { token: { symbol: "AERO", id: "0x940181dd4923bb6afd7b6a0ab3a0d57bbe6095ef", decimals: 18 }, balance: "100000000000000000000" },
              ],
            },
          ],
        },
      },
      [MAPS_URL]: {
        data: {
          maps: [{ symbol: "ETH", side: "short", longKill: null, shortKill: "2350.5" }],
        },
      },
    });

    const rows = await fetchComposed("0xfA8C53B715755762209De11923fB99BC4607954B", {
      standard: { endpoint: STANDARD_URL },
      maps: { endpoint: MAPS_URL },
    });

    const bySymbol = Object.fromEntries(rows.map((r) => [r.symbol, r]));
    expect(bySymbol.ETH.status).toBe("fighting");
    expect(bySymbol.AERO.status).toBe("unmapped");
  });
});
