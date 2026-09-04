<p align="center">
  <img src="assets/cover.png" width="100%" alt="TradeCharts — Elliott. Wyckoff. Your book." />
</p>

<p align="center">
  <img src="assets/logo.png" width="280" alt="TradeCharts logo" />
</p>

# TradeCharts Attest

The chart, the wallet, and the perp stop still live in three places. This repo is the open-source piece that connects them.

ETHOnline 2026 Continuity. Live desk (Alpha): https://tradecharts.app  
Spec: [docs/SPEC.md](docs/SPEC.md)

Charts, venue stops, and wallet dashboards already exist. We do not claim they do not. What is missing is the join: a validated map tied to **your** book, a public record of aligned / fighting / unmapped, a kill on a **weekly close**, and a flatten that cannot add size.

No shared git history with the commercial app.

## Architecture

<p align="center">
  <img src="assets/architecture.svg" width="100%" alt="TradeCharts Attest — desk consumes compose; Graph, CRE, Ledger" />
</p>

How the join works, what lives in this repo, and how the live desk consumes it without this tree including the commercial app: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Live desk

<p align="center">
  <img src="assets/screenshots/00-desk-btc.png" width="100%" alt="TradeCharts desk — BTC-USD weekly" />
</p>

<p align="center">
  <img src="assets/screenshots/01-desk.png" width="100%" alt="TradeCharts desk — ETH-USD weekly" />
</p>

Wallet SIWE. Binance coin-volume tape. Spot + Hyperliquid reads. Elliott / Wyckoff / Fib / internals / events / indicators. Validator is the render gate. Confirm is still private JSON. The book does not flatten.

## This event (Beta)

<p align="center">
  <img src="assets/screenshots/02-beta.png" width="100%" alt="Beta — the join" />
</p>

| | Module | Partner |
| --- | --- | --- |
| **See** | `src/policy/conflict.ts` | **The Graph** — subgraph of maps + conflict. Live queries, not mocked. |
| **Stand behind** | `src/policy/hash.ts` | **Chainlink** Data Streams / CRE — weekly close that invalidates. |
| **Stop** | `src/policy/kill.ts` | **Ledger** — approve before flatten. Flatten only. |
| **Validator** | `src/validator/` | Same gate as production. Copied, tested. |

<p align="center">
  <img src="assets/screenshots/04-conflict.png" width="100%" alt="Conflict board — aligned, fighting, unmapped" />
</p>

<p align="center">
  <img src="assets/screenshots/06-attest.png" width="100%" alt="Attested Confirm" />
</p>

## Methodology

<p align="center">
  <img src="assets/screenshots/03-elliott.png" width="100%" alt="Elliott Wave — motive 1–5" />
</p>

<p align="center">
  <img src="assets/screenshots/05-wyckoff.png" width="100%" alt="Wyckoff accumulation" />
</p>

<p align="center">
  <img src="assets/screenshots/07-library.png" width="100%" alt="Tape studies library" />
</p>

Visitor docs: https://tradecharts.app/docs

## Run

```bash
npm install
npm test
```

## Out of scope

Private desk UI, store binaries, billing, copy-trading, Uniswap LP, Hedera pay-per-query.
