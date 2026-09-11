import { afterEach, describe, expect, it, vi } from "vitest";
import { composeWallet, DEFAULT_STUDIO_BAG, DEFAULT_STUDIO_MAPS } from "./wallet";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
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

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.GRAPH_API_KEY;
  delete process.env.BAG_URL;
  delete process.env.MAPS_URL;
});

const WALLET = "0xfA8C53B715755762209De11923fB99BC4607954B";

describe("composeWallet", () => {
  it("returns the Ask/MCP payload with conflictOf status and maps block", async () => {
    stubFetch({
      [DEFAULT_STUDIO_BAG]: {
        data: {
          accounts: [
            {
              balances: [
                {
                  token: { symbol: "WETH", id: "0x4200000000000000000000000000000000000006", decimals: 18 },
                  balance: "2000000000000000000",
                },
              ],
            },
          ],
        },
      },
      [DEFAULT_STUDIO_MAPS]: {
        data: {
          maps: [{ symbol: "ETH", side: "short", longKill: null, shortKill: "4100" }],
          _meta: { block: { number: 12_345_678 } },
        },
      },
    });

    const payload = await composeWallet({ address: WALLET, source: "base" });
    expect(payload.error).toBeNull();
    expect(payload.block).toBe(12_345_678);
    expect(payload.rows[0]).toMatchObject({ symbol: "ETH", status: "fighting", bias: "short" });
    expect(payload.cites[0]).toBe("ETH fighting · confirmed short · spot 2 · Graph maps block 12345678");
    expect(payload.text).toContain(payload.cites[0]);
  });

  it("does not fabricate fighting when Studio fails", async () => {
    const mock = vi.fn(async () => jsonResponse({}, 502));
    vi.stubGlobal("fetch", mock);
    const payload = await composeWallet({ address: WALLET });
    expect(payload.error).toMatch(/HTTP 502/);
    expect(payload.rows).toEqual([]);
    expect(payload.cites).toEqual([]);
    expect(payload.text).not.toMatch(/ETH fighting/);
  });

  it("rejects aave/both without GRAPH_API_KEY", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const payload = await composeWallet({ address: WALLET, source: "aave" });
    expect(payload.error).toMatch(/GRAPH_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a bad address without calling Studio", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const payload = await composeWallet({ address: "not-a-wallet" });
    expect(payload.error).toBe("bad wallet");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
