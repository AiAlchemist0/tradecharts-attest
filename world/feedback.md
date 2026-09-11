# AgentKit integration feedback (ETHOnline 2026)

Filled 2026-09-10 during Sandbox + production World App testing — required by
the World AgentKit Continuity line. Covers: Sandbox App states, proof flows,
test users, errors, edge cases.

Settlement agent under test: `0x09759E44aF6CFC013586ae9a0ecdBC3D27734C7b`.
AgentBook (World Chain `eip155:480`): `0xA23aB2712eA7BBa896930544C7d6636a96b944dA`.
Status at write-up: `registered: false`, `humanId: null`.

## Integration summary

- Product: TradeCharts — close-kill agent may flatten only when human-backed.
- Registration: `@worldcoin/agentkit-cli register <agent>` → World App proof.
- Runtime: Stop gate resolves the agent in AgentBook before releasing the settle.

## Sandbox App states observed

Two apps on the same Android device:

| App | Package | Links it accepts |
|---|---|---|
| World ID Sandbox | `org.world.id.sandbox` | `worldidsandbox://`, `sandbox.world.org` |
| World App (Play) | `org.world.id` 1.0.402 | `world.org/verify`, `worldapp://`, `worldid://` |

- Sandbox **does** launch from a production verify URL, then says **link not supported**.
- Rewriting the CLI ticket host to `sandbox.world.org` opens Sandbox, then dies with **`malformed_request`** — the ticket is issued by the production backend.
- Production World App **does** accept `https://world.org/verify?t=wld&i=…&k=…` into `org.world.id/.DeepLinkEntryActivity` and shows a live Verify sheet (not Home-only).

## Proof flow notes

- `npx @worldcoin/agentkit-cli register <agent>` always emits a **production** ticket (`https://world.org/verify`). There is **no `--sandbox` / `--env` flag**.
- CLI waits ~5 minutes for World ID completion. If the phone step is not finished in that window: `VERIFICATION_FAILED` / `timed out waiting for World ID completion`.
- If the CLI process dies before the proof returns, AgentBook stays `registered: false` even if the phone UI moved. The PC process is what submits the proof.
- Registration is on World Chain via the hosted relay — no gas from us once a valid Orb proof exists.

## Errors and edge cases

- Live production sheet copy: **Humans only** — *AgentKit requires proof of unique humanness. Visit an Orb to verify.* Buttons: **Not now** · **Get verified**.
- **Get verified** → **Get verified with an Orb** (`I am with an Orb` / `Find an Orb`).
- Device-only World App (installed, signed in, no Orb) **cannot** complete AgentBook register. That is the current blocker for `0x09759E44…`.
- Earlier `verification_rejected` on a live ticket was the same credential gap (Cancel / no Orb), not a deep-link routing bug.
- Windows: an unquoted verify URL with `&` is truncated by PowerShell. Quote the full URL.

## Docs feedback

- Prize page / Sandbox docs: “test with the Sandbox App, no Orb needed.” That is true for **Sandbox UX**. It is **not** true for `agentkit-cli register` → on-chain AgentBook. The CLI has no Sandbox mode; AgentKit then requires Orb uniqueness.
- Integrate docs say “World App on a mobile device.” They do not say AgentBook register needs an **Orb-verified** World ID. A fresh Play install is not enough.
- CLI ergonomics: QR / `world.org/verify` link is fine once you know it is production-only. A `--sandbox` flag, or a one-line “Orb required for register,” would have saved the ETHOnline loop.
- Deep link `https://world.org/verify` into production World App is sufficient; `worldapp://verify` was not required once the sheet appeared.

