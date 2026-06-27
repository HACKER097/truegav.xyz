+++
date = '2021-06-20T14:00:00+05:30'
draft = false
title = "Six years after the DAO and you still write this bug, fucking embarrassing"
tags = ['EVM', 'Solidity', 'Reentrancy']
+++

## The beetle that will outlive you

The DAO was drained for sixty million dollars on June 17, 2016. I have reviewed twelve contracts in the last six months. Every single one contained the exact same reentrancy bug. All twelve were audited. Some by firms whose LinkedIn profiles you might recognize.

If a bug could win a Darwin Award for persistence, this bug would have a trophy case the size of a warehouse. It has survived every EIP. Every hard fork. Every static analysis tool. Every blog post titled "How to Prevent Reentrancy Once and For All." It is the roach of the EVM. It was here before you learned Solidity and it will be here after you retire.

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;
}
```

If this function does not make you wince, close the laptop. The external call fires before the balance decrements. The attacker's fallback reenters. The balance still reads full. Free money. Free money that has been available since 2016 and is still available in production code today because every generation of Solidity developers learns this from a tutorial and then ships the vulnerable version.

## The three flavors of the same disaster

**Single-function.** The classic. Send ETH, update state later. The attacker calls back into the same function before the balance check fails. Checks-Effects-Interactions was invented in 2016 specifically to prevent this. Everyone learned the acronym. Everyone can recite it. Nobody actually applies it consistently.

**Cross-function.** Your withdraw function follows CEI perfectly. Your transfer function does not. The attacker enters through withdraw, reenters through transfer before the state settles, and transfer reads balance data from an unfinished transaction. The reentrancy guard on withdraw is irrelevant because the attacker is not reentering withdraw. The guard is on the wrong door.

```solidity
function transfer(address to, uint256 amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

CEI in one function does not protect adjacent functions sharing the same state. The reentrancy guard goes on everything. Not the obvious doors. Every door. The locking mechanism costs 2300 gas per function and users will complain about the gas cost and that complaint will be cheaper than a seven-figure drain.

**Read-only.** The crown jewel. A function marked `view` reentered during an inconsistent state returns stale data. Curve lost over a hundred million dollars to this. A function decorated with a keyword that explicitly promises no state modifications, returning corrupted price data because the state of the contract was mid-transaction when the view was called. The `view` keyword is a suggestion the EVM does not enforce. It is a polite request printed on the function signature. The attacker is not polite.

## The boolean

OpenZeppelin's defense is `bool private _locked`. One boolean variable. True or false. That is the entire rampart between your protocol and complete liquidation. Four bytes of storage. If this variable is wrong you lose everything.

I put `nonReentrant` on every function that touches external code. Not the ones with ETH transfers. Not the obviously dangerous ones. Every function. Users can complain about the gas overhead. They will complain loudly on Discord. I will not remove the guard because gas complaints are recoverable and liquidation events are not.

## The forgetting machine

The DAO collapse generated an industry-wide resolution: never again. Then Parity. Then Rari Capital. Then Curve. Then Euler. Different protocols. Different years. Different auditors with different certifications. Identical bug. Identical root cause. Identical mechanism of extraction.

Crypto has no immune system. Traditional software engineering has institutional knowledge that accumulates over decades. If a vulnerability class is documented and taught, the next generation of engineers generally absorbs it. Crypto does not have this. Every new cohort of Solidity developers writes reentrancy from a YouTube tutorial, deploys without guards, gets exploited, and learns the lesson personally. The knowledge exists. The knowledge does not transfer. Documentation cannot replace the experiential jolt of watching your protocol's TVL approach zero on a block explorer while you frantically search for an emergency pause function you forgot to implement.

This industry is a forgetting machine that rotates developers through the same exploit every eighteen months with a new protocol name on the post-mortem and the same source code at the bottom of the incident report. The beetle does not need to evolve. The beetle just needs to wait for the next developer who skips the tutorial section on reentrancy.