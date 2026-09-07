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

const LIVE = !!process.env.LIVE_GRAPH;
const BAG =
  process.env.BAG_URL ??
  "https://api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest";
const MAPS =
  process.env.MAPS_URL ??
  "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";
const WALLET = process.env.LIVE_WALLET ?? "0xfA8C53B715755762209De11923fB99BC4607954B";

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
