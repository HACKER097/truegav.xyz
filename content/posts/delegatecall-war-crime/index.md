+++
date = '2021-03-15T14:00:00+05:30'
draft = false
title = 'Delegatecall is a war crime and I keep committing it'
tags = ['EVM', 'Solidity', 'Security']
+++

## Three opcodes and two want you dead

The EVM provides three ways to invoke another contract.

`call` sends ETH and returns data. Civilized. Predictable. What a normal engineer would design.

`staticcall` is read-only and cannot modify state. Has never caused anyone harm.

`delegatecall` runs the target's bytecode inside your storage context. Your balance becomes their balance. Your identity becomes their identity. The target code reads your variables and writes to your slots using its own names. The EVM sits in the corner and allows this because the EVM was designed by people who considered this an acceptable tradeoff between code reuse and safety.

```solidity
(bool success, ) = implementation.delegatecall(msg.data);
```

Every proxy contract on Ethereum contains this line. Every upgradeable pattern. Every clone factory. Every single architecture that was built on the premise "we might need to patch this after deployment." This expression is directly responsible for more frozen and stolen value than every centralized exchange that has ever gone bankrupt. It is not a bug. It is a design pattern. The design pattern your team selected.

## Skinwalkers

delegatecall takes the bytecode from a target address and executes it as though it was authored for your contract. The target code references its own variable names mapped against your storage layout.

If slot zero holds `owner` in your contract and `totalSupply` in theirs, delegatecall writes a supply number directly into your owner address. Your owner is now a number. The EVM classifies this as a successful execution and moves to the next instruction.

```solidity
contract Proxy {
    address implementation;
    fallback() external {
        implementation.delegatecall(msg.data);
    }
}
```

Zero runtime guards. Zero type checks. Zero storage layout verification at any point in the execution.

Solidity's `library` keyword is a compile-time pinky promise from a compiler that has elected to believe you. The actual emitted bytecode is raw DELEGATECALL. The compiler does not verify that the storage layouts match. The compiler does not verify anything at runtime because the compiler is not present at runtime. The compiler's trust in your diligence is the only safety mechanism. Your diligence has never been sufficient. Nobody's diligence is sufficient. Relying on human diligence for storage safety is how three hundred million dollars gets permanently frozen.

## The collision that passes every test

```solidity
contract Proxy  { uint public value; }
contract Impl   { uint public totalSupply; }
```

Both contracts store a uint256 at slot zero. delegatecall writes to slot zero. Both variables occupy 32 bytes. Nothing corrupts. The test suite passes. Deployment proceeds. Everyone celebrates with a team dinner.

Six months pass. A developer refactors Impl's storage layout by adding a new state variable before `totalSupply`. Slot zero in Proxy no longer aligns with slot zero in Impl. delegatecall begins silently destroying data with every subsequent transaction. The vulnerability was invisible for six months because every test in the suite was authored while both contracts happened to share identical layout at the critical slots. Coincidence masqueraded as type safety. The test suite confirmed the coincidence was stable. Coincidence is not stable.

## The three hundred million dollar cleanup function

Parity Wallet deployed a library containing a function called `kill`.

```solidity
function kill() external {
    selfdestruct(address(0));
}
```

The function was not malicious. It performed routine administrative disposal of the library contract. Standard cleanup. The kind of function you write and forget about.

An attacker exploited an uninitialized `initWallet` function to seize ownership of the library itself. They called `kill`. The library executed selfdestruct. Every single wallet contract that delegated to that library froze permanently. Not drained. Not partially compromised. Frozen. The ETH sits on the blockchain at this exact moment and no entity will ever access it again. Three hundred million dollars locked in contracts that no longer contain executable logic because a maintenance function ran in the wrong storage context.

`kill` did exactly what it said it would do. The function was correct. The context was wrong. delegatecall does not distinguish between correct execution in the correct context and correct execution in the wrong context because delegatecall was not designed with a concept of context correctness. It was designed with a concept of code reuse. The code was reused. The storage was also reused. The storage was not supposed to be reused for that purpose. Nobody checked.

## The design pattern is the vulnerability

No fix exists. The attack surface is the design pattern itself. EIP-1167 formalized the footgun as a standard specification. Every clone factory deployed after EIP-1167 is a delegatecall factory. Every upgradeable contract delegates to an implementation address that governance can redirect at any time. Every proxy on Ethereum lives or dies based on storage layout alignment between the proxy and the implementation, and zero automated tools verify this alignment, and zero test suites test it, because the tests pass when the slots accidentally match and nobody runs tests after storage refactors.

The protocol designers in 2015 made a decision: code reuse takes priority over execution safety. They were wrong in 2015 and they remain wrong and every protocol running a proxy today is running on their decision. The frozen three hundred million dollars is the receipt. Immutable contracts carry zero delegatecall exposure and zero upgradeability. The market picked upgradeability. The market picked the war crime. The frozen wallets send their regards.