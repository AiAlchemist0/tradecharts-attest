# Spec — the map is the stop

ETHOnline 2026. Ships onto https://tradecharts.app as crypto Beta.

## See

Watchlist is the wallet. One row per spot coin and per Hyperliquid perp on the Binance coin-volume tape. Liquidation on the same pane as Long/Short invalidation.

`conflictOf(row)`:

- `unmapped` — exposure, no Confirm
- `aligned` — net direction matches a one-sided map, or both still alive
- `fighting` — net long vs confirmed Short (or the reverse)
- `insolvent` — liquidation sits inside the still-valid map (position dies before the thesis)

## Stand behind

`mapHash(commit)` is SHA-256 of canonical JSON (`symbol`, `timeframe`, sorted pivots, both kills, `barTime`). Onchain attestations keccak the same string.

Confirm: hash **before** the bar closes, reveal after. Snapshot the ledger: `positioned` if this wallet held spot or perp on that coin, else `opinion`. Dead map is `invalidated` then `remapped` — never silently overwritten.

## Stop

`killAction`: flatten a long iff `close < longKill` and net > 0; flatten a short iff `close > shortKill` and net < 0. Wicks are not closes. `mayAgent("flatten")` only.

Fallback if Hyperliquid writes are blocked: park a spot sell intent on Base for the same kill.

## Validator

Pure function. Schema (P1–P4) then hard Elliott (H1–H5) then Fib flags (F1–F6) then structure (S1–S6). `rejected` draws nothing. H5: no kill → reject.
