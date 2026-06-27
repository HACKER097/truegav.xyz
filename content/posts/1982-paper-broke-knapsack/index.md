+++
date = '2024-01-22T14:00:00+05:30'
draft = false
title = "A 1982 paper broke knapsack crypto and nobody noticed for a fucking decade"
tags = ['Cryptography', 'Lattices', 'LLL']
+++

## The gift that keeps on killing

A 1982 paper about the geometry of numbers has killed more cryptosystems than every signals intelligence agency on the planet combined. Three Dutch mathematicians published it, collected their citations, and went home. They had no idea they had just handed the world a weapon that would still be executing cryptosystems forty years later while they enjoyed retirement.

The algorithm finds short vectors in polynomial time.

Approximately.

That single word is carrying more weight than the entire combined budget of the NSA, GCHQ, and every other three-letter acronym that has ever attended a budget hearing. LLL does not need the exact shortest vector in your lattice. Short enough is devastatingly short. Every cryptosystem in history that has touched a lattice has learned this. The learning is almost always fatal.

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

This while loop runs inside every signals intelligence basement on earth. It has never taken a vacation. The NSA's human analysts call in sick. Their directors get rotated out by political appointees who could not distinguish a lattice from a lasagna. LLL does not care who sits in the director's chair. LLL sits in the basement and finds short vectors.

## 0.99

Delta controls everything.

0.75 is the setting you use for your graduate homework where the correct answer is a suggestion. 0.99 is the setting cryptanalysts use when they want your encryption scheme to stop existing.

At 0.99 the algorithm slows to a crawl and produces vectors so short they should not mathematically exist. Then it produces another one that is shorter. Then another. Each iteration takes longer than the last. The cryptanalyst goes to lunch. Goes home. Comes back Monday morning. The algorithm is still tightening. Still finding shorter vectors. Still wrapping the noose around your cryptosystem one basis vector at a time.

A commercial penetration test runs for two weeks and produces a 40-page PDF. LLL has been running continuously since the Reagan administration and has never produced a single deliverable. It does not need to. It just needs to find your short vector. It will find your short vector.

## Merkle-Hellman

The first victim.

Merkle-Hellman was a knapsack-based cryptosystem that was supposed to render RSA obsolete. The entire field of knapsack cryptography relies on the assumption that solving a specific subset sum problem is hard. Every knapsack is secretly a lattice. The density `d = n / log2(max element)` dictates everything. Drop below 0.9408 and LLL finds your solution like a bloodhound that caught a scent.

Every parameter set anyone ever proposed was below 0.9408.

The cryptosystem was not broken during a coordinated attack. It was publicly executed while the cryptography community attended different conferences and did not read each other's mail. The corpse lay in the proceedings for ten years before anyone in the field bent down and checked for a pulse. Academic peer review in the 1980s moved at a pace that makes geological processes look like they are in a hurry.

## e=3

RSA with a small exponent remains deployed in production systems whose developers attended a meeting where someone said "e=3 is fine because it is fast." That sentence cost more money than every statement ever made at that meeting combined.

Coppersmith's method constructs a lattice whose shortest vector is your plaintext. LLL walks into that lattice and pulls your message out of the ciphertext with the calm precision of a surgeon removing a splinter. Your padding is not perfect. I know your padding is not perfect without seeing it because padding is never perfect. Every padding scheme has a corner case where the padding assumptions break and the lattice walks through that corner like an open door.

The lattice has no opinions about your deployment timeline. It has no opinions about your JIRA board or your sprint velocity or the ticket where someone wrote "investigate Coppersmith exposure" and marked it WONTFIX because the sprint was ending on Friday and they had a three-day weekend planned. The lattice has a single opinion about geometry and geometry is not on your sprint schedule.

## The leak

A side channel coughs up a quarter of your private key bits. Half the bits. Enough to notice on an oscilloscope if you are looking. Some developer left a debug endpoint that returns partial key material because they reasoned that partial exposure is safe exposure.

LLL takes those known bits and treats them as constraints on a lattice. It finds the unique vector that satisfies every constraint simultaneously. That vector contains the remaining private key.

The algorithm does not possess the concept of partial. It does not understand the word. It reads your constraints, solves your lattice, and returns your key. Partial is total that has not been scheduled yet. Someone is going to schedule it. That someone has a Python script that takes four seconds to run.

## Kyber and Dilithium

NIST spent seven years selecting post-quantum standards in a process that made the BCS national championship look like a model of efficiency. Kyber and Dilithium won. Both are lattice problems engineered specifically to resist LLL. Dimension 400 plus. Noise distributions deliberately designed to drown the short vectors in mathematical static.

The gap between what LLL can extract and what the scheme needs for security is the entire foundation of post-quantum cryptography. Nobody knows the exact complexity of BKZ, LLL's steroid-enhanced descendant, as a function of block size. It is open research. This means the phrase "nobody knows" is doing load-bearing work in the security model of every post-quantum deployment on the planet.

NIST selected these standards assuming particular BKZ running times on hardware that has not been fabricated yet. Every government communications network. Every banking infrastructure. Every classified military channel. The entire post-quantum migration is a bet that a 1982 paper about integer lattices cannot be extended faster than semiconductor fabs can produce better chips. Both sides of that race are in progress. The paper had a forty-year head start.

Eventually is the most terrifying word in cryptography.

## The paper does not age

When Lenstra, Lenstra, and Lovász submitted this manuscript, differential cryptanalysis did not exist as a practical discipline. Side-channel attacks were not a concept. Quantum computers were a topic discussed at physics conferences by people with impressive beards. The internet was a DARPA project that required a modem and patience.

Forty-two years later, this algorithm is still the first tool every cryptanalyst reaches for. The cryptosystems keep changing. The hardware keeps changing. The threat models keep changing. The algorithm does not. It sits in the toolkit and it waits. It has been waiting since 1982 and it has never once grown bored because algorithms do not experience boredom. They experience execution.