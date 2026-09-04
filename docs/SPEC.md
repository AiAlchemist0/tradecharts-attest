# Spec

ETHOnline 2026 Continuity. Ships onto https://tradecharts.app as crypto Beta.

**Problem:** the chart, the wallet, and the perp stop still live in three places. Calls are screenshots. Hyperliquid stops fire on mark and wicks — the same print Wyckoff calls a spring or an upthrust (a stop-hunt, not a trend change). Nothing answers “is this book fighting its own map?” We do not claim we can prove a print was spoofed. We claim invalidation is a **weekly close**, and the bag next to the map must show aligned / fighting / unmapped / insolvent.

Partners: **The Graph**, **Chainlink**, **Ledger** (Continuity prizes).

## Claim

A confirmed map: `symbol`, `timeframe`, sorted pivots, `longKill`, `shortKill`, `barTime`, wallet, `positioned` | `opinion`. Hash: `mapHash` in `src/policy/hash.ts`.

Conflict (`src/policy/conflict.ts`): `unmapped` | `aligned` | `fighting` | `insolvent` (liq inside the still-valid map).

Kill (`src/policy/kill.ts`): flatten only on a **close** through the kill, and only if net is still on that side. Flatten only — no open, add, or rotate.

Hostile ERC-20 names in the standardized bag are dropped before compose (`src/safety/token.ts`). They must not become a flatten `symbol`. Secrets stay out of git — [docs/SECURITY.md](SECURITY.md).

## Event wiring

1. **The Graph** — two live products: a *standardized* token/balance subgraph (bag) **and** our maps subgraph. `compose.ts` joins them. Not one homemade subgraph.
2. **Chainlink** — CRE Confidential Workflow (`handlerInTee`) is flatten; same run writes onchain.
3. **Ledger** — device approval before flatten.

## Desk (this event)

Watchlist is the wallet. Liq and kill on one pane. Propose → validator → Confirm → Graph row → Chainlink close → Ledger prompt → flatten. Solo book on the live site. Other tools can query the same record later.
