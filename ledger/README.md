# Ledger — the human gate in front of flatten

Product order (Continuity): **Graph compose → CRE TEE decides flatten → Ledger
confirms on the device → only then may funds move.**

## The emulated Nano (partner-sanctioned)

Ledger staff confirmed no physical devices for this event and directed hackers
to the **Speculos emulator** (ETHGlobal Discord, 2026-09-07). We run real
Ethereum firmware (app 1.22.3) on an emulated Nano S Plus, hosted as a dedicated
dev kit: **`E:\LedgerNano\Start-Ledger.bat`** on the desk machine (WSL distro
`LedgerNano`). Power on → a device window opens; keep the console open.
Web UI with clickable buttons: `http://localhost:5000` while powered.

## The approval (verified end-to-end)

```bash
node ledger/approve.cjs '{"flatten":true,"symbol":"ETH","close":2400,"kill":2500,"side":"long","net":4,"reasonHash":"d45306c8"}'
```

The device screen shows the decision (FLATTEN ETH, close vs kill, reason
hash); the human pages it and presses Sign; the script verifies the returned
**EIP-191 signature recovers the device address**
(`0xDad77910DbDFdE764fC21FCD4E74D71bBACA6D8D`). Rejection exits 1 — the
settle never runs.

Firmware facts (1.22.3, learned the hard way):

- `INS_SIGN_PERSONAL_MESSAGE = 0x08` — 0x04 is transaction SIGN and returns 6501
- Response layout is **v-first**: `[v=0x1c][r][s] + 9000`
- Review flow: ~8× right pages the message, **left** highlights Sign, **both** confirms
- Blind signing must be enabled once (Settings → App settings) — persisted in
  the kit's NVRAM across power cycles

## Status

- ✅ Device confirm with real firmware — scriptable, screen-visible, video-ready
- ✅ Signature verified on-chain-recoverable (EIP-191)
- Ledger stays the **unticked development gate** for this event (no physical
  hardware); World's AgentBook human-verification is the submitted gate. Both
  sit at the same point in the flow after the CRE TEE.
