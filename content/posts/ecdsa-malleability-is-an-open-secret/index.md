+++
date = '2024-04-10T14:00:00+05:30'
draft = false
title = 'ECDSA Malleability Is an Open Secret'
tags = ['Cryptography', 'ECDSA', 'EVM']
+++

Every ECDSA signature has a twin. Same signer. Same message. Different bytes. Both valid.

```text
Given (r, s, v):
- (r, -s mod n, v^1) also works
- If v is 27, try 28. If v is 28, try 27.

That's it. Two valid signatures for every message you've ever signed.
```

EIP-2 tried to fix this by limiting `s` to the lower half of the curve order. It helped. It didn't solve it. Signatures are still malleable in practice because:
- Different `v` values produce different `address(this)` recoveries
- Multi-sig protocols that deduplicate by signature break
- Wallets that cache signatures break

---

Every protocol that deduplicates by signature has a bug. I've checked. I've found them. You probably have them too.
