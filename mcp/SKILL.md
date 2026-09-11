# Skill: compose a wallet against confirmed maps

Use this when the user asks about a wallet's book versus TradeCharts maps — any phrasing: fighting / aligned / unmapped / insolvent, **what is my position**, **am I long or short**, **price vs the map**, holdings, exposure. Do not wait for the words "fighting" or "bag".

## Tool

`compose_wallet`

- **address** (required): `0x` wallet.
- **source** (optional): `base` (default) · `aave` · `both`.
  - `base` — Studio bag ⋈ Studio maps. **No key.**
  - `aave` / `both` — Messari Aave on The Graph Network. Needs `GRAPH_API_KEY` in the environment. Never ask the user to paste a key into chat.

## Rules

1. Call the tool. Do not invent a status.
2. Status comes from `conflictOf` only. Cite the returned `cites` lines as written (`ETH fighting · confirmed short · spot … · Graph maps block N`).
3. If `error` is set, say Studio (or the gateway) failed. Do not guess.
4. If every row is `unmapped`, say Confirm is not onchain yet. A private desk lock is not a Graph map.
5. Do not fetch arbitrary GraphQL. This is the only Graph look-up.

## Example

```
compose_wallet
  address: 0xfA8C53B715755762209De11923fB99BC4607954B
  source: base
```

Same wallet, no desk:

```bash
npm run compose -- 0xfA8C53B715755762209De11923fB99BC4607954B
```
