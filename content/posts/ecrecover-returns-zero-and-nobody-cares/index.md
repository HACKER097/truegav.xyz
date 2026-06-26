+++
date = '2024-07-05T14:00:00+05:30'
draft = false
title = 'Ecrecover Returns Zero and Nobody Cares'
tags = ['EVM', 'Solidity', 'Cryptography']
+++

`ecrecover` returns `address(0)` when the signature is invalid. It doesn't revert. It doesn't warn you. It just silently hands you the zero address.

```solidity
// This returns address(0) if the signature is garbage.
// The require below passes if ecrecover returns zero
// AND the expected signer is the zero address.
// Which never happens.
// So this pattern "works" by accident.
address signer = ecrecover(hash, v, r, s);
require(signer == expectedSigner, "bad sig");
```

Every implementation that wraps this with a custom check is reinventing OpenZeppelin's `ECDSA.recover`. Every implementation that doesn't is vulnerable.

I've seen both in production. I've written both myself.

---

The precompile that lies to you. Eight years. Still lying.
