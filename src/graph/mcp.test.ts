import { describe, expect, it } from "vitest";
import { COMPOSE_WALLET_TOOL, handleMcpRequest } from "./mcp";
import { FIGHTING_ASK } from "./prompt";

describe("MCP compose_wallet", () => {
  it("lists the one tool", async () => {
    const res = (await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" })) as {
      result: { tools: { name: string }[] };
    };
    expect(res.result.tools).toHaveLength(1);
    expect(res.result.tools[0]?.name).toBe("compose_wallet");
    expect(COMPOSE_WALLET_TOOL.inputSchema.required).toContain("address");
  });

  it("answers initialize without calling Graph", async () => {
    const res = (await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize" })) as {
      result: { serverInfo: { name: string } };
    };
    expect(res.result.serverInfo.name).toBe("tradecharts-compose");
  });

  it("ignores notifications", async () => {
    expect(await handleMcpRequest({ method: "notifications/initialized" })).toBeNull();
  });

  it("refuses an unknown tool", async () => {
    const res = (await handleMcpRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "run_graphql", arguments: { query: "{ _meta { block { number } } }" } },
    })) as { error: { message: string } };
    expect(res.error.message).toMatch(/unknown tool/);
  });

  it("does not treat the desk starter sentence as a second tool", () => {
    expect(FIGHTING_ASK).toBe("Is my bag fighting this map?");
    expect(COMPOSE_WALLET_TOOL.name).toBe("compose_wallet");
  });

  it("compose_wallet on a bad address returns an error payload, not a guess", async () => {
    const res = (await handleMcpRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "compose_wallet", arguments: { address: "nope" } },
    })) as { result: { structuredContent: { error: string; cites: string[] } } };
    expect(res.result.structuredContent.error).toBe("bad wallet");
    expect(res.result.structuredContent.cites).toEqual([]);
  });
});
