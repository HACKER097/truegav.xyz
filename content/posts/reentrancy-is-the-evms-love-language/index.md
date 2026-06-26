+++
date = '2021-06-20T14:00:00+05:30'
draft = false
title = "Six Years After the DAO and You Still Write This Bug, Fucking Embarrassing"
tags = ['EVM', 'Solidity', 'Reentrancy']
+++

The DAO got drained for $60M in 2016. It is now 2021. I have personally reviewed 12 contracts in the last six months that had the exact same reentrancy bug. Twelve. All of them were audited. Some of them by firms you have heard of.

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;
}
```

If you cannot spot the bug in this function, you should not be writing smart contracts. Full stop. Close your laptop. Find a new job. This is the most famous vulnerability in EVM history and you still write it.

## The Bug Types Nobody Asked For

Single-function reentrancy. The classic. Send ETH first, update state second. The attacker calls back into the same function before the balance decrements. The balance check passes again. Free money. CEI fixes this and everyone learned CEI in 2016. Good job.

Cross-function reentrancy. Your withdraw function is safe because you CEI'd it. Your transfer function is not. The attacker enters through withdraw, then calls transfer before the state settles, and transfer reads stale data from an unfinished transaction. Solidity doesn't share memory between functions.

```solidity
function transfer(address to, uint256 amount) external {
    require(balances[msg.sender] >= amount); // stale balance mid-tx
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

Read-only reentrancy. The best one. A view function gets reentered and returns stale data. A FUCKING VIEW FUNCTION. Curve lost over $100M to this. Someone wrote `view` on a function and it cost $100M.

## The Guard Is a Boolean

OpenZeppelin's solution is `bool private _locked`. One boolean variable stands between your protocol and total collapse. If this variable is wrong, you lose everything. And you cannot use it everywhere because a global lock breaks legitimate cross-contract calls.

I put `nonReentrant` on everything. Every single function that touches external code. My users can complain about gas. I don't care. Gas complaints are better than getting drained.

## The Reality

I have written every single one of these bugs. The difference is I caught mine in testing. Your users caught yours in production.

The only contracts safe from reentrancy are the ones that make zero external calls. Those contracts are useless. The choice is between exploitable and pointless. Most of you have picked both.
