+++
date = '2022-05-18T14:00:00+05:30'
draft = false
title = 'OpenZeppelin fixed this five years ago and your code still has it, why'
tags = ['Solidity', 'ABI', 'EIP-712']
+++

## Two functions

Solidity provides two encoding functions for preparing data before hashing. `abi.encode` pads every argument to a full 32 bytes with zero-fill. `abi.encodePacked` concatenates raw bytes with nothing separating adjacent arguments.

```solidity
abi.encodePacked(address(0xdead), uint256(0xbeef));
abi.encodePacked(address(0xdead000000000000000000000000000000000000), uint16(0xbeef));
```

These two calls produce identical byte output. An address with trailing zero bytes next to a small uint packs into the exact same bytestring as a different address next to a large uint. Hash this output and use it as a signature commitment. An attacker can forge equivalent messages by shifting the type boundary between the arguments because the padding that differentiates them does not exist.

## The Stack Overflow answer you copied

OpenZeppelin's own EIP-712 reference implementation contained this bug. Their signature construction used `abi.encodePacked` internally. Different typed data inputs could collide into the same hash. They identified the issue. They fixed it. Five years ago.

```solidity
// The code circulating on Stack Overflow since 2018 with 200 upvotes:
bytes32 hash = keccak256(abi.encodePacked(
    "\x19\x01",
    domainSeparator,
    abi.encodePacked(data)
));

// The fix directly beneath it with 40 upvotes:
bytes32 hash = keccak256(abi.encode(
    "\x19\x01",
    domainSeparator,
    keccak256(abi.encode(data))
));
```

The difference is the padding. Deterministic unique encoding per distinct input tuple versus an unbounded collision surface. The fix is literally changing the function name from `encodePacked` to `encode`. You copied the top Stack Overflow answer from 2018. The answer accumulated 200 upvotes from people who also did not understand the difference. The correct answer sat directly below it with 40 upvotes. You did not scroll.

## Twelve documented ways to lose user funds

EIP-712 implementations fail in twelve recurring patterns across production codebases.

Missing chainId in the domain separator. Missing verifyingContract address binding. Missing the mandatory `\x19\x01` prefix. Missing per-signer nonce for replay prevention. Missing deadline timestamp verification. Untreated ECDSA signature malleability. Silent ecrecover zero return. Incorrect typehash string construction. Array encoding collisions from packing multiple dynamic types. Nested struct encoding confusion. Hardcoded domain separator that breaks after a chain fork. Missing signer zero check.

Optimism lost 17.6 million dollars to the missing chainId variant. A deployment transaction that predated EIP-155 was replayed on the Optimism L2 network to claim 20 million OP tokens from the airdrop contract. One omitted field in the domain separator struct. Seventeen million dollars in token value extracted through a single missing integer.

Pink Drainer weaponized signature malleability against wallets at scale. They passed contract addresses to wallet UIs as raw decimal integers instead of hexadecimal. The signature recovered to the correct address on-chain. The wallet interface displayed an unreadable 18-digit number instead of a recognizable contract address. The victim signed a permit they could not visually parse and the attacker drained their staked balance. Tens of millions extracted through malleability combined with a UI obfuscation technique.

UniswapV4Router04 lost 42 thousand dollars through a sibling vulnerability. The contract hardcoded `calldataload(164)` in inline assembly to verify that `payer` matched `msg.sender`. The ABI specification explicitly permits non-strict calldata offsets. The attacker restructured the calldata payload so that position 164 contained the attacker's own address, satisfying the raw assembly check, while `abi.decode` followed the actual offset pointer and decoded the victim's address for the real transfer. One hardcoded magic number. One assumption that a flexible specification would behave rigidly.

## The import you skipped

OpenZeppelin maintains an EIP-712 reference implementation that handles all twelve failure modes correctly. It has been publicly available and externally audited since before the majority of currently operating DeFi protocols were deployed to mainnet.

I have identified eight of these twelve bugs in production code. Several of those eight were in contracts I authored myself. The only meaningful difference between my codebase and yours is that I located the vulnerability in my own code and replaced the vulnerable function call. You have not located it in yours. The vulnerable function call sits in your deployed bytecode at this exact moment. It has been sitting there since the day you deployed. The Stack Overflow answer is still ranked first. Your code still imports it.