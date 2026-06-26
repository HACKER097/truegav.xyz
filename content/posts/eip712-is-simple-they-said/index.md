+++
date = '2022-09-12T14:00:00+05:30'
draft = false
title = 'EIP-712 Is Simple They Said'
tags = ['Solidity', 'EVM']
+++

12 known implementation bugs in a "simple" standard. Optimism lost $17.6M to one of them. Pink Drainer used another.

```solidity
// You had one job:
bytes32 hash = keccak256(abi.encode(
    "\x19\x01",
    domainSeparator,
    keccak256(abi.encode(message))
));
```

12 ways to get this wrong. Some of them don't even look wrong until $17.6M disappears.

---

Standards don't prevent exploits. They just give you a consistent place to look for them.
