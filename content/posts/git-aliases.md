---
title: "my git aliases"
date: 2026-03-15
draft: false
tags: ["git", "tools"]
---

Spent an afternoon curating my git config. Sharing because someone might find these useful.

```ini
[alias]
  co = checkout
  br = branch
  st = status -sb
  lg = log --oneline --graph --decorate --all
  last = log -1 HEAD --stat
  undo = reset --soft HEAD~1
  amend = commit --amend --no-edit
  wip = !git add -A && git commit -m "wip"
  cleanup = !git branch --merged | grep -v '\\*' | xargs -n 1 git branch -d
```

`git lg` is the one I use most. Visual branch history in one line.

`git undo` is the safety net. Soft reset keeps your changes staged — you just un-commit.

### The nuclear option

```bash
git reflog   # find the commit hash
git reset --hard <hash>
```

There's always a way back. Git doesn't lose data easily.
