+++
date = '2022-05-18T14:00:00+05:30'
draft = false
title = 'OpenZeppelin Fixed This Five Years Ago and Your Code Still Has It, Why'
tags = ['Solidity', 'ABI', 'EIP-712']
+++

```solidity
abi.encodePacked(address(0xdead), uint256(0xbeef));
abi.encodePacked(address(0xdead000000000000000000000000000000000000), uint16(0xbeef));
```

These produce the same bytes. An address with trailing zeros plus a small uint packs identically to a different address plus a large uint. If you hash this output and use it as a signature, someone can forge equivalent messages by massaging the types.

I am not going to explain why in detail because either you understand raw byte encoding or you don't, and if you don't, you shouldn't be hashing abi.encodePacked output.

## OpenZeppelin Screwed This Up

Their EIP-712 implementation had this exact bug. They used `abi.encodePacked` internally and different typed signatures could collide. They fixed it. Five years ago.

```solidity
// Old code still being copied from Stack Overflow:
bytes32 hash = keccak256(abi.encodePacked(
    "\x19\x01",
    domainSeparator,
    abi.encodePacked(data)
));

// The fix that exists, is documented, and you ignore:
bytes32 hash = keccak256(abi.encode(
    "\x19\x01",
    domainSeparator,
    keccak256(abi.encode(data))
));
```

The difference is padding. `abi.encode` pads to 32 bytes per element. `abi.encodePacked` doesn't. One is deterministic. The other is a collision factory.

## EIP-712 Has 12 Known Bugs

Missing chainId. Missing verifyingContract. No `\x19\x01` prefix. Integer overflow in expiry. No nonce. Signature malleability. Ecrecover returning zero. Wrong type strings. Array encoding collisions. Nested struct confusion.

Optimism lost $17.6M to the missing chainId bug. Pink Drainer used signature malleability to drain wallets. These are documented. The fixes are public. OpenZeppelin ships a reference implementation.

And you still copy the Stack Overflow answer from 2018.

I have found 8 of these 12 bugs in production code. Some of them in contracts I wrote myself. The difference is I fixed mine. Your code has been live for two years with a vulnerability that was patched in 2019.
