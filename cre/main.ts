/**
 * TradeCharts close-kill — a Chainlink CRE Confidential Workflow.
 *
 * Every week at the close, inside the TEE (handlerInTee):
 *   1. load the PRIVATE kill policy from secrets (map side, kill level, net)
 *   2. fetch the decision bar's CLOSE (mock server in simulate, venue in prod)
 *   3. run the same deterministic killAction as the desk (../src/policy/kill.ts)
 * What leaves the TEE: { flatten, symbol, close, kill, side, net, reasonHash }.
 * A wick never fires it — only a close through the kill, and only if the book
 * is still on that side. The agent may flatten only; it can never open risk.
 *
 * The decision is then written onchain (KillSettled, Base Sepolia) — see
 * settle.mjs and README for the write path.
 */

import {
  CronCapability,
  HTTPClient,
  Runner,
  handlerInTee,
  type TeeRuntime,
  type Workflow,
} from "@chainlink/cre-sdk";

import { killAction, type KillPrint } from "../src/policy/kill";

export type Config = {
  schedule: string;
  symbol: string;
  close_url: string;
  secrets_ids: {
    map_side_secret_id: string;
    kill_secret_id: string;
    net_secret_id: string;
  };
};

export type CloseKillDecision = {
  flatten: boolean;
  symbol: string;
  close: number;
  kill: number;
  side: "long" | "short";
  net: number;
  reasonHash: string;
};

const decodeBody = (raw: Uint8Array): string => new TextDecoder().decode(raw);

/** Pure decision — exported for tests; the TEE handler is a thin wrapper.
 *  (Arrow consts, not `export function` — Javy rejects exported function
 *  declarations with parameters when compiling to WASM.) */
export const decide = (print: KillPrint, symbol: string): CloseKillDecision => {
  const action = killAction(print);
  const reason = `close ${print.close} ${action === "flatten" ? "printed through" : "did not print through"} the ${print.side} kill ${print.kill} (net ${print.net})`;
  return {
    flatten: action === "flatten",
    symbol,
    close: print.close,
    kill: print.kill,
    side: print.side,
    net: print.net,
    reasonHash: hashReason(reason),
  };
};

/** Deterministic FNV-1a — stable across runs, enough for the onchain record. */
export const hashReason = (reason: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < reason.length; i++) {
    h ^= reason.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

function parseCloseFromKlines(body: unknown): number {
  // Binance klines: [[openTime, open, high, low, CLOSE, ...]]
  const rows = Array.isArray(body) ? body : [];
  const first = rows[0] as unknown[] | undefined;
  if (first && typeof first[4] === "string") return Number(first[4]);
  throw new Error(`unexpected close payload: ${JSON.stringify(body).slice(0, 120)}`);
}

export const onCronTrigger = async (runtime: TeeRuntime<Config>): Promise<string> => {
  const { symbol, close_url, secrets_ids } = runtime.config;

  const secrets = runtime
    .getSecrets([
      { id: secrets_ids.map_side_secret_id },
      { id: secrets_ids.kill_secret_id },
      { id: secrets_ids.net_secret_id },
    ])
    .result();

  const side = secrets[secrets_ids.map_side_secret_id].value === "short" ? "short" : "long";
  const kill = Number(secrets[secrets_ids.kill_secret_id].value);
  const net = Number(secrets[secrets_ids.net_secret_id].value);
  if (!Number.isFinite(kill) || !Number.isFinite(net)) {
    throw new Error("kill and net secrets must be finite numbers");
  }
  runtime.log("close-kill-secrets-ok");

  const client = new HTTPClient();
  const response = client
    .sendRequest(runtime, { url: close_url, method: "GET", headers: {} })
    .result();
  const raw = decodeBody(response.body);
  if (response.statusCode >= 400) {
    throw new Error(`close fetch failed status=${response.statusCode} body=${raw}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`close fetch returned invalid json: ${raw.slice(0, 120)}`);
  }
  const close =
    typeof parsed === "object" && parsed !== null && "close" in parsed
      ? Number((parsed as { close: unknown }).close)
      : parseCloseFromKlines(parsed);
  if (!Number.isFinite(close)) throw new Error(`no finite close in payload: ${raw.slice(0, 120)}`);

  const decision = decide({ side, kill, close, net }, symbol);
  runtime.log(`close-kill-decision flatten=${decision.flatten} close=${close} kill=${kill}`);

  return JSON.stringify(decision);
};

export const initWorkflow = (config: Config): Workflow<Config> => {
  if (!config.schedule || !config.symbol || !config.close_url || !config.secrets_ids) {
    throw new Error("config requires schedule, symbol, close_url, and secrets_ids");
  }
  const cron = new CronCapability();
  return [handlerInTee(cron.trigger({ schedule: config.schedule }), onCronTrigger, {})];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
