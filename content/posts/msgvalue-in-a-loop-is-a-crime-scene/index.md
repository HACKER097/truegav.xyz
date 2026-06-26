+++
date = '2023-09-28T14:00:00+05:30'
draft = false
title = 'You Put msg.value in a Loop and Lost Money, What Did You Expect'
tags = ['Solidity', 'EVM']
+++

```solidity
function batchTransfer(address[] memory recipients) external payable {
    for (uint256 i = 0; i < recipients.length; i++) {
        (bool success, ) = recipients[i].call{value: msg.value}("");
        require(success);
    }
}
```

`msg.value` does not change inside the loop. It's the same value for every single iteration. It is the amount of ETH sent with the transaction. The transaction has one value. The loop has many iterations.

If you send 1 ETH, every recipient gets 1 ETH. The contract pays `recipients.length * 1 ETH` but only received 1 ETH. The rest comes from whatever was in the contract before. Congratulations, you just drained your own contract.

Opyn lost $371K to this exact bug in 2020. MISO had $350M at risk from the same pattern in 2021. The code is identical. The year changed. The bug didn't.

## Why It Keeps Happening

The developer thinks "I'll distribute this payment across all recipients." That's what `for each` means in their head. The EVM thinks "msg.value is a transaction-level property, not a loop variable." The exploit thinks "free money."

Slither catches this. Run Slither. Or don't. Lose money. I don't care. The bug will still be here in 2025.
