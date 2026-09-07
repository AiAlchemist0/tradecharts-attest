// Mock close source for `cre workflow simulate` (staging config points here).
// Serves one decision-bar close; override with MOCK_CLOSE env.
import express from "express";

const app = express();
const close = Number(process.env.MOCK_CLOSE ?? "2400");

app.get("/close", (_req, res) => {
  res.json({ close, symbol: process.env.MOCK_SYMBOL ?? "ETH" });
});

app.listen(8787, () => {
  console.log(`close-kill mock server on :8787 — close=${close}`);
});
