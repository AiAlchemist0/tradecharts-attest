import { Address, BigInt } from "@graphprotocol/graph-ts";
// All data sources share one ABI (ERC20), so any generated module's binding
// decodes every allowlisted token.
import { ERC20, Transfer as WETHTransfer } from "../generated/WETH/ERC20";
import { Transfer as USDCTransfer } from "../generated/USDC/ERC20";
import { Transfer as cbBTCTransfer } from "../generated/cbBTC/ERC20";
import { Transfer as DEGENTransfer } from "../generated/DEGEN/ERC20";
import { Transfer as VIRTUALTransfer } from "../generated/VIRTUAL/ERC20";
import { Transfer as DAITransfer } from "../generated/DAI/ERC20";
import { Account, Balance, Token } from "../generated/schema";

// No top-level Address.fromString/Bytes.fromHexString: those host calls run at
// WASM module-init and corrupt the heap (graph-node #6559) — the first store
// lookup then fails with "unknown name when looking up entity type". Defer them
// into functions called from handlers.
function ZERO(): Address {
  return Address.fromString("0x0000000000000000000000000000000000000000");
}

function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHexString());
  if (token != null) return token;

  token = new Token(address.toHexString());
  let contract = ERC20.bind(address);
  let sym = contract.try_symbol();
  let dec = contract.try_decimals();
  let name = contract.try_name();
  token.symbol = sym.reverted ? address.toHexString() : sym.value;
  token.decimals = dec.reverted ? 18 : dec.value;
  token.name = name.reverted ? null : name.value;
  token.save();
  return token;
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());
  if (account == null) {
    account = new Account(address.toHexString());
    account.save();
  }
  return account;
}

function transfer(
  from: Address,
  to: Address,
  value: BigInt,
  tokenAddress: Address,
  blockNumber: BigInt,
  timestamp: BigInt,
): void {
  if (value == BigInt.fromI32(0)) return;
  let token = getOrCreateToken(tokenAddress);

  if (from != ZERO()) {
    let id = `${from.toHexString()}|${token.id}`;
    let balance = Balance.load(id);
    if (balance == null) {
      balance = new Balance(id);
      balance.account = getOrCreateAccount(from).id;
      balance.token = token.id;
      balance.balance = BigInt.fromI32(0);
    }
    balance.balance = balance.balance.minus(value);
    balance.blockNumber = blockNumber;
    balance.timestamp = timestamp;
    balance.save();
  }

  if (to != ZERO()) {
    let id = `${to.toHexString()}|${token.id}`;
    let balance = Balance.load(id);
    if (balance == null) {
      balance = new Balance(id);
      balance.account = getOrCreateAccount(to).id;
      balance.token = token.id;
      balance.balance = BigInt.fromI32(0);
    }
    balance.balance = balance.balance.plus(value);
    balance.blockNumber = blockNumber;
    balance.timestamp = timestamp;
    balance.save();
  }
}

// One wrapper per allowlisted data source — they share the transfer logic above.
export function handleWETH(event: WETHTransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
export function handleUSDC(event: USDCTransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
export function handlecbBTC(event: cbBTCTransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
export function handleDEGEN(event: DEGENTransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
export function handleVIRTUAL(event: VIRTUALTransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
export function handleDAI(event: DAITransfer): void {
  transfer(event.params.from, event.params.to, event.params.value, event.address, event.block.number, event.block.timestamp);
}
