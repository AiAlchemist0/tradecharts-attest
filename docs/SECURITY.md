# Security

This repo is the **open-source join** (ETHOnline Continuity). The commercial desk at [tradecharts.app](https://tradecharts.app) has a separate tree and a separate threat model. Judges clone **this** repo.

The join is See / Stand behind / Stop. Security here is those three moves, not a product login stack.

## Threat model

| Surface | Who controls it | What must not happen |
|---|---|---|
| Standardized bag (token name, symbol, contract) | Anyone who can deploy an ERC-20 | Phishing ticker becomes a compose row, matches a real map, or is sent to a flatten agent |
| Maps subgraph | Only a signed Confirm (EAS) | Arbitrary `Attested` events become a kill |
| Kill / flatten agent | Our policy | Wick, add-size, rotate, or open |
| Graph gateway key | Operator | Key in git or in the browser bundle |
| Demo wallet | User | SIWE treated as a spend; flatten without device confirm |

## See — hostile bag metadata

Code: `src/safety/token.ts`. Used by `compose` and `fetchStandardBag`.

Explorer / subgraph token fields are **attacker-controlled**. A token named `CIRCLE CLAIM UNTIL …` is bait, not a desk name.

1. Drop it from the bag **before** join. It never appears as aligned / fighting / unmapped.
2. Do not let `USDTCLAIM` collapse onto `USDT`.
3. Do not log the bait (that publishes it).
4. Confirmed scam contracts go in `BLOCKED_ADDRESSES` (lowercase `0x`). Patterns + length are the default layer.

`compose` is the decision. If bait reaches compose, it can reach CRE.

## Stand behind — maps are Confirm, not a tweet

- `mapHash` (`src/policy/hash.ts`) is SHA-256 of canonical JSON. Onchain attestations must hash the same string.
- The maps subgraph indexes **our** Confirm schema. Other EAS `Attested` events are ignored (handler is a no-op until `MapConfirmed` is wired; then filter by schema UID + attester = the signing wallet).
- A map without a wallet is not a policy.

## Stop — flatten only, close only, human in the loop

Code: `src/policy/kill.ts`.

- Kill fires on a **close** through the level, not a wick.
- `mayAgent` allows `flatten` and forbids `open` / `increase` / `rotate`.
- Chainlink CRE (`handlerInTee`) is the confidential decision. The same run writes onchain. It does not send size.
- Ledger confirms **after** the TEE, **before** funds. No flatten without that prompt (when the Ledger path is live).

A phishing ticker must never become the `symbol` of a flatten.

## Secrets

| Item | In this repo? |
|---|---|
| Studio / Graph gateway API key | **No.** `.env` / operator env only. `.env.example` has names, not values. |
| Subgraph id / Studio query URL | Yes — public query endpoint |
| EAS contract on Base Sepolia | Yes — `0x4200…0021` is the official deployment |
| Private desk Supabase, Cloudflare, `service_role` | **Never.** Those stay in the commercial tree. |

`fetchStandardBag` puts `apiKey` in the gateway URL because that is how Graph Network auth works. Treat a committed key as burned.

Wallet arguments to Graph queries must be `0x` + 40 hex (`isEthAddress`). Do not interpolate raw user strings into GraphQL.

## What this repo does not claim

- It is not the desk CSP / RLS / SIWE session store. That is the live product.
- MIT on this tree does not license the commercial app.
- `BLOCKED_ADDRESSES` starts empty; patterns are live. Add hashes when a contract is confirmed.

## Tests

```bash
npm test
```

Safety + compose + `mayAgent` must stay green. A change that lets a `CLAIM` ticker into `compose()` is a regression.
