# Spec

ETHOnline 2026 Continuity. Ships onto https://tradecharts.app as crypto Beta.

**Problem:** the chart, the wallet, and the perp stop still live in three places. Calls are screenshots. Hyperliquid stops fire on mark and wicks — the same print Wyckoff calls a spring or an upthrust (a stop-hunt, not a trend change). Nothing answers “is this book fighting its own map?” We do not claim we can prove a print was spoofed. We claim invalidation is a **weekly close**, and the bag next to the map must show aligned / fighting / unmapped / insolvent.

**Segment:** wallet-native traders with a thesis *and* a book. TradingView / Binance / Hyperliquid / DeBank each own one pane. The join is the product. Comparison: [README](../README.md#where-this-sits).

Partners: **The Graph**, **Chainlink**, **World** (Continuity prizes).

## Claim

A confirmed map: `symbol`, `timeframe`, sorted pivots, `longKill`, `shortKill`, `barTime`, wallet, `positioned` | `opinion`. Hash: `mapHash` in `src/policy/hash.ts`.

Conflict (`src/policy/conflict.ts`): `unmapped` | `aligned` | `fighting` | `insolvent` (liq inside the still-valid map).

Kill (`src/policy/kill.ts`): flatten only on a **close** through the kill, and only if net is still on that side. Flatten only — no open, add, or rotate.

Hostile ERC-20 names in the standardized bag are dropped before compose (`src/safety/token.ts`). They must not become a flatten `symbol`. Secrets stay out of git — [docs/SECURITY.md](SECURITY.md).

## Event wiring

1. **The Graph** — live products, joined in `src/graph/compose.ts`: our **Base ERC-20 balances subgraph** (`subgraphs/bag/`, Studio v0.2.1, ETH labeled from WETH) and a **Messari standardized-schema lending subgraph** (Aave V3, Arbitrum — `src/graph/aave.ts`, LENDER → bag / BORROWER → debt) ⋈ our **maps subgraph** (`subgraph/`, `MapConfirmed` on Base `0x78D7F79e50d2fd8cC065A01f15A6d21d0F6d3C7C`, Studio v0.4.1). `src/graph/prompt.ts` formats rows for desk Ask AI (`composeAskPayload`) and the public `compose_wallet` MCP (`mcp/`, `src/graph/wallet.ts`). Status is `conflictOf` only. Run it in `demo/` or `npm run compose -- 0x…`. Partner map: [GRAPH.md](GRAPH.md) · [README — The Graph](../README.md#the-graph).
2. **Chainlink** — CRE Confidential Workflow (`cre/`, `handlerInTee`) decides flatten from the private kill policy; `KillSettled` records it on Base Sepolia. The write is keyed by the TEE output (not CRE consensus inside the workflow). Flatten is not live Hyperliquid.
3. **World** — the settlement agent must be human-backed in AgentBook before funds (`world/`). Sandbox + `feedback.md` are filled. Production register still needs Orb World ID. A Ledger device gate also stays built in `ledger/` — real Ethereum firmware on the partner-sanctioned Speculos emulator — as unticked development work.

## Event vs Alpha

**Pre-existing (not hackathon work):** the commercial desk at https://tradecharts.app — Vite/React UI, Binance tape, SIWE login, wallet/Hyperliquid reads, the deterministic Elliott validator (`src/validator/`, copied here with tests), and Confirm as a private save.

**This event:** both subgraphs, the compose join, the MapConfirmed onchain records, `demo/`, and the live Studio consume. Chainlink CRE is simulated with the onchain decision record. World: Sandbox tested, AgentBook register blocked on Orb. Nothing in this repo existed before ETHOnline 2026.

## Run

See [README](../README.md#run) — offline tests, the `LIVE_GRAPH=1` live compose check, the `demo/` page, and subgraph deploy scripts.

## Desk (this event)

Watchlist is the wallet. Liq and kill on one pane. Propose → validator → Confirm (still a **private save** on the live desk). Graph maps are `MapConfirmed` events already on Base — the desk Confirm button does not write them yet. Chainlink close-kill writes `KillSettled`; flatten is not live. Other tools can query the same Graph record later.
