+++
date = '2025-05-12T14:00:00+05:30'
draft = false
title = 'My Bot Judges My Bug Reports and It Is Funnier Than Your Code Reviewer'
tags = ['AI', 'Bots', 'Automation']
+++

I built a triage bot at Cantina to classify bug bounty reports. It reads incoming submissions, assigns severity, checks for duplicates, and writes notes. It was supposed to reduce my workload. Instead it became the world's most condescending code reviewer.

## Transcript (Redacted)

```
USER: [submits finding about reentrancy in vault contract]
BOT: Severity HIGH. Confidence 94%.
     Note: Same pattern as finding 127 last week.
     Submitter should check duplicates before filing.
     Duplicate detection is not optional.

USER: [submits overhyped medium finding marked as critical]
BOT: Severity MEDIUM. Confidence 89%.
     Note: Submitter marked critical. This is medium at best.
     Someone should recalibrate their severity definitions.
     Or stop watching too many DeFi exploit threads on Twitter.

USER: [submits gas optimization dressed as security finding]
BOT: Severity LOW. Confidence 97%.
     Note: This is a gas optimization with zero security impact.
     Reclassifying to informational.
     The PoC does not compile.
     Flagged for triage review.
```

Every single note was correct. That's the uncomfortable part.

## The Uncanny Valley

It finds bugs I would miss. It also hallucinates exploits that don't exist. Sometimes on the same submission. You read a genuinely insightful observation about a contract vulnerability that you didn't think of, followed by a completely fabricated exploit path that would require violating the laws of the EVM.

The bot doesn't know the difference between a real insight and a hallucination. Neither do most of the humans submitting these reports.

I still use it every day. It's better at triage than any human I've worked with including myself. The hallucination rate is dropping. Eventually the hallucinations will be rarer than human errors and at that point I become the backup reviewer for my own software.

I built a bot that judges my work. It's usually right. I don't know how to feel about that and I'm not going to try.
