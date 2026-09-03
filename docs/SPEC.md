# Spec — structure oracle

ETHOnline 2026 Continuity. Ships onto https://tradecharts.app as crypto Beta.

Prize boxes: **The Graph AI Continuity**, **Ledger Continuity**, **Chainlink Continuity**.

## Schema (one claim)

A confirmed map is a claim: `symbol`, `timeframe`, sorted pivots, `longKill`, `shortKill`, `barTime`, wallet, `positioned` | `opinion`. Hash: `mapHash` in `src/policy/hash.ts`.

Conflict for a book row (`src/policy/conflict.ts`): `unmapped` | `aligned` | `fighting` | `insolvent` (liq inside the still-valid map).

Kill (`src/policy/kill.ts`): flatten only on a **close** through the kill, and only if net is still on that side. `mayAgent("flatten")` only.

## Sponsor wiring (event work)

1. **The Graph** — subgraph of claims + conflict. Consume live (Studio / Market). Desk and any other agent query the same data. Mocked data does not qualify.
2. **Chainlink** — Data Streams / CRE provide the weekly close that sets `invalidated`. Not a homemade candle.
3. **Ledger** — Key Ring / HITL before flatten. Agent does not hold a leakable venue key.

## Desk (first client)

Watchlist is the wallet. Liq and kill on one pane. Propose → validator → Confirm → Graph row → Chainlink close → Ledger prompt → flatten.
