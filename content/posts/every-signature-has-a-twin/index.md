+++
date = '2024-04-10T14:00:00+05:30'
draft = false
title = 'Every Single Signature You Have Ever Verified Has a Twin'
tags = ['Cryptography', 'ECDSA', 'EVM']
+++

Every ECDSA signature `(r, s, v)` has a sibling `(r, -s mod n, v ^ 1)`. Same signer. Same message. Different bytes. Both valid. Both will pass `ecrecover` and return the correct address.

EIP-2 tried to fix this in 2016 by limiting `s` to the lower half of the curve order. It helped. It didn't solve it. If `v` is 27, try 28. If `v` is 28, try 27. The malleability window is still open.

## Your Protocol Probably Doesn't Handle This

If you deduplicate transactions by signature hash, someone can submit the same action twice with the malleable variant and both will process. If you cache signatures to prevent replay, the cache sees two different byte sequences and lets both through.

Multi-sig wallets that require unique signatures break. NFT marketplaces that cache approvals break. Protocol upgrades that check "has this signature been used" break.

I have checked. Not theoretically. I ran `secp256k1`'s `points_mul` on a set of production signatures and found duplicates. Most protocols don't handle this. Yours probably doesn't either.

```python
# Same signer, same message, different bytes
r, s, v = original_sig
s2 = (-s) % SECP256K1_ORDER
v2 = v ^ 1
# (r, s2, v2) also recovers to the same address
```

The Ethereum Yellow Paper defines `v` as recovering the correct public key from two possibilities. Both are correct. The protocol needs to pick one and enforce it. Most don't pick. Most don't enforce.

EIP-2 was 2016. Your code is from 2023. The fix was documented before you started coding.
