+++
date = '2022-02-10T14:00:00+05:30'
draft = false
title = 'Extcodesize == 0 During Construction and Nobody Knows What to Do About It'
tags = ['EVM', 'Solidity']
+++

During construction, `extcodesize` returns 0.

```solidity
// This function lies to you during construction.
function isContract(address addr) view returns (bool) {
    return addr.code.length > 0;
}
```

This has been known since 2016. It's 2022 now. Nothing changed.

---

EOAs can become contracts. Contracts under construction can call you. `extcodesize` can't tell the difference.

The EVM knows. The EVM doesn't care.

---

There's no opcode for "is this address currently being constructed?" EIPs have been proposed. None accepted.

The prank is part of the spec now.
