// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title KillSettled — the onchain record of a close-kill decision.
/// @notice The CRE Confidential Workflow decides flatten/hold inside the TEE;
///         the decision is written here (Chainlink Continuity: the same
///         workflow produces a state change onchain, not a price on a chart).
contract KillSettled {
    event Settled(
        string symbol,
        bool flatten,
        int256 closePrice,
        int256 kill,
        string side,
        int256 net,
        bytes8 reasonHash,
        uint64 decidedAt
    );

    /// @dev settle is called with the TEE's public output only. Kill levels
    ///      enter the record solely because this settlement is opt-in proof
    ///      for the desk's own wallet; the TEE keeps the policy private until
    ///      the owner chooses to anchor the decision.
    function settle(
        string calldata symbol,
        bool flatten,
        int256 closePrice,
        int256 kill,
        string calldata side,
        int256 net,
        bytes8 reasonHash
    ) external {
        emit Settled(symbol, flatten, closePrice, kill, side, net, reasonHash, uint64(block.timestamp));
    }
}
