/**
 * compose_wallet — the Graph tooling entry (MCP / CLI / Ask payload).
 * Status is conflictOf only. Do not relabel. Never log GRAPH_API_KEY.
 */

import { isEthAddress } from "../safety/token";
import { AAVE_SUBGRAPH_ID } from "./aave";
import { composeAskPayload, type ComposeAskPayload } from "./prompt";
import { fetchComposedLive, type ComposeOpts } from "./queries";

export const DEFAULT_STUDIO_BAG =
  "https://api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest";
export const DEFAULT_STUDIO_MAPS =
  "https://api.studio.thegraph.com/query/1758683/trade-charts/version/latest";

export function studioBagUrl(): string {
  return process.env.BAG_URL ?? DEFAULT_STUDIO_BAG;
}

export function studioMapsUrl(): string {
  return process.env.MAPS_URL ?? DEFAULT_STUDIO_MAPS;
}

export type ComposeSource = "base" | "aave" | "both";

export type ComposeWalletInput = {
  address: string;
  source?: ComposeSource;
};

function sourceOf(raw: string | undefined): ComposeSource {
  if (raw === "aave" || raw === "both" || raw === "base") return raw;
  return "base";
}

/**
 * Keyless `base` = Studio bag ⋈ Studio maps.
 * `aave` / `both` need GRAPH_API_KEY in the environment — never committed.
 */
export async function composeWallet(input: ComposeWalletInput): Promise<ComposeAskPayload> {
  const address = (input.address ?? "").trim();
  const source = sourceOf(input.source);
  if (!isEthAddress(address)) {
    return composeAskPayload([], { wallet: address, error: "bad wallet" });
  }

  const key = process.env.GRAPH_API_KEY;
  if ((source === "aave" || source === "both") && !key) {
    return composeAskPayload([], {
      wallet: address.toLowerCase(),
      error: "GRAPH_API_KEY required for source=aave|both",
    });
  }

  const opts: ComposeOpts = { maps: { endpoint: studioMapsUrl() } };
  if (source === "base" || source === "both") opts.standard = { endpoint: studioBagUrl() };
  if (source === "aave" || source === "both") {
    opts.aave = {
      gatewayUrl: "https://gateway.thegraph.com/api",
      apiKey: key,
      subgraphId: AAVE_SUBGRAPH_ID,
    };
  }

  try {
    const { rows, block } = await fetchComposedLive(address, opts);
    return composeAskPayload(rows, { wallet: address.toLowerCase(), block });
  } catch (e) {
    return composeAskPayload([], {
      wallet: address.toLowerCase(),
      error: e instanceof Error ? e.message : "compose failed",
    });
  }
}
