+++
date = '2024-03-22T14:00:00+05:30'
draft = false
title = "Aztec has seven keys and a proving system called Honk and I fucking love it"
tags = ['Aztec', 'Privacy', 'ZK', 'Monero']
+++

## Two keys is a childs toy

Monero solved privacy with two keys. A spend key and a view key. Two keys. One job per key. Ten years of flawless operation. The Monero cryptographers identified the minimum viable cryptographic primitives and deployed them. This approach is admirable. It is also the cryptographic equivalent of furnishing your apartment with exactly two items from IKEA.

Aztec examined the same problem space and concluded that two keys constituted a personal insult to the concept of key derivation.

Seven keys.

Master secret key. Master nullifier secret. Master incoming viewing secret. Master outgoing viewing secret. Master tagging secret. Master private key. Master public key. Seven distinct cryptographic secrets with seven independent purposes and seven layers of isolation between them.

Monero with two keys is a house with a front door lock and a back door lock. Aztec with seven keys is a facility where every individual room requires separate authentication because the building is simultaneously a bank vault, a securities exchange, a credit facility, and a Strategic Command launch silo. The person who can see your living room must under no circumstances possess the credentials to access the missile silo.

## The key that breeds

The nullifier key architecture alone justifies the entire design. `nhk_master` is a 254-bit scalar stored in the Private Execution Environment on the user's device. From this single root secret, Poseidon2 derives a separate nullifier key for every contract the account touches.

```
nhk_app_token   = poseidon2([nhk_master, token_contract_addr])
nhk_app_lending = poseidon2([nhk_master, lending_contract_addr])
nhk_app_voting  = poseidon2([nhk_master, voting_contract_addr])
```

Each derived key shares zero mathematical relationship with any other derived key. Knowing your token contract nullifier reveals nothing about your lending nullifier. Poseidon2 is a one-way function. One-way means no back-calculation. No back-calculation means an attacker who compromises your activity in one contract cannot correlate it with activity in any other contract. The blast radius from any single key compromise is exactly one contract wide.

Monero cannot do this because Monero does not have multiple contracts. Monero has one transaction type. There is nothing to silo. Aztec has arbitrary contracts executing arbitrary logic on private state and every one of them needs independent privacy isolation. Seven keys are not excess. Seven keys are the minimum viable cryptographic footprint for a system attempting to do what Aztec is attempting to do.

## Five trees

Monero has one data structure. The UTXO set. Beautiful. Singular. Correct.

Aztec has five Merkle trees.

A note hash tree tracking every private note. A nullifier tree preventing double spends through non-existence proofs. A public data tree for public state variables. An archive tree storing historical roots for time-specific proofs. An L1-to-L2 message tree handling cross-chain communication. Five trees with five independent consensus mechanisms.

The archive tree is a tree containing tree roots. A meta-tree. They constructed a meta-tree so that any observer can prove a specific note existed at a specific historical block height. I read the archive tree specification at 1 AM and had to stand up and walk around my apartment for several minutes while my visual cortex adjusted to what I had just absorbed.

## Goose cryptography

The proving system is called Honk.

Like the sound a goose makes when it is startled.

Honk is a multilinear PLONK variant that uses Sumcheck instead of FFTs. Nine constraint relations. Zero Fourier transforms in the entire proving pipeline. The Aztec cryptographers surveyed the existing zk-SNARK naming landscape (Groth16, PLONK, Marlin, Sonic) and decided that their system, designed to protect real financial value on a production L2, should be named after the vocalization of startled waterfowl.

There is also Chonk. Chonk handles client-side proving through HyperNova folding. Your phone generates zero-knowledge proofs that your transaction executed correctly without exposing the transaction data. Your phone. The device you use to check cricket scores and scroll through Instagram reels while pretending to work.

The dependency tree also contains UltraHonk and MegaHonk. These strings appear in formal cryptographic protocol specifications that guard actual money. Imagine presenting a slide deck to a Goldman Sachs risk committee explaining that their cross-border settlement pipeline is secured by MegaHonk. Their faces. The Aztec cryptographers named their life's work after a goose and then returned to writing Rust without any detectable embarrassment.

## One pairing check

The rollup builds a binary proof tree spanning four levels. Transaction proofs feed into block proofs. Block proofs feed into checkpoint proofs. Checkpoint proofs feed into the single epoch root proof. Every level verifies its children. The root of this entire structure is one Honk proof posted to Ethereum L1.

One `ecPairing` precompile call verifies an entire epoch of private state transitions. Every transaction. Every contract call. Every nullifier insertion. Every note commitment. The gas cost for that single verification is lower than swapping two tokens on Uniswap.

An epoch of private smart contract execution costs less to cryptographically verify than one Uniswap swap. Hold that in your head for a moment. The engineers who built this did not accidentally achieve that gas efficiency. They designed for it across the entire proof pipeline.

## Monero cannot do this

A Monero transaction does one thing. It moves XMR from address A to address B. That is the complete feature matrix. You cannot construct a lending market on Monero. You cannot deploy a DEX. You cannot build anything interactive because Monero is a currency, not a computation platform. The finest currency ever deployed on a blockchain. Strictly a currency.

Aztec enables arbitrary smart contracts operating on completely private state. The contract code executes on the user's device. The user generates a zero-knowledge proof of correct execution. The network verifies the proof with zero visibility into the underlying data.

```python
def private_transfer(token_id, amount, to):
    note = get_note(token_id)
    assert note.balance >= amount
    spend_note(note)
    create_note(to, amount)
    generate_proof()
```

Nobody else ships this. Not Zcash. Not any privacy solution currently operational on any mainnet. Private smart contracts with unrestricted state transitions. The system is overengineered because the problem is overcomplicated and pretending the problem is simpler than it is does not reduce the complexity. Two keys is for moving money between two people. Seven keys is for operating an entire financial system where every transaction is invisible.