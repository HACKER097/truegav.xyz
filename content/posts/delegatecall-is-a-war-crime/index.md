+++
date = '2021-03-15T14:00:00+05:30'
draft = false
title = 'Delegatecall Is a War Crime and I Keep Committing It'
tags = ['EVM', 'Solidity', 'Security']
+++

The EVM gives you three ways to call another contract. Two of them want you dead. Everyone uses the dangerous one.

## The Three Instructions

`call` sends ETH, runs code, gets a return value. Normal person behavior.

`staticcall` is call but read-only. Can't modify state. Safe. Boring.

`delegatecall` runs someone else's code in YOUR storage context. Your balance. Your msg.sender. Your entire existence.

One of these is not like the others.

```solidity
(bool success, ) = implementation.delegatecall(msg.data);
```

Every proxy contract has this line. Every upgradeable pattern relies on it. It's also the line that froze $300M in ETH because someone wrote a function called `kill` in a library.

Not a bug. A design pattern. The design pattern YOU chose.

## What Delegatecall Actually Does

It takes the code from the target address and executes it as if it were yours. YOUR storage. YOUR balance. YOUR identity. The target contract could be a honeypot, a selfdestruct bomb, or literally anything, and YOUR contract pays the price.

```solidity
contract Proxy {
    address implementation;
    fallback() external {
        implementation.delegatecall(msg.data);
    }
}
```

No runtime enforcement. The EVM doesn't know what a library is. Solidity's `library` keyword is a compile-time promise from a compiler that trusts you. The bytecode is just DELEGATECALL.

## The Parity Hack

Parity Wallet had a library with a `kill` function. The wallet called it via delegatecall. Someone called `kill` on the library. The library selfdestructed. Every wallet that depended on it froze forever. $300M gone.

```solidity
function kill() external {
    selfdestruct(address(0));
}
```

The function wasn't malicious. It was built for legitimate cleanup. But because it ran in the caller's context via delegatecall, it didn't need to be malicious. It just needed to exist.

## The Punchline

There's no fix. The design pattern IS the attack surface. EIP-1167 made it worse by standardizing the footgun. Every clone factory is a delegatecall factory. Every upgradeable contract trusts an implementation that can change.

The only winning move is not to play. But nobody uses immutable contracts because "what if we need to upgrade?"

Congratulations. You played yourself. I did too.
