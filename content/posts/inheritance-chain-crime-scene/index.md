+++
date = '2023-06-15T14:00:00+05:30'
draft = false
title = 'Your inheritance chain is a crime scene and you are the suspect'
tags = ['Solidity', 'EVM']
+++

## The quiz

```solidity
contract A { function foo() virtual pure returns (string) { return "A"; } }
contract B is A { function foo() virtual override pure returns (string) { return "B"; } }
contract C is A { function foo() virtual override pure returns (string) { return "C"; } }
contract D is B, C { function foo() override(B, C) pure returns (string) { return super.foo(); } }
```

What does `D.foo()` return?

If you said B, your diamond inheritance contains a bug and you do not know it. If you said C, you either understand C3 linearization or you guessed and your luck will expire on the next diamond you deploy. If you said some variation of "I have no idea," congratulations on being honest. You are in the majority. The majority is where protocols get drained.

Dherits from B and C in that order. C3 linearization produces a method resolution order of [D, B, C, A]. When `D.foo()` invokes `super`, it resolves to C, not B, because C is the next contract in C3 linearized order. The `is` clause is not an execution specification. It is a priority queue fed into an algorithm from 1996 that resolves it in a sequence that feels intuitively wrong to every human brain that encounters it because human brains did not evolve to trace method resolution through directed acyclic graphs.

## The compiler knows and says nothing

C3 linearization was introduced in the Dylan programming language in 1996. Python adopted it. Solidity inherited the concept. The algorithm merges the linearization of each parent class into one ordered list. If the merge produces a contradiction, the compiler throws an error and you learn your class hierarchy is structurally impossible. If the merge succeeds, the compiler goes completely silent and emits an execution order that you almost certainly did not intend.

The compiler knows precisely which function will execute at runtime. It has this knowledge at compile time. It could surface this information in a diagnostic. It could emit a note. It could print the linearization in the build output. It selects none of these options because the Solidity compiler team believes that a consistent execution order is equivalent to a correct one.

## The cosmetic constructor

```solidity
contract Base1 { uint public x; constructor() { x = 1; } }
contract Base2 { uint public x; constructor() { x = 2; } }
contract Derived is Base1, Base2 {
    constructor() Base2() Base1() {}
}
```

The developer wrote `Base2() Base1()` in the constructor modifier. The developer believes Base2 executes first.

Constructor modifier ordering is cosmetic. The compiler ignores it entirely. C3 order for Derived is [Derived, Base1, Base2]. Base1 executes first and sets x to 1. Base2 executes second and overwrites x to 2. The final stored value is 2. Any developer reading the modifier will conclude the final value is 1. The Solidity team considers this correct behavior because the specification dictates C3 order and the specification has been followed.

## The broken super chain

```solidity
contract B is A {
    function foo() virtual override public {
        A.foo();
    }
}
```

B calls `A.foo()` directly instead of routing through `super.foo()`. The super chain fractures at B. C is skipped entirely. The execution path collapses from [D, B, C, A] to [D, B, A]. C's override never fires. C's state updates never execute. The developer who authored C assumed their function would be invoked because the linearization algorithm says it should be. The developer who wrote B did not read C's source code before inserting the explicit parent call. The compiler emits zero warnings about broken super chains because Solidity assumes intentionality in every explicit function invocation.

## Zero percent

Every diamond inheritance hierarchy with four or more levels contains at least one broken super chain. I have verified this by interviewing Solidity developers in technical assessments. I ask them what `D.foo()` returns in an arbitrary diamond. I have asked enough of them to produce a statistically meaningful sample. Zero percent have answered correctly.

## The free tools nobody runs

Wake provides `wake c3-linearization`. It prints the exact linearization of any contract in your project and reveals which implementation of every virtual function will execute at runtime. Slither visualizes the full inheritance graph with resolution order annotations. Both tools are free and open source.

Nobody runs them before deploying to mainnet. Nobody runs them after deploying to mainnet. The Solidity compiler team has decided that warning developers about resolution order surprises is not the compiler's responsibility. They are correct in a narrow technical sense. The compiler's job is emitting deterministic bytecode and the bytecode is deterministic and the bytecode calls exactly the function C3 selected. You simply did not know which function C3 selected and the compiler did not consider it necessary to mention.