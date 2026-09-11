/**
 * stdio MCP — one tool, compose_wallet. No SIWE, no HL keys, no desk prompts.
 * Framing: official Content-Length, plus NDJSON lines for a local pipe.
 */

import { composeWallet, type ComposeSource } from "./wallet";

export const COMPOSE_WALLET_TOOL = {
  name: "compose_wallet",
  description:
    "Join a wallet's Graph bag with confirmed TradeCharts maps. Returns conflictOf statuses (aligned, fighting, unmapped, insolvent), cite lines, and the maps Studio block. source=base is keyless Studio. source=aave or both needs GRAPH_API_KEY. Do not invent a status.",
  inputSchema: {
    type: "object",
    properties: {
      address: { type: "string", description: "0x wallet" },
      source: {
        type: "string",
        enum: ["base", "aave", "both"],
        description: "base = Studio bag (default, keyless). aave / both need GRAPH_API_KEY.",
      },
    },
    required: ["address"],
  },
} as const;

export type JsonRpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
};

export async function handleMcpRequest(msg: JsonRpc): Promise<object | null> {
  const method = msg.method ?? "";
  if (!method || method.startsWith("notifications/")) return null;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: msg.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "tradecharts-compose", version: "0.1.0" },
      },
    };
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id: msg.id, result: {} };
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id: msg.id, result: { tools: [COMPOSE_WALLET_TOOL] } };
  }

  if (method === "tools/call") {
    const params = (msg.params ?? {}) as {
      name?: string;
      arguments?: { address?: string; source?: string };
    };
    if (params.name !== "compose_wallet") {
      return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `unknown tool ${params.name ?? ""}` } };
    }
    const raw = params.arguments?.source;
    const source: ComposeSource = raw === "aave" || raw === "both" || raw === "base" ? raw : "base";
    const payload = await composeWallet({ address: params.arguments?.address ?? "", source });
    return {
      jsonrpc: "2.0",
      id: msg.id,
      result: {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
      },
    };
  }

  return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `unknown method ${method}` } };
}

function writeMessage(msg: object, ndjson: boolean): void {
  const json = JSON.stringify(msg);
  if (ndjson) {
    process.stdout.write(`${json}\n`);
    return;
  }
  const body = Buffer.from(json, "utf8");
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

async function dispatch(raw: string, ndjson: boolean): Promise<void> {
  let msg: JsonRpc;
  try {
    msg = JSON.parse(raw) as JsonRpc;
  } catch {
    return;
  }
  const reply = await handleMcpRequest(msg);
  if (reply) writeMessage(reply, ndjson);
}

export async function serveStdio(): Promise<void> {
  let buf = Buffer.alloc(0);
  let ndjson = false;
  for await (const chunk of process.stdin) {
    buf = Buffer.concat([buf, chunk as Buffer]);
    while (buf.length) {
      const headerEnd = buf.indexOf("\r\n\r\n");
      if (headerEnd !== -1) {
        const header = buf.subarray(0, headerEnd).toString("utf8");
        const m = /Content-Length:\s*(\d+)/i.exec(header);
        if (!m) {
          buf = buf.subarray(headerEnd + 4);
          continue;
        }
        const len = Number(m[1]);
        const start = headerEnd + 4;
        if (buf.length < start + len) break;
        const body = buf.subarray(start, start + len).toString("utf8");
        buf = buf.subarray(start + len);
        await dispatch(body, false);
        continue;
      }
      const nl = buf.indexOf(0x0a);
      if (nl === -1) break;
      const line = buf.subarray(0, nl).toString("utf8").replace(/\r$/, "").trim();
      buf = buf.subarray(nl + 1);
      if (!line) continue;
      if (line.startsWith("{")) {
        ndjson = true;
        await dispatch(line, true);
      }
    }
  }
}

const invoked = process.argv[1]?.replace(/\\/g, "/");
if (invoked && (invoked.endsWith("/mcp.ts") || invoked.endsWith("/server.mjs"))) {
  void serveStdio();
}
