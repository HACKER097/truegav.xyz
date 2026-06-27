+++
date = '2023-09-28T14:00:00+05:30'
draft = false
title = 'You put msg.value in a loop and lost money, what did you expect'
tags = ['Solidity', 'EVM']
+++

## The variable that never moves

`msg.value` does not change inside a loop. That sentence has cost the crypto industry more than a hundred million dollars and it will cost more because the sentence is technically correct and the mental model of every developer who writes a loop is technically wrong and the EVM has no mechanism for caring about the distance between the two.

`msg.value` is established once at the start of a transaction. It holds the total ether attached. It persists unchanged through every internal call, every delegatecall, and every iteration of every loop in the entire call tree. It never decreases. It never subdivides. It holds one number from the first instruction to the last.

```solidity
function batchTransfer(address[] memory recipients) external payable {
    for (uint256 i = 0; i < recipients.length; i++) {
        (bool success, ) = recipients[i].call{value: msg.value}("");
        require(success);
    }
}
```

Send 1 ETH. Every recipient in the array receives 1 ETH. The contract disburses `recipients.length` multiplied by 1 ETH sourced from whatever pre-existing balance the vault happened to be holding when your transaction arrived. You have just drained your own protocol through a single function call. The exploit is identical across every victim because `msg.value` never moves.

## Opyn

Opyn, August 2020. Three hundred seventy-one thousand dollars gone. The `_exercise` function iterated over option contracts. Each iteration compared the individual exercise price against `msg.value`. The comparison passed on every single iteration because `msg.value` held the same value throughout the entire loop. One incoming payment funded multiple option redemptions. The attacker paid once and exercised multiple times.

## MISO

SushiSwap's launchpad, August 2021. Three hundred fifty million dollars at risk. samczsun identified the vulnerability before any funds were extracted. The `batch` function delegated to `commitEth` inside a loop and each delegatecall preserved the original `msg.value` across iterations.

One ETH committed became N times ETH credited to the attacker's auction balance. The refund mechanism was designed to return any committed amount above the auction hard cap. The attacker would have withdrawn every credited ETH immediately. samczsun titled the writeup "Two rights might make a wrong" which dramatically understates the geometry involved. One right, a constant global variable, produces infinite wrongs when placed inside a loop body.

## The developers brain

The developer writes a loop and processes the concept of iteration as distribution. For each element means split across elements. Distribute. Divide. Share. This is what iteration means in every language the developer has previously used where loop variables typically receive fresh bindings per iteration through closure scope.

Solidity does not rebind `msg.value` per iteration. Solidity does not rebind `msg.value` at all. The variable is set at the top of the transaction and it is never set again. The gap between what the developer believes the code does and what the bytecode actually executes is where the treasury drains.

## The free detector nobody ran

Slither added two detectors for this exact pattern in December 2021. `slither --detect msg-value-loop` catches the Opyn variant. `slither --detect delegatecall-loop` catches the MISO variant. Both were authored with these specific exploits as reference test cases. Both catch every known variant of each pattern. Both are free.

The bug has been documented since the Frontier release in 2015. It has been exploited since 2020. It will be exploited again by a protocol deploying later this year whose developers have never heard of Opyn or MISO because they believe their architecture is novel. Their architecture contains `msg.value` inside a loop. Their architecture is not novel. Their architecture is a 2015 specification document waiting to become a 2025 post-mortem.