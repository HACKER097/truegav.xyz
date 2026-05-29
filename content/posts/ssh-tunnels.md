---
title: "ssh tunnels explained"
date: 2026-04-08
draft: false
tags: ["networking", "ssh"]
---

Every few months I forget how SSH tunnels work. Writing this down so I stop re-reading the man page.

## Local tunnel

```bash
ssh -L 8080:localhost:3000 remote-server
```

"Forward my local port 8080 to port 3000 on the remote server." Use case: access a service behind a firewall.

## Remote tunnel

```bash
ssh -R 9090:localhost:3000 remote-server
```

"Let the remote server reach my local port 3000 via its port 9090." Use case: expose a local dev server to the internet.

## Dynamic tunnel (SOCKS proxy)

```bash
ssh -D 1080 remote-server
```

"Route any SOCKS traffic through the remote server." Use case: browse as if you're on the remote network.

### The mental model

`-L` = **L**ocal listens, remote connects
`-R` = **R**emote listens, local connects
`-D` = **D**ynamic (SOCKS)

That's it.
