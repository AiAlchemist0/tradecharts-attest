export type KillPrint = {
  /** Confirmed map side this kill belongs to. */
  side: "long" | "short";
  kill: number;
  /** Close of the decision bar (weekly by default). */
  close: number;
  /** Current net position in coins. Positive = long. */
  net: number;
};

export type KillAction = "hold" | "flatten";

/**
 * Structure-aware stop: fire only on a *close* through the kill, and only
 * if the book is still on that side. Wicks do not count. A flatten agent
 * may reduce/close — never open or rotate.
 */
export function killAction(print: KillPrint): KillAction {
  if (print.side === "long") {
    if (print.net <= 0) return "hold";
    return print.close < print.kill ? "flatten" : "hold";
  }
  if (print.net >= 0) return "hold";
  return print.close > print.kill ? "flatten" : "hold";
}

export type AgentPermission = "flatten" | "forbidden";

/** Narrow agent: flatten matching risk only. Anything else is forbidden. */
export function mayAgent(op: "flatten" | "open" | "increase" | "rotate"): AgentPermission {
  return op === "flatten" ? "flatten" : "forbidden";
}
