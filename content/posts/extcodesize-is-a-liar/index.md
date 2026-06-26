+++
date = '2022-02-10T14:00:00+05:30'
draft = false
title = 'I Found Your extcodesize Bug, I Am Better Than Your Auditor, and I Am Tired'
tags = ['EVM', 'Solidity']
+++

Every Solidity developer discovers extcodesize returns 0 during construction at exactly the wrong moment: during an exploit. Never during development. Never during testing. Always in production, while money is leaving the contract.

```solidity
function isContract(address addr) view returns (bool) {
    return addr.code.length > 0;
}
```

This function lives in your codebase. I know it does. Every codebase has some variant of it. It compiles. It passes tests. It is completely wrong.

During construction, code hasn't been deployed yet. The constructor is running and the EVM hasn't written the bytecode. extcodesize returns 0. Your check says "not a contract" while a contract is literally calling you from its constructor.

```solidity
function mint(address to) external {
    require(!isContract(to), "no bots");
    _mint(to, 1000);
}
```

An attacker deploys a contract. In its constructor, it calls `mint`. The check passes. Tokens minted. Constructor finishes. Now they have tokens AND a full contract.

Rari Capital lost money to this. Multiple NFT projects lost money to this. 2020, 2021, and someone is probably getting exploited right now in 2022.

## Everyone Has Known Since 2016

Stack Overflow explains it. OpenZeppelin comments warn about it. Solidity docs mention it. Auditors know about it. And yet I keep finding it in production code.

There is no EVM opcode for "is this address under construction." Proposals exist. The core devs have decided it's not important. The prank is a permanent feature of the protocol now.

## What To Do

Nothing. There's no fix. You cannot reliably tell if an address is a contract at the EVM level. Accept that contracts under construction are contracts. Design accordingly.

Or keep the bug and wait. Your users will find it before you do.

```text
extcodesize during construction: 0
This is not changing.
Your code is wrong.
Deal with it or get rekt.
```
