+++
date = '2024-03-22T14:00:00+05:30'
draft = false
title = "Aztec Has Seven Keys and a Proving System Called Honk and I Fucking Love It"
tags = ['Aztec', 'Privacy', 'ZK', 'Monero']
+++

Monero has two keys. Spend key. View key. Done. Two keys, one job, ten years of flawless privacy.

Aztec rolled up and said what if we made private smart contracts and the answer was seven keys, five Merkle trees, two proving systems named Honk and Chonk, and the most beautifully overengineered privacy architecture I have ever read.

## The Keys

Monero: spend key plus view key equals privacy.

Aztec: master secret key, master nullifier secret, master incoming viewing secret, master outgoing viewing secret, master tagging secret, master private key, master public key. Seven. Fucking. Keys.

They need all of them because when you have smart contracts, you need per-app isolation. Your nullifier secret for one app shouldn't reveal anything about another app. Your viewing keys can be shared selectively. You can let someone see your balance in App A while keeping App B completely hidden.

It's overengineered. It's also correct. Monero doesn't have to solve this problem because Monero doesn't have smart contracts.

## The Trees

Monero has one data structure. The UTXO set.

Aztec has five: note hash tree for private notes, nullifier tree for spent notes, public data tree for public state, archive tree for historical roots, and L1 to L2 message tree for cross-chain messages. Five trees. The archive tree is a tree of tree roots so you can prove this note existed at this point in history. A meta-tree. They made a meta-tree.

## Honk and Chonk

Monero uses CLSAG for ring signatures. Efficient. Boring in the best way.

Aztec's proving system is called Honk. Like the sound a goose makes. It uses sumcheck-based proving with no FFTs. Nine constraint relations. Designed for efficient aggregation of multiple proofs.

There's also Chonk for client-side proving. Honk and Chonk. And UltraHonk and MegaHonk are in the dependency tree. I'm not inventing this. These are real names in production cryptography.

## The Programmability

Monero transactions: send XMR from A to B. That's it. You cannot build a lending protocol on Monero. You cannot build a DEX. You cannot build anything interactive.

Aztec lets you write arbitrary smart contracts on private state. The code runs on your device. You generate a zero-knowledge proof that you executed correctly. The network verifies the proof without seeing your data.

```python
def private_transfer(token_id, amount, to):
    note = get_note(token_id)
    assert note.balance >= amount
    spend_note(note)
    create_note(to, amount)
    generate_proof()
```

Nobody else can do this. Aztec is the only L2 with private smart contracts and arbitrary state transitions. It's complex, it's overengineered, and it's the only thing in crypto that actually delivers privacy plus programmability.

Monero purists will hate it. Ethereum developers won't understand it. I read the source for a week and I respect every single design decision even the ones that seem insane.
