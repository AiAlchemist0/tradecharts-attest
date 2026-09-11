# World — the verified human behind the agent

Product order: **Graph compose → CRE TEE decides flatten → the agent must be
human-backed (World / AgentBook) → only then may the settle execute.**

Our close-kill agent (the settlement wallet that executes `KillSettled`) is an
agent acting on behalf of a person. [AgentKit](https://docs.world.org/agents/agent-kit/integrate)
answers exactly the question our Stop gate needs: *is this agent backed by a
real, verified human?* The agent wallet is registered in **AgentBook** with a
World ID proof — an anonymous, unique-human identifier resolved on World Chain.
The flatten release refuses agents that do not resolve.

## Register the agent (one human verification, on the phone)

```bash
npm install @worldcoin/agentkit
npx @worldcoin/agentkit-cli register <agent-address>   # prompts World App verification
npx @worldcoin/agentkit-cli status <agent-address>     # resolve: human-backed or not
```

Agent address for this event (close-kill settlement wallet):
`0x09759E44aF6CFC013586ae9a0ecdBC3D27734C7b`.

Registration runs on World Chain via the hosted relay — no gas from us.
Resolve locally: `node world/resolve.mjs 0x09759E44aF6CFC013586ae9a0ecdBC3D27734C7b`.

**Status 2026-09-10:** `registered: false`, `humanId: null`. CLI tickets attach in
production World App. AgentKit then requires an **Orb-verified World ID**
(*Humans only — Visit an Orb to verify*). Resume: Orb → `register` again while
the CLI process is still waiting (~5 min).

The CLI always emits production `https://world.org/verify`. There is no
`--sandbox` flag. Do not rewrite the host to `sandbox.world.org` (Sandbox then
returns `malformed_request`).

## Testing without an Orb

The prize line's **Sandbox App** (access via the Google Form on the
[ETHOnline World prize page](https://ethglobal.com/events/ethonline2026/prizes/world))
is for proof-flow UX and `feedback.md`. It cannot complete `agentkit-cli
register` — that ticket is production-only, and AgentBook then needs Orb
uniqueness. Observed states and errors: [`feedback.md`](feedback.md).

## Prize checklist (AgentKit Continuity)

- [x] Working app — the live desk at tradecharts.app + this repo
- [ ] Registers the agent through AgentBook — blocked on Orb World ID (2026-09-10)
- [x] Sandbox App test run — evidence in `feedback.md` (Sandbox cannot finish CLI register)
- [x] Feedback document — `feedback.md`, filled 2026-09-10

Ledger remains built in [`../ledger/`](../ledger/README.md) as unticked
development work; World is the submitted human-gate partner.
