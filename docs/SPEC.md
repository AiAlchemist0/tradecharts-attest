# Spec

ETHOnline 2026 Continuity. Ships onto https://tradecharts.app as crypto Beta.

**Problem:** the chart, the wallet, and the perp stop still live in three places. Calls are screenshots. Hyperliquid stops fire on mark and wicks — the same print Wyckoff calls a spring or an upthrust (a stop-hunt, not a trend change). Nothing answers “is this book fighting its own map?” We do not claim we can prove a print was spoofed. We claim invalidation is a **weekly close**, and the bag next to the map must show aligned / fighting / unmapped / insolvent.

**Segment:** wallet-native traders with a thesis *and* a book. TradingView / Binance / Hyperliquid / DeBank each own one pane. The join is the product. Comparison: [README](../README.md#where-this-sits).

Partners: **The Graph**, **Chainlink**, **Ledger** (Continuity prizes).

## Claim

A confirmed map: `symbol`, `timeframe`, sorted pivots, `longKill`, `shortKill`, `barTime`, wallet, `positioned` | `opinion`. Hash: `mapHash` in `src/policy/hash.ts`.

Conflict (`src/policy/conflict.ts`): `unmapped` | `aligned` | `fighting` | `insolvent` (liq inside the still-valid map).

Kill (`src/policy/kill.ts`): flatten only on a **close** through the kill, and only if net is still on that side. Flatten only — no open, add, or rotate.

Hostile ERC-20 names in the standardized bag are dropped before compose (`src/safety/token.ts`). They must not become a flatten `symbol`. Secrets stay out of git — [docs/SECURITY.md](SECURITY.md).

## Event wiring

1. **The Graph** — two products, joined in `src/graph/compose.ts`: an ERC-20 **balances subgraph on Base** (`subgraphs/bag/`, allowlisted tokens, balances from Transfer events in the indexed window) ⋈ our **maps subgraph on Base Sepolia** (`subgraph/`, confirmed maps as EAS attestations). The join lives in `compose.ts`; run it in `demo/` with any address. A Messari **standardized-schema** join (wallet lending positions) is the next leg.
2. **Chainlink** — CRE Confidential Workflow (`handlerInTee`) is flatten; same run writes onchain.
3. **Ledger** — device approval before flatten.

## Event vs Alpha

**Pre-existing (not hackathon work):** the commercial desk at https://tradecharts.app — Vite/React UI, Binance tape, SIWE login, wallet/Hyperliquid reads, the deterministic Elliott validator (`src/validator/`, copied here with tests), and Confirm as a private save.

**This event:** both subgraphs, the compose join, the EAS-attested Map records, `demo/`, and the live Studio consume. Chainlink CRE and the Ledger gate are in progress this week. Nothing in this repo existed before ETHOnline 2026.

## Run

See [README](../README.md#run) — offline tests, the `LIVE_GRAPH=1` live compose check, the `demo/` page, and subgraph deploy scripts.

## Desk (this event)

Watchlist is the wallet. Liq and kill on one pane. Propose → validator → Confirm → Graph row → Chainlink close → Ledger prompt → flatten. Solo book on the live site. Other tools can query the same record later.
