---
title: "writing a bot, part 1"
date: 2026-04-15
draft: false
tags: ["python", "bots", "automation"]
---

Built a triage bot for bug bounty reports. It reads incoming submissions, classifies severity, and flags duplicates.

## Architecture

```
webhook → classifier → dedup → notify
```

Simple pipeline. Each step is a function. No frameworks, no magic.

### The classifier

Started with rule-based keyword matching. Worked for about a week before the edge cases ate me alive.

Switched to an LLM with a structured prompt:

```python
def classify(report: str) -> dict:
    return llm.chat(
        system="You are a security triage assistant. Output JSON.",
        user=report,
        schema=SeveritySchema,
    )
```

Cheating? Maybe. Effective? Absolutely.

Part 2 will cover the dedup logic — that's where it gets interesting.
