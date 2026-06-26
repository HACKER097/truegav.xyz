+++
date = '2023-06-15T14:00:00+05:30'
draft = false
title = 'Your Inheritance Chain Is a Crime Scene and You Are the Suspect'
tags = ['Solidity', 'EVM']
+++

```solidity
contract A { function foo() virtual pure returns (string) { return "A"; } }
contract B is A { function foo() virtual override pure returns (string) { return "B"; } }
contract C is A { function foo() virtual override pure returns (string) { return "C"; } }
contract D is B, C { function foo() override(B, C) pure returns (string) { return super.foo(); } }
```

What does `D.foo()` return?

If you said B, your diamond inheritance has a bug. If you said C, you understand C3 linearization. If you said "what the fuck," you are most Solidity developers.

D inherits B and C in that order. C3 linearization produces D, B, C, A. `super.foo()` in D calls C.foo(). The order of inheritance in the `is` clause is not an ordering, it's a priority queue and C3 resolves it in ways that feel completely wrong.

## The Algorithm Hates You

C3 linearization decides which `super` gets called when you have diamond inheritance. It's a merge of the linearization of each parent class. If the merge fails, the compiler throws an error and you know something's wrong. If the merge succeeds, you probably still got the order wrong but the compiler won't warn you because it's "consistent."

Your diamond chain has a bug. If you have more than two parent contracts and you use `super`, there's about a 60% chance you don't know which function is actually being called. I've checked. I've asked people in interviews. Nobody knows. Everybody guesses.

The compiler gave you no warning. Your tests passed because you tested the happy path. Your users found the bug in production. Congratulations.
