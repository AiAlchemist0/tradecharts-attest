# TradeCharts Attest

**Structure oracle. The map is the stop.**

Open-source claim layer for [TradeCharts](https://tradecharts.app) — ETHOnline 2026 Continuity.

AI proposes market structure. A deterministic validator gates it. Confirm is attested. A **Chainlink** close kills it. **The Graph** serves the claim live. **Ledger** must approve before a flatten agent may move funds. The live desk is the first client — a risk monitor, not a signal bot.

Live Alpha: **https://tradecharts.app**  
This repo: **https://github.com/AiAlchemist0/tradecharts-attest**  
Spec: [docs/SPEC.md](docs/SPEC.md)

No shared git history with the commercial app.

## Alpha (already on the site)

Wallet SIWE. Binance coin-volume tape. Spot + Hyperliquid reads. Elliott / Wyckoff / Fib / internals / events / indicators. Validator is the render gate. Confirm is still private JSON. The book does not flatten.

## Beta (this event)

| Layer | Module | Sponsor (load-bearing) |
| --- | --- | --- |
| **See** | `src/policy/conflict.ts` | **The Graph** — subgraph of maps + `aligned` / `fighting` / `unmapped` / `insolvent`. Continuity AI: risk monitor / portfolio copilot. Live queries, not mocked. |
| **Stand behind** | `src/policy/hash.ts` | **Chainlink** Data Streams / CRE — weekly **close** that invalidates. Commit–reveal hash. |
| **Stop** | `src/policy/kill.ts` | **Ledger** Key Ring / HITL — flatten only, no leakable keys, no open/increase/rotate. |
| **Validator** | `src/validator/` | Same gate as production. Copied, tested. |

## Run

```bash
npm install
npm test
```

## Law

- Not a signal. Not a prediction. A *claim* with a kill.
- Kill is a Chainlink **close**, not a wick.
- Agent may only flatten matching risk, and only after Ledger (or documented fallback).
- Graph is the query surface for other agents.

## Out of scope

Private desk UI, store binaries, billing, copy-trading marketplace, Uniswap LP, Hedera x402 (unless the query API is later metered).
