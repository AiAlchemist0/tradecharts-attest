// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MapConfirmed — public record of a confirmed wave map.
/// @notice Same ABI as the Base Sepolia deployment. `wallet` is an argument so
///         an attester can seed maps for a book address that does not send.
///         Desk Confirm is still a private save until the desk writes here.
contract MapConfirmed {
    event Confirmed(
        address indexed wallet,
        string symbol,
        string timeframe,
        string side,
        string longKill,
        string shortKill,
        uint256 barTime,
        bytes32 mapHash,
        bool positioned
    );

    function confirm(
        address wallet,
        string calldata symbol,
        string calldata timeframe,
        string calldata side,
        string calldata longKill,
        string calldata shortKill,
        uint256 barTime,
        bytes32 mapHash,
        bool positioned
    ) external {
        emit Confirmed(
            wallet,
            symbol,
            timeframe,
            side,
            longKill,
            shortKill,
            barTime,
            mapHash,
            positioned
        );
    }
}
