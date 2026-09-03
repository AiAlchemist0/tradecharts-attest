# TradeCharts Attest

**The map is the stop.**

Open-source policy layer for [TradeCharts](https://tradecharts.app) — ETHOnline 2026 (Continuity track).

The live desk is **Alpha**. This repo is the work that takes it to **crypto Beta**: a confirmed Elliott / Wyckoff map becomes a risk policy for the connected wallet. Testers feel it on the site. Judges build this module.

Live: **https://tradecharts.app**  
This repo: **https://github.com/AiAlchemist0/tradecharts-attest**

The commercial app stays private. This tree has **no shared git history** with it.

## What Alpha already does (on the site)

Wallet login (SIWE). Binance coin-volume tape. Spot + Hyperliquid perps on the ledger (read-only). AI stack: Elliott maps (Propose → validator → Long **and** Short → Confirm), Fib, wave internals, events calendar, Wyckoff, tape indicators. Human Confirm is final. Invalidation is required. The book does **not** yet flatten.

## What this module adds (Beta)

| Verb | Module | Status |
| --- | --- | --- |
| **See** | `src/policy/conflict.ts` — `aligned` / `fighting` / `unmapped` / `insolvent` (liq inside the map) | Logic in this repo; UI on the live desk during the event |
| **Stand behind** | `src/policy/hash.ts` — canonical map hash for commit–reveal Confirm | Hash is here; EAS attest on Base during the event |
| **Stop** | `src/policy/kill.ts` — flatten only on a **close** through invalidation; agent cannot open risk | Policy here; Hyperliquid write / Base intent during the event |
| **Validator** | `src/validator/` — same render gate as production (hard Elliott reject, Fib flag) | Copied, tested |

## Run

```bash
npm install
npm test
```

## Law

- Not a signal. Not a prediction. Interpretive map with a kill.
- Kill is a **close** (Binance week), not a five-minute wick.
- Agent may only reduce or close matching risk. No open, no increase, no rotate.
- `positioned` vs `opinion` will be a ledger snapshot at Confirm (event work).

## Out of scope here

The private desk UI, store binaries, billing, Google/Apple login, copy-trading marketplace, Uniswap LP at Fibs.
