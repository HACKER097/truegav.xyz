---
title: "the terminal is the IDE"
date: 2026-04-20
draft: false
tags: ["tools", "neovim"]
---

I haven't opened VS Code in three months. Not intentionally — I just stopped needing it.

## What changed

- Neovim + LSP covers 90% of what I need
- `fzf` for everything: files, grep, git, buffers
- `tmux` for splits and persistence
- `lazygit` when I need a visual diff

The mouse is a context switch. Every time I reach for it, I break flow.

### The real advantage

It's not speed. It's **composability**. Every tool speaks stdin/stdout. You chain them together. Pipes are the original plugin system.

```bash
git log --oneline | fzf --preview 'git show {1}' | head -1
```

Try doing that in a GUI.
