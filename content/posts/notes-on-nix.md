---
title: "notes on nix"
date: 2026-04-28
draft: false
tags: ["nix", "devops"]
---

Finally moved my dev environment to Nix. No more "works on my machine."

## The flake

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ pkgs.nodejs pkgs.hugo pkgs.git ];
    };
  };
}
```

One file. Everything reproducible. Why didn't I do this sooner.

### Pain points

- Documentation is... dense
- Error messages are cryptic as hell
- Flakes are still "experimental" after 4 years

But once it clicks, there's no going back.
