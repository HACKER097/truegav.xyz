---
title: "why i switched to go"
date: 2026-03-22
draft: false
tags: ["go", "programming"]
---

Wrote a CLI tool in Python. Then rewrote it in Go. The Go version is 12x faster and compiles to a single binary.

## Not a Python hater

Python is my first language. I'll keep using it for scripts, data work, and quick prototypes.

But for CLI tools that other people need to install? Go wins.

### The compile story

```bash
# Python: "install python3, pip, create venv, install deps..."
# Go:
go build -o mytool .
```

One binary. No runtime. No dependency hell. Ship it.

### What I miss

- Generators and decorators
- List comprehensions
- The REPL

### What I don't miss

- `__pycache__` everywhere
- Virtual environment management
- "Which Python is this?"
