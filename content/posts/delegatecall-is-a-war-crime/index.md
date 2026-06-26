+++
date = '2021-03-15T14:00:00+05:30'
draft = false
title = 'Delegatecall Is a War Crime and I Keep Committing It'
tags = ['EVM', 'Solidity', 'Security', 'Parity Hack']
+++

The EVM gives you three ways to call another contract. Two of them want you dead. Everyone uses the dangerous one.

## The Three Instructions

- `call` — sends ETH, runs code, gets a return value. Normal.
- `staticcall` — like call but can't modify state. Read-only. Safe.
- `delegatecall` — runs someone else's code in YOUR storage context.

One of these is not like the others.

```solidity
// The line that launched a thousand exploits
(bool success, ) = implementation.delegatecall(msg.data);
```

Every proxy contract has this line. Every upgradeable pattern relies on it. It's also the line that froze $300M in ETH because someone wrote a function called `kill` in a library.

Not a bug. A design pattern.

## What Delegatecall Actually Does

Delegatecall takes the code from the target address and executes it as if it were yours. YOUR storage. YOUR balance. YOUR msg.sender. The target contract could be a honeypot. It could have a `selfdestruct`. It could do literally anything and YOUR contract pays the price.

```solidity
// You think you're being clever with proxies.
// You're actually signing a blank cheque to a stranger.
contract Proxy {
    address implementation;

    fallback() external {
        implementation.delegatecall(msg.data);
    }
}
```

There is no runtime enforcement of what the implementation does. Just vibes.

## The Parity Hack in One Paragraph

Parity Wallet had a library with a `kill` function. The Wallet called it via delegatecall. Someone called `kill` on the library. The library selfdestructed. Every wallet that depended on it froze forever. $300M locked behind a contract that stopped existing.

```solidity
// Simplified: the library you delegatecall into can do this
function kill() external {
    selfdestruct(address(0)); // oops
}
```

The `kill` function wasn't malicious. It was there for legit reasons. But because it ran in the caller's context via delegatecall, it didn't need to be malicious. It just needed to exist.

## The Funny Part

People still use this pattern. People still get exploited. The EVM doesn't distinguish between "calling a trusted library" and "calling random code." Both look the same at the opcode level.

```solidity
// Solidity says this is safe because MyLib is a library.
// The EVM has no idea what a library is.
using MyLib for uint256;

// Same bytecode as:
// delegatecall(MyLib, ...)
```

No runtime enforcement. Just compile-time promises from a compiler that trusts you to know what you're doing.

## So What

There's no fix. The design pattern IS the attack surface. EIP-1167 (minimal proxies) made it worse by standardizing the footgun. Every clone factory is a delegatecall factory.

If you're building upgradeable contracts, you're writing delegatecall wrappers. If you're writing delegatecall wrappers, you're trusting the implementation to not destroy you. If you're trusting the implementation, you've already lost — because the attack doesn't come from the implementation. It comes from the fact that the implementation can be changed.

The only winning move is not to play. But nobody uses immutable contracts because "what if we need to upgrade?"

Congratulations. You played yourself.
