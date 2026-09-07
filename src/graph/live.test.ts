/**
 * The one live Studio call — proof the join reads real Graph products, not
 * fixtures. Skipped by default so `npm test` stays offline; run with:
 *
 *   LIVE_GRAPH=1 npm test
 *
 * Endpoints can be overridden with BAG_URL / MAPS_URL.
 */
import { describe, expect, it } from "vitest";
import { fetchComposed } from "./queries";
import { AAVE_SUBGRAPH_ID } from "./aave";

const LIVE = !!process.env.LIVE_GRAPH;
const BAG =
  process.env.BAG_URL ??
  "https://api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest";
const MAPS =
  process.env.MAPS_URL ??
  "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";
const WALLET = process.env.LIVE_WALLET ?? "0xfA8C53B715755762209De11923fB99BC4607954B";

/**
 * The Messari standardized-schema leg, live: AAVE_GRAPH=1 GRAPH_API_KEY=<key>
 * npm test — joins a real lending book (open LENDER/BORROWER positions on
 * Arbitrum) with our maps through the Network gateway.
 */
const AAVE_LIVE = !!process.env.AAVE_GRAPH && !!process.env.GRAPH_API_KEY;

describe.skipIf(!AAVE_LIVE)("live Messari Aave join", () => {
  it("joins a real lending book with our maps", async () => {
    const wallet = process.env.AAVE_WALLET ?? "0x00000001fd5f90b69bc5d650985ea1bfe5fea7ac";
    const rows = await fetchComposed(wallet, {
      aave: {
        gatewayUrl: "https://gateway.thegraph.com/api",
        apiKey: process.env.GRAPH_API_KEY!,
        subgraphId: AAVE_SUBGRAPH_ID,
      },
      maps: { endpoint: MAPS },
    });
    console.log(
      rows
        .map((r) => `${r.symbol.padEnd(8)} spot ${r.spot}  perp ${r.perp}  ${r.status}`)
        .join("\n"),
    );
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((r) => r.perp < 0)).toBe(true); // real borrowed debt on the book
  });
});

describe.skipIf(!LIVE)("live compose (two Studio subgraphs)", () => {
  it("joins the standardized bag with our maps", async () => {
    const rows = await fetchComposed(WALLET, {
      standard: { endpoint: BAG },
      maps: { endpoint: MAPS },
    });
    console.log(
      rows
        .map((r) => `${r.symbol.padEnd(8)} bag ${r.spot}  perp ${r.perp}  ${r.status}`)
        .join("\n"),
    );
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.every((r) => ["aligned", "fighting", "unmapped", "insolvent"].includes(r.status))).toBe(
      true,
    );
  });
});
