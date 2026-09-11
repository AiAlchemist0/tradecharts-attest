#!/usr/bin/env node
/**
 * Thin bin. Logic lives in src/graph/mcp.ts (compose_wallet).
 *   node mcp/server.mjs
 */
import { register } from "node:module";

try {
  register("tsx/esm", import.meta.url);
} catch (e) {
  console.error("tradecharts-compose: run npm install in the repo root (needs tsx), then: node mcp/server.mjs");
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}

await import("../src/graph/mcp.ts");
