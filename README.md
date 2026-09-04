<p align="center">
  <img src="assets/cover.png" width="100%" alt="TradeCharts — Elliott. Wyckoff. Your book." />
</p>

# TradeCharts Attest
<p align="left">
  <img src="assets/logo.png" width="100" alt="TradeCharts logo" />
</p>

ETHOnline 2026 Continuity. Live desk: [tradecharts.app](https://tradecharts.app)  
[Spec](docs/SPEC.md) · [Architecture](docs/ARCHITECTURE.md) · [Security](docs/SECURITY.md)

The open-source join between the chart, the wallet, and the stop. No shared git history with the commercial desk.

## Who this is for

**Three people. One desk.** Crypto.com estimated ~**774 million** crypto owners by mid-2026. Most only hold. We design for people who trade, or who are learning the chart, and who need a map on coins they actually hold.

How we weight the desk (not a survey): **wallet-native traders ~50%** · **charting beginners ~30%** · **experienced chartists ~20%**. Ask AI teaches beginners the story. Propose + validator serve people who already chart. Interpretive map — not a signal, not advice.

<p align="center">
  <img src="assets/schematics/who.svg" width="100%" alt="Who TradeCharts is for — wallet-native traders, charting beginners, experienced chartists" />
</p>
<p align="center">
  <img src="assets/schematics/story.svg" width="100%" alt="Data tells a story. AI analyses and educates. You Confirm." />
</p>

## The problem

The chart, the wallet, and the perp stop still live in three places. A call is a screenshot. A Hyperliquid stop fires on mark and **wicks**. Nothing answers: *is this book fighting its own map?*

Charts, venue stops, and wallet dashboards already exist. We do not claim they do not. What is missing is a map you can stand behind on **your** coins — and a kill that cannot be taken out by a print that was never a trend change.

### Why a wick is not “the trend died”

Wyckoff already named this. A **spring** (or an **upthrust**) is built to take stops: price tags liquidity beyond the range, then closes back inside. Composite operators hunt the obvious stop. The venue does exactly what they need — flatten on the wick — and the real trend continues.

We do **not** claim we can prove a print was spoofed, washed, or “artificial.” That is unprovable from a chart, and it is not this product.

We claim something narrower, and testable:

- Invalidation is a **weekly close** through the kill, not a five-minute wick.
- The bag sits next to the map: **aligned**, **fighting**, **unmapped**, or **insolvent** (liq inside a still-valid thesis).
- Flatten can only reduce. It cannot add size, open, or rotate.

Elliott is the structure. Wyckoff is the warning that a wick can be a hunt. The join is what makes that warning *act* on the book you actually hold.

### Who this is for

Wallet-native traders (Kai). Spot on Ethereum / Arbitrum / Base, perps on Hyperliquid. Thesis in their head or in Telegram. Not an equity guest, not a signals feed.

| What they have | What goes wrong today |
|---|---|
| Long ETH perp, weekly map still valid | A spring wicks through the HL stop. They are flat. The week closes back in range. Stopped by the hunt, not the thesis. |
| Confirmed Short on ETH, still holding ETH + a long | Three tools, no sentence that says **fighting**. They add size into their own kill. |
| Wallet connected, coins on the book, no Confirm | Unmapped. The bag is the watchlist, but there is no kill and no policy until they Confirm a map. |
| Liq sitting inside the weekly map | The position dies before the thesis does. That is **insolvent** — visible only if book and map share a pane. |

See / Stand behind / Stop is how we close those four. Phishing ERC-20s (visit / claim / airdrop copy) never reach compose — that is hygiene, not a user story.

### Where this sits

**Segment:** wallet-native crypto traders who already have a structure thesis (Elliott / Wyckoff) and a live book (EVM spot + Hyperliquid). Not “another overlay.” Not an exchange. Not a bag dashboard.

The adjacent products each own one pane. TradingView owns the chart (Copilot / Pine; alerts can wait for bar close; they still do not flatten *your* perp). Binance and Hyperliquid own execution and **mark/wick** stops. DeBank / Zerion own the bag with no map. Nobody answers *is this book fighting its own map?*

AI is a job on this desk, not a chatbot bolted on. **Propose / Analyse** draft a weekly map; the validator can refuse it; **you Confirm**. That Confirm can arm an **opt-in kill switch**: on a weekly *close* through the kill, matching Hyperliquid risk may flatten. It cannot add size, open, or rotate. Ledger confirms before funds. It is not unsupervised “AI trading,” and it is not a promise to save every position.

| Job | TradingView | Binance | Hyperliquid | DeBank | TradeCharts |
|---|---|---|---|---|---|
| Coin-volume tape, 24/7 week | often USD vol | yes | yes | — | Binance coins |
| Your bag is the watchlist | — | exchange acct | perps | yes | SIWE bag |
| AI proposes the weekly map | Copilot / Pine | — | — | — | Propose / Analyse |
| AI educates the tape’s story | help docs | academy | — | — | Ask AI |
| Refuse a broken Elliott count | scripts can lie | — | — | — | validator |
| Human Confirm — not a signal | alert / script | — | — | — | you Confirm |
| Bag ⋈ map (fighting / unmapped) | — | — | — | — | compose |
| Kill on a **weekly close**, not a wick | optional alert | mark / wick | mark / wick | — | close-kill |
| Opt-in kill switch — flatten matching risk | webhook bots | full trade | full trade | — | this event |

We do not replace those tools. We join them. Propose / Analyse is Alpha. Close-kill flatten is this event (Beta).

<p align="center">
  <img src="assets/schematics/compare.svg" width="100%" alt="TradeCharts versus TradingView, Binance, Hyperliquid, and DeBank" />
</p>

<p align="center">
  <img src="assets/schematics/three-places.svg" width="100%" alt="The chart, the wallet, and the perp stop live in three places" />
</p>
<p align="center">
  <img src="assets/schematics/spring-kill.svg" width="100%" alt="A Wyckoff spring takes the wick-stop; the weekly close holds the kill" />
</p>

## Architecture

<p align="center">
  <img src="assets/architecture.svg" width="100%" alt="TradeCharts Attest — desk consumes compose; Graph, CRE, Ledger" />
</p>

How the join works, what lives in this repo, and how the live desk consumes it without this tree including the commercial app: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

<p align="center">
  <img src="assets/schematics/compose.svg" width="100%" alt="Compose joins the standardized bag with confirmed maps" />
</p>

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
  <img src="assets/schematics/see-stand-stop.svg" width="100%" alt="See, Stand behind, Stop — The Graph, Chainlink, Ledger" />
</p>

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

Copy `.env.example` to `.env` for a Graph gateway key. Never commit `.env`.

## Security

Hostile token metadata, flatten-only agents, and what must not land in git: [docs/SECURITY.md](docs/SECURITY.md). `npm test` covers compose dropping phishing tickers and `mayAgent` forbidding add-size.

## Out of scope

Private desk UI, store binaries, billing, copy-trading, Uniswap LP, Hedera pay-per-query.
