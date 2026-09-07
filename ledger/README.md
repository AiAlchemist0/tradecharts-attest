# Ledger — the human gate in front of flatten

Product order (Continuity): **Graph compose → CRE TEE decides flatten → Ledger
confirms → only then may funds move.** The close-kill workflow
([`../cre/`](../cre)) already emits the decision and anchors it onchain
(`KillSettled`). Ledger sits **after** the TEE and **before** execution — a
device confirmation in front of an action the product already had (flatten),
which is exactly the Continuity line.

## What we integrate

- **Ledger Agent Stack / Key Ring CLI** (`wallet-cli ring`) — the host-held key
  ring path they recommend for machines without USB access to the agent. The
  session wallet's Hyperliquid secret would live in the ring, so the CRE agent
  never sees the raw key.
- **Device confirm** — when the TEE says `flatten`, the desk shows the decision
  record (`KillSettled` event: symbol, close, kill, reasonHash) and requires an
  on-device approve before the settle/execute step is released.

## Status (honest)

- ✅ Decision record onchain (`KillSettled`, Base Sepolia) — the thing the
  device approves is already a verifiable onchain fact.
- ✅ Desk Stop-gate UI reads the latest settlement and shows the approve step
  (private desk, `ConflictBoard`).
- ⏳ Real device prompt / Key Ring enrollment — runs with the Ledger session
  hardware. We do not tick the Ledger line without a real prompt on camera.

## DQ reminders

- WalletConnect-only with no Key Ring / device confirm does not qualify.
- "We might add Ledger later" does not qualify. The gate must be in the
  flatten path.
