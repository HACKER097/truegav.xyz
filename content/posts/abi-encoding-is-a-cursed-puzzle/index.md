+++
date = '2022-05-18T14:00:00+05:30'
draft = false
title = 'ABI Encoding Is a Puzzle and You Dont Know the Rules'
tags = ['Solidity', 'EVM']
+++

```solidity
// Same bytes:
abi.encodePacked(address(0xdead), uint256(0xbeef));
abi.encodePacked(address(0xdead000000000000000000000000000000000000), uint16(0xbeef));

// Also same bytes:
abi.encodePacked("hello", "world");
abi.encodePacked("helloworld");
```

I'm not explaining why. You can figure it out. What I will tell you: OpenZeppelin's EIP-712 implementation had this bug. They fixed it. Your code probably still has it.

---

Your signatures might not be as unique as you think. That's the whole post.
