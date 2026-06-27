+++
date = '2022-02-10T14:00:00+05:30'
draft = false
title = 'I found your extcodesize bug, I am better than your auditor, and I am tired'
tags = ['EVM', 'Solidity']
+++

## The liar embedded in the protocol

extcodesize has been lying to Solidity developers since the Ethereum genesis block. Every developer discovers this lie during an active exploit. Never during development. Never during the audit. Never during code review. Always during a production incident while funds are exiting the protocol.

```solidity
function isContract(address addr) view returns (bool) {
    return addr.code.length > 0;
}
```

This function is inside your deployed bytecode. It compiles without warnings. It passes every test you wrote. It is catastrophically wrong during the only moment in its operational lifetime when correctness matters.

## Yellow Paper Section 7

The EVM constructs contracts in sequenced stages. First the deployment address is computed deterministically. Then an account is created at that address with zero-length code. Then the constructor bytecode executes inside this empty shell. Then and only then, after the constructor returns successfully, the runtime bytecode is committed to account storage.

During stage three, `extcodesize` called on the address of the contract being born returns zero. The contract is literally executing code. The contract is alive. extcodesize reports the contract as dead because the runtime code has not been committed yet.

This is not an implementation bug. This is the designed contract creation sequence specified in mathematical notation in Section 7 of the Yellow Paper. The Yellow Paper is correct. Your function is wrong. They are in disagreement and the Yellow Paper has never lost a disagreement.

An attacker authors a contract whose constructor invokes your protocol. Your protocol runs `extcodesize(msg.sender)`. The caller is a contract mid-birth. extcodesize says zero. Your check concludes: this caller is not a contract. The call proceeds. The constructor completes. Runtime code commits to storage. extcodesize now returns nonzero. The check would now work. The tokens were minted three instructions ago.

```solidity
function mint(address to) external {
    require(!isContract(to), "no bots");
    _mint(to, 1000);
}
```

Rari Capital watched this happen in production. Multiple NFT projects watched this happen in production. The calendar advanced from 2020 to 2021 to 2022 to now. The exploit did not advance. It sat exactly where it was, waiting for the next developer who writes the same check, deploys the same function, and learns the same lesson by losing the same money.

## Eight years of free documentation

Stack Overflow answers explain this. OpenZeppelin's documentation warns about it with explicit text. The Solidity reference docs cover it. Every competent audit firm flags it in every engagement where it appears. The Yellow Paper formalizes the execution sequence mathematically.

All of this information is free. All of it has been free for eight years. The information does not prevent the bug because the information does not transfer to new developers. Every generation of Solidity developers writes the same `isContract` function and every generation discovers the same vulnerability at the same cost. The knowledge is free. The experience is expensive. The cost is always denominated in user funds.

## The opcode that does not exist

No EVM instruction provides "query whether this address currently has a constructor in its execution frame." Multiple EIPs have proposed adding one. The core developers reviewed each proposal and declined to implement. The behavior is permanent. The prank is a protocol feature by explicit developer decision.

The sole reliable check for whether a caller is an EOA is `msg.sender == tx.origin`. This returns true only when the immediate caller is the original transaction signer, which means no contract exists anywhere in the entire call chain. A constructor cannot bypass this because `tx.origin` is always the signing key, always the original source, always the human.

This check simultaneously blocks every smart contract wallet on the planet. Multisigs. Relay networks. Account abstraction wallets. Every protocol that claims to support contract钱包 cannot use `tx.origin` because it rejects every contract the protocol needs to serve. The only correct EOA check is incompatible with any protocol that has actual users who hold funds in smart accounts.

You either accept that EOA detection at the EVM level is architecturally impossible and design your protocol around that fact, or you keep the extcodesize check and wait for a constructor to walk through it wearing a disguise. The constructor is already on its way. It is wearing a very convincing costume. Your check will not notice.