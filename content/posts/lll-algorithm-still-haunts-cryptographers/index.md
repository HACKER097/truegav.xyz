+++
date = '2024-01-22T14:00:00+05:30'
draft = false
title = "A 1982 Paper Broke Knapsack Crypto and Nobody Noticed for a Fucking Decade"
tags = ['Cryptography', 'Lattices', 'LLL']
+++

Lenstra, Lenstra, and Lovász published their lattice reduction algorithm in 1982. It runs in polynomial time. It finds short vectors approximately. It broke half the cryptosystems of the era and nobody noticed for ten years.

## The Algorithm

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

Delta controls everything. 0.75 is fast but sloppy. 0.99 is slow but devastating. Cryptanalysts use 0.99 because they're not in a hurry and your crypto is the target.

## What It Killed

Merkle-Hellman knapsack cryptosystem. The basis behind every knapsack is a lattice. If the density `d = n / log2(max element)` is below 0.9408, LLL finds the solution. Almost every proposed parameter set fell below this threshold. The entire cryptosystem died.

Coppersmith's method for finding small roots modulo N. Built entirely on LLL. If you use RSA with `e=3` and no padding, Coppersmith can recover your plaintext from the ciphertext. The method works by constructing a lattice where the shortest vector encodes the small root, then running LLL to find it.

Random number generator state reconstruction. If you know a fraction of the private key bits, LLL can find the rest. The key bits form a lattice, the known bits are constraints, and LLL finds the unique vector that satisfies all constraints.

## What It Didn't Kill

Post-quantum crypto. Kyber and Dilithium are built on lattice problems specifically designed to resist LLL. Dimension 400 plus, noise distributions that hide the short vectors, parameters that maximize the gap between what LLL can approximate and what the scheme needs.

But that gap is not well understood. The exact complexity of block-Korkine-Zolotarev (BKZ, the modern extension of LLL) as a function of block size is still open research. NIST's standards assume particular BKZ running times. Those assumptions could be wrong.

Forty years and it's still the first tool every cryptanalyst reaches for. Not bad for a 1982 paper about geometry.
