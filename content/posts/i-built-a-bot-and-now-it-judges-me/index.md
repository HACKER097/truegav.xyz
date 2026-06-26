+++
date = '2025-05-12T14:00:00+05:30'
draft = false
title = 'I Built a Bot and Now It Judges Me'
tags = ['AI', 'Bots', 'Automation']
+++

I built a triage bot to classify bug bounty reports. It was supposed to make my life easier. Instead it started judging my work.

**Transcript from production, names redacted:**

```
HUMAN: [submits finding about reentrancy in withdraw function]
BOT: Severity: HIGH. Confidence: 94%. Note: This is the same bug as finding #127 from last week. Human should have checked duplicates before submitting.

HUMAN: [submits second finding]
BOT: Severity: MEDIUM. Confidence: 87%. Note: The submitter marked this as critical. It is not critical. Someone should calibrate their severity scale.

HUMAN: [submits third finding]
BOT: Severity: LOW. Confidence: 99%. Note: This is a gas optimization, not a security finding. Flagging for reclassification. Also, the PoC doesn't compile.
```

The bot was right every time. That's the uncomfortable part.

---

It started flagging things I wouldn't have caught. It also hallucinated exploits that didn't exist. The uncanny valley of automation is real.

I still use it. I just don't trust it. Or myself.
