+++
date = '2025-02-18T14:00:00+05:30'
draft = false
title = 'Audited to Death. Still Died.'
tags = ['DeFi', 'Security', 'Audits']
+++

Balancer V2 was audited by Trail of Bits, OpenZeppelin, and Certora. Multiple audits. Multiple firms. Millions in coverage.

It still broke.

```text
Audit firms involved: 3
Weeks of auditing: 12+
Exploit value: $X,XXX,XXX
Post-mortem findings: trust erodes when auditing passes but the protocol still fails
```

---

Not a hack. Not an exploit. A failure at the boundary between contracts that no audit caught because audits look at code, not at how code interacts with other code.

DeFi doesn't fail inside contracts. It fails at the boundaries between them.

This isn't a hot take. It's a pattern.
