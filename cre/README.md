# Close-kill — a Chainlink CRE Confidential Workflow

Flatten is a **Confidential Workflow** (`handlerInTee`): the private kill policy
(map side, kill level, net) lives in the workflow's encrypted secrets and only
ever exists inside the TEE. Each week at the close the workflow fetches the
decision bar's close, runs the **same deterministic `killAction` as the desk**
(`../src/policy/kill.ts` — a wick never fires it; the book must still be on
that side), and emits only the public decision:

```json
{ "flatten": true, "symbol": "ETH", "close": 2400, "kill": 2500, "side": "long", "net": 4, "reasonHash": "1a2b3c4d" }
```

The same decision is written onchain via `KillSettled` (Base Sepolia) — the
Continuity upgrade is a **state change**, not a price on a chart.

## Run the decision logic

```bash
cd cre && bun install && bun test
```

## Simulate with the CRE CLI

```bash
cp secrets.example.yaml secrets.yaml
bun run mock:server &          # serves the decision-bar close
cre workflow simulate ./cre --project-root . --target=staging-settings --env ./.env
```

(Install the CLI: `curl -sSL https://app.chain.link/cre/install.sh | bash`.)

## Write the decision onchain

`KillSettled` is deployed on Base Sepolia at **`0xe9CA1F6678EE6344e163f8F48CBDA12be2FA2167`**
(first settlement: tx `0x6fc08432f522e46e19c38cc79e9c747c94bf5ca92a5fbb93ef9b49905dee1804`,
flatten=true, decidedAt 1788816558). Feed the workflow output to the settle script:

```bash
node settle.mjs '{"flatten":true,"symbol":"ETH","close":2400,"kill":2500,"side":"long","net":4,"reasonHash":"1a2b3c4d"}'
```

## Scope (honest)

- Decide-in-TEE + secrets + `cre simulate` against the mock close: **this repo, this week**.
- The onchain write currently executes from the desk's settlement wallet keyed
  by the TEE's public output; moving the write inside the workflow's
  consensus/write capability is the next step after the Chainlink session.
- No Functions, no Automation — CRE Confidential Workflow only.
