+++
date = '2024-07-05T14:00:00+05:30'
draft = false
title = 'Ecrecover Returns address(0) When It Fails and You Never Checked'
tags = ['EVM', 'Solidity', 'Cryptography']
+++

```solidity
address signer = ecrecover(hash, v, r, s);
require(signer == expectedSigner, "bad sig");
```

This is in your codebase. It works. It always works. Until it doesn't.

`ecrecover` returns `address(0)` when the signature is garbage. It doesn't revert. It doesn't warn you. It doesn't even return `address(0xdead)` so you'd notice. It returns zero. And your `require(signer == expectedSigner)` passes if `expectedSigner` somehow equals the zero address, which it never does, so the check works by accident.

## The Accidental Safety

The pattern "works" because nobody deploys contracts with `expectedSigner` set to `address(0)`. If they did, your require statement would be useless and any garbage signature would pass. The safety is purely coincidental. You are protected by convention, not by code.

## What You Should Be Writing

```solidity
address signer = ecrecover(hash, v, r, s);
require(signer != address(0), "ecrecover failed");
require(signer == expectedSigner, "bad sig");
```

Or just use OpenZeppelin's `ECDSA.recover` which handles this internally and has since 2017.

I have seen production code that doesn't check. I have written production code that doesn't check. The precompile is eight years old and it still lies to you. Eight years. Still lying. Fix your requires.
