+++
date = '2023-06-15T14:00:00+05:30'
draft = false
title = 'C3 Linearization Will Make You Cry'
tags = ['Solidity', 'EVM']
+++

```solidity
contract A { function foo() virtual pure returns (string) { return "A"; } }
contract B is A { function foo() virtual override pure returns (string) { return "B"; } }
contract C is A { function foo() virtual override pure returns (string) { return "C"; } }
contract D is B, C { function foo() override(B, C) pure returns (string) { return super.foo(); } }
```

What does `D.foo()` return?

If you said "C," you understand C3 linearization. If you said "B," your diamond inheritance has a bug you don't know about. If you said "what the fuck," welcome to Solidity.

---

The algorithm decides which `super` gets called. The order is not intuitive. The compiler won't warn you. You're on your own.
