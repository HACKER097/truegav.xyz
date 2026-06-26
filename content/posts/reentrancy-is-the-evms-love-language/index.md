+++
date = '2021-06-20T14:00:00+05:30'
draft = false
title = "Reentrancy Is the EVM's Love Language and It Keeps Killing Your Users"
tags = ['EVM', 'Solidity', 'Reentrancy', 'DAO Hack']
+++

I have seen the same reentrancy bug in 12 different production contracts. 12. Some of them were audited. Some of them were "battle-tested." All of them had this code in some form:

```solidity
(bool success, ) = msg.sender.call{value: amount}("");
```

You know what this does. The DAO was 2016. It's 2021 now. You have no excuse.

---

**Fun reentrancy facts nobody asked for:**

- Cross-function reentrancy exists because your other functions don't share memory with the one being exploited.
- Cross-contract reentrancy exists because Solidity thinks inter-contract calls are safe.
- Read-only reentrancy exists because the EVM doesn't distinguish between "reading" and "reading during an active exploit."
- Curve lost $100M to the third one. A view function. I hope that keeps you up at night.

```solidity
// This function can't modify state.
// It CAN return a number that gets you exploited.
function getBalance(address user) external view returns (uint256) {
    return balances[user]; // this number is a lie mid-transaction
}
```

---

The ReentrancyGuard is a boolean. A single boolean. If you flip it, the entire contract is exposed. OpenZeppelin maintains it. We all use it. We all pretend it's a real solution.

```solidity
bool private _locked;
```

The security of your multi-million dollar protocol depends on this variable never being wrong.

---

The only contracts safe from reentrancy don't make external calls. Everything else is just gambling with extra steps.

Good luck out there. You'll need it.
