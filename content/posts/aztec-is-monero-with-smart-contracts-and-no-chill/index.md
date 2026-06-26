+++
date = '2023-03-22T14:00:00+05:30'
draft = false
title = 'Aztec Is What Monero Would Look Like If Programmers Got Involved'
tags = ['Aztec', 'Privacy', 'ZK', 'Cryptography', 'Monero']
+++

Monero is elegant. Monero is simple. Monero has been doing privacy right for a decade. Then Aztec showed up and said "what if we added programmability?" and the result is a beautiful, overengineered mess that I deeply respect.

## The Keys. All 7 Of Them.

Monero has 2 keys: spend key + view key. Done.

Aztec has 7.

| Key | Purpose |
|-----|---------|
| Master Secret Key | Root of everything |
| Master Nullifier Secret | Keeps nullifiers unique per app |
| Master Incoming Viewing Secret | Decrypt notes sent to you |
| Master Outgoing Viewing Secret | Decrypt notes you sent |
| Master Tagging Secret | Find your notes without scanning everything |
| Master Private Key | Sign stuff |
| Master Public Key | The one address everyone shares |

Seven. Keys.

Monero does the same thing with 2. Aztec uses 7 because they need to separate concerns across smart contracts. Every app gets its own nullifier secret. Every app has its own viewing keys. You can give read access to one app without exposing your entire life.

It's overengineered in the way something has to be when you're building the privacy layer for an entire execution environment.

## The Trees. There Are 5.

Monero has a single one: the UTXO set. Simple.

Aztec has:

```text
Note Hash Tree     -> where all private notes live
Nullifier Tree     -> which notes have been spent
Public Data Tree   -> public state (for the non-private parts)
Archive Tree       -> snapshots of all previous roots
L1 -> L2 Tree      -> messages from Ethereum into Aztec
```

Five trees. Each one has a specific role. The Archive Tree is particularly unhinged — it's a tree of tree roots. It lets you prove "this note existed at this point in history" without revealing everything else.

## Honk. Yes, Honk.

Monero uses CLSAG for ring signatures. Battle-tested. Efficient. Boring in the best way.

Aztec's proving system is called Honk. Like the noise a goose makes. It uses sumcheck-based proving (no FFTs needed), has 9 relations to constrain, and is designed for efficient aggregation.

There's also Chonk for client-side proving. Honk and Chonk. I'm not making this up.

```text
Monero: CLSAG, Bulletproofs
Aztec:  Honk, Chonk, UltraHonk, MegaHonk
```

Every time I read the codebase, a new name appears.

## The Note Discovery Problem

Monero lets you scan the blockchain and find your transactions using view tags. Simple. Efficient.

Aztec uses tagged notes. When someone sends you a private note, they derive a tag using your public key. Your PXE (Private eXecution Environment) uses your tagging secret to identify which notes are yours.

The derivation chain:

```text
Shared Secret (ECDH) -> App Secret -> Directional Tag -> Tag -> Siloed Note Tag
```

That's five steps to figure out "is this note for me?" Monero does it in two.

But Aztec's approach lets you have multiple apps, multiple identities, and fine-grained sharing. The complexity is justified. It's still funny.

## The Actual Programmability

This is where Aztec genuinely beats Monero. Monero transactions are: send XMR from A to B. That's it. You can't build a loan on Monero. You can't build a DEX. You can't build anything.

Aztec lets you write arbitrary smart contracts that operate on private state. The contract code runs on your device (client-side execution), generates proofs, and submits them to the network. The sequencer validates the proofs without seeing the underlying data.

```python
# Pseudocode for a private token transfer on Aztec.
# This runs on YOUR computer. Not on a blockchain.
def transfer(token_id, amount, to):
    note = get_note(token_id)
    assert note.balance >= amount
    spend_note(note)
    create_note(to, amount)
    # Prove you did this correctly without revealing anything
    generate_proof()
```

Monero can't do this. Nobody else can do this. Aztec is the only L2 that gives you private smart contracts with arbitrary state transitions.

## So What

Aztec built Monero with smart contracts. The result is 7 keys, 5 trees, a proving system named after farm animals, and the only real private smart contract platform in crypto.

It's overengineered. It's complicated. It's the only thing in this space that actually delivers on the "privacy" promise without giving up programmability.

Monero purists will hate it. Ethereum developers will find it incomprehensible. But it's the closest thing we have to a real privacy L2.

And yes, the proving system is called Honk.
