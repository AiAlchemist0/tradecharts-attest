# Spec

ETHOnline 2026 Continuity. Ships onto https://tradecharts.app as crypto Beta.

**Problem:** the chart, the wallet, and the perp stop still live in three places. Calls are screenshots, Hyperliquid stops fire on mark/wicks, and nothing can answer “is this book fighting its own map?”

Partners: **The Graph**, **Chainlink**, **Ledger** (Continuity prizes).

## Claim

A confirmed map: `symbol`, `timeframe`, sorted pivots, `longKill`, `shortKill`, `barTime`, wallet, `positioned` | `opinion`. Hash: `mapHash` in `src/policy/hash.ts`.

Conflict (`src/policy/conflict.ts`): `unmapped` | `aligned` | `fighting` | `insolvent` (liq inside the still-valid map).

Kill (`src/policy/kill.ts`): flatten only on a **close** through the kill, and only if net is still on that side. Flatten only — no open, add, or rotate.

## Event wiring

1. **The Graph** — two live products: a *standardized* token/balance subgraph (bag) **and** our maps subgraph. `compose.ts` joins them. Not one homemade subgraph.
2. **Chainlink** — CRE Confidential Workflow (`handlerInTee`) is flatten; same run writes onchain.
3. **Ledger** — device approval before flatten.

## Desk (this event)

Watchlist is the wallet. Liq and kill on one pane. Propose → validator → Confirm → Graph row → Chainlink close → Ledger prompt → flatten. Solo book on the live site. Other tools can query the same record later.
