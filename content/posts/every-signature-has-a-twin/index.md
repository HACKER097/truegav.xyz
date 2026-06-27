+++
date = '2024-04-10T14:00:00+05:30'
draft = false
title = 'Every single signature you have ever verified has a twin'
tags = ['Cryptography', 'ECDSA', 'EVM']
+++

## The sibling

Every ECDSA signature `(r, s, v)` possesses an identical twin `(r, n - s, v XOR 1)`. Same private key signed both. Same message was hashed. `ecrecover` returns the identical address for both. Your protocol processes them as distinct authorizations because the raw bytes differ.

```python
r, s, v = original_sig
s2 = (-s) % SECP256K1_ORDER
v2 = v ^ 1
# (r, s2, v2) recovers to the same address
```

The secp256k1 curve is symmetric. For every valid point `(x, y)` that exists on the curve, `(x, -y)` also exists. The `s` component of the signature encodes which y-coordinate was selected during the signing process. Flip `s` modulo the curve order and flip the parity bit in `v`. You have now manufactured a second, completely valid, cryptographically indistinguishable signature for the identical message from the identical key. You never touched the private key. You performed modular arithmetic that a motivated fourteen year old could execute.

## EIP-2 does not live here

In 2016, Ethereum adopted EIP-2 at the Homestead hard fork. Network nodes began rejecting transactions where `s` exceeded `n/2`. Transaction identifiers became unique. Replay at the protocol transaction layer was solved.

EIP-2 has zero effect on the ecrecover precompile.

The precompile lives at `0x01` inside the EVM and accepts the complete range of `s` values. It was deployed before EIP-2 was conceptualized. Updating a precompile requires a network-wide hard fork. The core developers have demonstrated no interest in hard forking Ethereum to repair your contract's signature validation logic.

If `v` is 27, try 28. If `v` is 28, try 27. The malleability window has been open since the Frontier release. It will remain open until every smart contract developer reads the Yellow Paper. The Yellow Paper is 42 pages of mathematical notation that reads like it was authored by someone who believed clarity was a moral failing. Zero people have fully read the Yellow Paper.

## The cache betrays you

When your replay protection hashes the raw signature bytes, the twin generates a different hash. Your cache stores the original bytes as consumed. The twin arrives with different bytes. The cache reports: this signature is new. The authorized action executes a second time with identical authorization from the identical signer.

```solidity
require(!usedSignatures[keccak256(signature)], "replay");
```

When your replay protection hashes the signed message instead, the twin produces the identical message hash because the underlying message never changed. The cache detects the replay. The second execution never initiates. The difference between hashing signature bytes and hashing the signed message is the difference between a protocol that is secure and a protocol that is one bored teenager away from a second withdrawal.

The majority of protocols hash the signature bytes. The majority of developers who wrote the deduplication logic were unaware that ECDSA signatures had twins. They learned about twins when someone submitted one.

## I did the math

I computed twins for production signatures extracted from deployed protocols using secp256k1 point multiplication. The twins exist. They validate. They circumvent replay protection on the majority of systems I tested. I performed this on a laptop in under a second per signature. The attack does not require expertise. It requires knowing that twins exist, which you now do, and which your codebase still does not account for.

OpenZeppelin's `ECDSA.recover` enforces `s <= n/2` and normalizes `v` to 27 or 28. This implementation has been publicly available and externally audited since 2017. The fix predates the launch of most DeFi protocols currently operating on mainnet. You imported OpenZeppelin contracts for token standards and access management. You did not import the one that handles signatures correctly. The twin has been waiting since the block your contract was deployed. The twin is patient. The twin does not need to be patient much longer.