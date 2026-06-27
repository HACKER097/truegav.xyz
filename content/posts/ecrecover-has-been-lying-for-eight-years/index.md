+++
date = '2024-07-05T14:00:00+05:30'
draft = false
title = 'ecrecover has been lying for eight years and your code still trusts it'
tags = ['EVM', 'Solidity', 'Cryptography']
+++

## The liar at address 0x01

There is a function baked into the EVM protocol at `0x01` that has been deceiving developers since the Frontier release in 2015. Not a smart contract bug. Not a compiler issue. A precompile. Hardcoded into every Ethereum node. When ECDSA public key recovery succeeds, it returns the signer's address. When recovery fails, it returns `address(0)`.

Zero. The null address. Delivered with the emotional affect of a cinder block. No revert. No event. No error state. Just zero.

```solidity
address signer = ecrecover(hash, v, r, s);
require(signer == expectedSigner, "bad sig");
```

This code is deployed in your project right now. It compiles. It has processed transactions correctly for months. It works because no protocol in the history of Ethereum has deployed with `expectedSigner` configured as `address(0)`. The safety you believe you have is coincidental. You are protected by social convention. Social convention is not a security mechanism. Social convention is the practice of hoping that your adversary is as careless as you are.

## 3000 gas, zero validation

The precompile accepts four arguments. A 32-byte message hash. A 1-byte recovery identifier. Two 32-byte scalars. It attempts to reconstruct the public key. If any mathematical operation in the reconstruction fails, it returns zero and the EVM continues executing happily as though a valid address was produced.

It was explicitly designed to be cheap rather than correct. 3000 gas. Every validation responsibility was delegated to the calling contract. Your calling contract performs zero of these validations.

Malleability. `s` and `n - s` both recover to the same address. ecrecover accepts both values with equal enthusiasm. EIP-2 attempted to fix this at the network transaction layer in 2016. EIP-2 does not apply to the precompile. Your contract receives both signature variants. Both pass your verification. Your replay protection hashes the raw signature bytes, sees two distinct byte sequences, and authorizes the same action twice. The attacker submits the twin. Funds move again.

v validity. ecrecover accepts any byte value from 0 to 255 for `v`. Only 27 and 28 hold meaning post-Homestead. Every other value recovers to a garbage address that your comparison rejects because your expected signer is not a garbage address. You did not design this rejection. You did not implement this rejection. The math rejected it for you by accident.

r validity. ecrecover accepts any 32-byte value for `r`. Invalid curve points recover to `address(0)`. Your comparison catches this because no one configures `expectedSigner` as the zero address. Another accident. Another protection you did not implement that exists anyway because arithmetic functions in your favor for unrelated reasons.

Every security property your signature verification appears to possess is a side effect of a comparison you wrote for a different purpose.

## The line you did not write

```solidity
address signer = ecrecover(hash, v, r, s);
require(signer != address(0), "ecrecover failed");
require(signer == expectedSigner, "bad sig");
```

Two require statements. The first checks whether the precompile succeeded. This line is absent from your codebase. The second compares the recovered address. This is the line you wrote and the line you believed was sufficient.

OpenZeppelin's `ECDSA.recover` implements the zero address check, the s-value malleability guard, and the v-value normalization. It has done this since 2017. You imported `Ownable` for access control. You imported `ERC20` for token standards. You did not import the single contract that validates signatures correctly.

The precompile at `0x01` has returned zero on failure since the genesis block. The core developers have confirmed this behavior is permanent because modifying a precompile requires a hard fork. They are correct. The precompile meets its specification exactly. Handling failure cases is the caller's responsibility. You are the caller.