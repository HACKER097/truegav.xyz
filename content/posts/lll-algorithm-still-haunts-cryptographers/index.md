+++
date = '2024-01-22T14:00:00+05:30'
draft = false
title = 'A 1982 Paper That Still Makes Cryptographers Sweat'
tags = ['Cryptography', 'Lattices', 'LLL', 'Math']
+++

Lenstra, Lenstra, Lovasz walked into a bar in 1982. They left with an algorithm that broke knapsack cryptosystems, enabled Coppersmith's method, and made RSA with small exponents a death sentence.

The algorithm: LLL. It finds short vectors in lattices. In polynomial time. Approximately.

```python
def lll_reduce(basis, delta=0.75):
    n = len(basis)
    bstar = gram_schmidt(basis)
    k = 1
    while k < n:
        for j in range(k-1, -1, -1):
            mu = projection_coefficient(basis[k], bstar[j])
            if abs(mu) > 0.5:
                basis[k] -= round(mu) * basis[j]
                bstar = gram_schmidt(basis)
        if lovasz_condition(bstar, k, delta):
            k += 1
        else:
            basis[k], basis[k-1] = basis[k-1], basis[k]
            bstar = gram_schmidt(basis)
            k = max(k-1, 1)
    return basis
```

The approximation factor `delta` controls everything. 0.75 = fast but sloppy. 0.99 = slow but devastating. Cryptanalysts use 0.99.

## What It Broke

- Merkle-Hellman knapsack: density below 0.9408 = broken. Almost all real parameters fell below it.
- RSA with small `e`: Coppersmith built on LLL to find small roots modulo N. If you use `e=3` without padding, LLL can recover your plaintext.
- Random number generator seeds: if you know a fraction of the private key bits, LLL can reconstruct the rest.

## What It Didn't Break

Post-quantum crypto. Kyber, Dilithium, NTRU — they're built on lattice problems specifically designed to resist LLL. Higher dimensions (400+), better distributions, smarter parameters.

But the gap between what LLL can break and what it can't is not well understood. The security of NIST's post-quantum standards depends on this gap staying wide.

---

40 years. The algorithm is 40 years old and it's still the first thing cryptanalysts reach for.

Not bad for a paper from 1982.
