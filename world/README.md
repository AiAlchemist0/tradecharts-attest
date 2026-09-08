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

Agent address for this event: the close-kill settlement wallet (see the keys
folder on the desk machine). Registration runs on World Chain via the hosted
relay — no gas from us.

## Testing without an Orb

The prize line's required path: the **World ID Sandbox App** (access via the
Google Form linked from the
[ETHOnline World prize page](https://ethglobal.com/events/ethonline2026/prizes/world))
tests the full proof flow from a phone — no hardware.

## Prize checklist (AgentKit Continuity)

- [x] Working app — the live desk at tradecharts.app + this repo
- [ ] Registers the agent through AgentBook — `register` above (one Dean step)
- [ ] Sandbox App test run — evidence collected into `feedback.md`
- [ ] Feedback document — `feedback.md`, filled during testing

Ledger remains built in [`../ledger/`](../ledger/README.md) as unticked
development work; World is the submitted human-gate partner.
