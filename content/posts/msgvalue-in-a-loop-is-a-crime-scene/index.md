+++
date = '2023-09-28T14:00:00+05:30'
draft = false
title = 'Msg.value in a Loop Is a Crime Scene'
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

`msg.value` doesn't change inside the loop. It's the same value for every iteration. Every recipient gets the full amount.

Opyn: $371K.
MISO: $350M at risk.
Same code. Different year.

---

Some bugs die. This one refuses to.
