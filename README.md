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

Landing [tradecharts.ai](https://tradecharts.ai) tells one loop: **See → Propose → Educate → Confirm → Stop.** AI drafts the weekly map. You Confirm. Educating on the wave count is the product. **Rules over vibes.**

## Who this is for

**Trade — or learn the chart.** Three people. One desk. Crypto.com estimated ~**774 million** crypto owners by mid-2026. Most only hold. We design for people who trade, or who are learning the chart, and who need a map on coins they actually hold.

How we weight the desk (not a survey): **wallet-native traders ~50%** · **charting beginners ~30%** · **experienced chartists ~20%**. Ask AI walks the count until beginners can Confirm. Propose + a rules check serve people who already chart. Empty tape. Your correction wins. Interpretive map — not a signal, not advice.

<p align="center">
  <img src="assets/schematics/who.svg" width="100%" alt="Who TradeCharts is for — wallet-native traders, charting beginners, experienced chartists" />
</p>
<p align="center">
  <img src="assets/schematics/story.svg" width="100%" alt="See. Propose. Teach. Confirm. AI drafts the weekly map. You Confirm." />
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

AI is a job on this desk, not a chatbot bolted on. **Propose** drafts a weekly map. A rules check can refuse it. **You Confirm.** That Confirm can arm an **opt-in kill switch**: on a weekly *close* through the kill, matching Hyperliquid risk may flatten. It cannot add size, open, or rotate. A World-verified human backs the agent before funds (AgentBook). It is not unsupervised “AI trading,” and it is not a promise to save every position.

| Job | TradingView | Binance | Hyperliquid | DeBank | TradeCharts |
|---|---|---|---|---|---|
| Coin-volume tape, 24/7 week | often USD vol | yes | yes | — | Binance coins |
| Your bag is the watchlist | — | exchange acct | perps | yes | SIWE bag |
| AI drafts the weekly wave map | Copilot / Pine | — | — | — | Propose |
| AI explains why the map looks that way | help docs | academy | — | — | Ask AI |
| Refuse a count that breaks the rules | scripts can lie | — | — | — | rules check |
| You Confirm — not a signal | alert / script | — | — | — | you Confirm |
| Bag ⋈ map (fighting / unmapped) | — | — | — | — | compose |
| Kill on a **weekly close**, not a wick | optional alert | mark / wick | mark / wick | — | close-kill |
| Opt-in kill switch — flatten matching risk | webhook bots | full trade | full trade | — | this event |

We do not join TradingView or Binance. We teach. Compose joins the bag to the map. Propose is Alpha. Close-kill flatten is this event (Beta).

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
  <img src="assets/architecture.svg" width="100%" alt="TradeCharts Attest — desk consumes compose; Graph, CRE, World" />
</p>

How the join works, what lives in this repo, and how the live desk consumes it without this tree including the commercial app: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

<p align="center">
  <img src="assets/schematics/compose.svg" width="100%" alt="Compose joins the standardized bag with confirmed maps" />
</p>

## The Graph

<p align="left">
  <img src="assets/partners/the-graph-logo-on-light.svg" width="200" alt="The Graph" />
</p>

Partner map. Same page on the desk: [tradecharts.app/docs/graph](https://tradecharts.app/docs/graph). Full write-up: [docs/GRAPH.md](docs/GRAPH.md). Official mark: [thegraph.com/brand](https://thegraph.com/brand/).

<p align="center">
  <img src="assets/schematics/graph-ask.svg" width="100%" alt="You prompt Ask AI. This turn it reads the wallet and The Graph, then cites conflictOf." />
</p>
<p align="center">
  <img src="assets/schematics/graph-tech.svg" width="100%" alt="Base events, two Studio subgraphs, two HTTP queries, then conflictOf. No single GraphQL join." />
</p>

**You ask. The wallet is the book. Ask AI cites a live Studio join — it does not invent fighting.**

### How the loop works

1. **You** type a book question — “Is my bag fighting this map?” or “Tell me about my position.” That is not a sixth Elliott step. Propose and Analyse still draft the weekly map; Ask cites the book against maps already confirmed onchain.
2. **Ask AI** does not guess `aligned` or `fighting`. This turn it re-fetches the join and must speak the cite: symbol, status, map side, size, and the maps subgraph block.
3. **Wallet** is the book. On the live desk that is SIWE, then RPC coins + Hyperliquid perps. In this repo, `demo/` and `compose_wallet` take a `0x` and read the Graph bag.
4. **The Graph** is two Studio products, joined in application code (`src/graph/compose.ts`): two HTTP queries, then `conflictOf`. There is no single GraphQL join. Status has four values only — `aligned` · `fighting` · `unmapped` · `insolvent` (`src/policy/conflict.ts`).
5. **Cite** is the sentence the model is required to use, for example `ETH aligned · confirmed long · spot 0.003323 · Graph maps block N` (`src/graph/prompt.ts` — `composeAskPayload`, `citeComposeRow`).

If Studio fails, the payload says Studio failed. The model must not invent a status. If the desk has no wallet, Ask says connect first.

### Two products

| Product | Studio (keyless) | Chain | Indexes |
|---|---|---|---|
| Maps `trade-charts` | `api.studio.thegraph.com/query/1758683/trade-charts/version/latest` | Base | `MapConfirmed` `0x78D7F79e50d2fd8cC065A01f15A6d21d0F6d3C7C` (Studio v0.4.0) |
| Bag `trade-charts-bag` | `api.studio.thegraph.com/query/1758683/trade-charts-bag/version/latest` | Base | Allowlisted ERC-20: WETH, USDC, cbBTC, DEGEN, VIRTUAL, DAI |

Bag and maps are on **one chain — Base**. Do not Graph Network Publish.

Optional third product for the composable line: Messari Aave V3 on the Network (`src/graph/aave.ts`). Needs `GRAPH_API_KEY`. Not required for the Ask loop.

`MapConfirmed.confirm` takes a wallet as an argument — an attester can seed maps for that address. Paste your own `0x` in `demo/` or the CLI. This repo does not ship a personal book as the sample.

### Desk versus this repo (honesty)

| Surface | Bag | Maps |
|---|---|---|
| Live desk board + Ask | Wallet RPC coins + Hyperliquid perps | Studio maps, fetched this turn |
| `demo/` and `compose_wallet` | Studio bag (Base allowlist) | Studio maps, same `conflictOf` |

A wallet can show ETH on the desk and spot `0` on the Graph bag. That is expected. The bag subgraph only indexes the allowlist on Base. Desk Ask is **maps-live**. This repo’s demo is **bag-live**. Both use the same status function. Confirm on [tradecharts.app](https://tradecharts.app) is still a **private save** — it is not yet a `MapConfirmed` from the desk. Flatten is not live. `demo/` is bag ⋈ maps on Base.

### What you can run

- **Desk** — connect a wallet, open Ask, tap *Is my bag fighting this map?* (crypto + book wallet) or type a position question.
- **Browser demo** — `cd demo && npm install && npm run dev`. Paste any `0x`. No keys.
- **CLI** — `npm run compose -- 0x…`
- **MCP** — `compose_wallet` over stdio (`mcp/SKILL.md`). `source=base` is keyless Studio.

Not this setup: arbitrary GraphQL over the Network, Graph Network Publish of these products, onchain Confirm from the live desk, or flatten when a kill prints.

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
| **Stop** | `src/policy/kill.ts` | **World** — human-backed agent only. Flatten only. |
| **Validator** | `src/validator/` | Same gate as production. Copied, tested. |

<p align="center">
  <img src="assets/schematics/see-stand-stop.svg" width="100%" alt="See, Stand behind, Stop — The Graph, Chainlink, World" />
</p>

<p align="center">
  <img src="assets/screenshots/04-conflict.png" width="100%" alt="Conflict board — aligned, fighting, unmapped" />
</p>

<p align="center">
  <img src="assets/screenshots/06-attest.png" width="100%" alt="Attested Confirm" />
</p>

The Ledger gate is also built and verified — real firmware on the partner-sanctioned [Speculos](https://developers.ledger.com/docs/device-app/references/framework) emulator (`ledger/`) — as development work beyond the submitted partner set.

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
npm test                  # 88 offline (compose, conflict, Ask payload, MCP)
LIVE_GRAPH=1 npm test     # + the live compose check against both Studio subgraphs
npm run compose -- 0x…
```

**Ask AI** on the live desk re-fetches this join on book questions (`composeAskPayload` in `src/graph/prompt.ts`). **Tooling:** `compose_wallet` is the same payload over stdio MCP (`mcp/SKILL.md`).

```json
{
  "mcpServers": {
    "tradecharts-compose": {
      "command": "node",
      "args": ["mcp/server.mjs"],
      "cwd": "/absolute/path/to/tradecharts-attest"
    }
  }
}
```

Cursor: Settings → MCP. Claude Desktop: `claude_desktop_config.json`. `source=base` is keyless. `aave` / `both` need `GRAPH_API_KEY` in that server's env — never commit it.

Try the join in a browser — paste any address, no keys:

```bash
cd demo && npm install && npm run dev
```

Deploy the subgraphs yourself (needs a Subgraph Studio deploy key, never committed):

```bash
cd subgraphs/bag && npm install && npm run deploy   # trade-charts-bag — Base ERC-20 balances
cd subgraph      && npm install && npm run deploy:base   # MapConfirmed on Base + seed ETH/BTC/VIRTUAL
cd subgraph      && npm run codegen && npm run deploy    # trade-charts — maps (Base after yaml points at Base)
```

Copy `.env.example` to `.env` to override endpoints or use a Graph Network gateway key. Never commit `.env`.

## Security

Hostile token metadata, flatten-only agents, and what must not land in git: [docs/SECURITY.md](docs/SECURITY.md). `npm test` covers compose dropping phishing tickers and `mayAgent` forbidding add-size.

## Out of scope

Private desk UI, store binaries, billing, copy-trading, Uniswap LP, Hedera pay-per-query.
