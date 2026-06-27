+++
date = '2021-11-01T14:00:00+05:30'
draft = false
title = '47 dead projects and the exact moment each one died, fuck you'
tags = ['Meta', 'Projects']
+++

## The graveyard

I have 47 unfinished projects. I counted them last night instead of finishing any of them. The counting process nearly became project 48. I caught myself opening a new repository at 2 AM and had to physically close the laptop.

This is an autopsy report. I will walk you through every corpse. Some are still warm. Some have been decomposing since before COVID. All of them died at a specific, identifiable moment. I will show you the moment.

## catbook

Instagram but exclusively for cats. I was fifteen and absolutely certain this was a billion dollar idea. The conviction available to a teenager who has never attempted to execute anything is indistinguishable from religious ecstasy. I was experiencing startup founder theology at a level normally reserved for people who have raised a Series A.

I built the auth system from scratch. Wrote my own bcrypt implementation because importing a library felt like admitting I was not good enough to reinvent cryptography. Three weeks debugging password hash collisions at 2 AM while my actual school grades decayed in real time. By the end I possessed knowledge of cryptographic hashing that no fifteen year old should possess and exactly zero of it has been useful since.

I opened Android Studio. The screen loaded. I read the word Gradle. I closed Android Studio. That was six years ago. `catbook-final-FINAL-v2` lives on a spinning rust drive I have not plugged in since 2019. The filename is a historical monument to the self-deception of a teenager who believed adding the number 2 to a filename would make the project final.

## The money incinerator

```python
def should_buy(price): return price < yesterday_price
def should_sell(price): return price > yesterday_price
```

It lost money. I added RSI. It lost money with higher statistical confidence. I added a neural network. It lost money faster while burning API credits I personally financed.

Fifty dollars a month in API costs to generate twenty dollars a month in trading losses. That is negative arbitrage so mathematically pristine it could be displayed in a contemporary art museum as a commentary on the inefficiency of human ambition. I could not build something this catastrophically consistent if I tried. The bot achieved a level of financial self-harm that a human day trader could only aspire to.

## chroot

I was sixteen. I had just discovered UNIX philosophy, which at sixteen hits less like a software design principle and more like someone slid you classified documents proving that reality is fundamentally a series of pipes and text streams. Docker had two million lines of Go and a billion dollar valuation. I was going to replace it with a shell script because I had been programming for eighteen months and had not yet absorbed the possibility that billion dollar companies employ people who are not stupid.

```bash
chroot $1 /bin/sh
```

`echo hello` worked. I felt like a god. Everything else segfaulted and the god feeling receded immediately.

I fought the `ls` command for two full weeks. `ls` refused to function inside my handcrafted container because I had not implemented a single subsystem it depends on. No /proc. No /sys. No dynamic linker. No shared libraries. Every time I patched one missing dependency, `ls` would execute for another half-second before discovering the next absent subsystem and detonating like a dog walking through a minefield where each mine is a different POSIX standard.

The people who built Docker encountered these exact problems. They solved them with engineering teams and venture capital and years of iteration. I was rediscovering each one from first principles at 3 AM on a school night while my mother asked me if I had finished my homework. I had not finished my homework. I was implementing a container runtime in Bash.

That `chroot` line is still the most elegant code I have ever written. It does nothing useful whatsoever.

## The two person DAO

Four Uniswap clones. Different color schemes. I would build one, decide the gradient was wrong, and build another. One of them had a DAO. The DAO's complete membership roster was me and my alternate wallet. Every governance vote was unanimous. The treasury contained zero tokens. Voter turnout was 100 percent. governance participation was 100 percent. No disagreement was ever recorded. This is the most successful democratic institution in the history of blockchain governance.

## The bounty platform that processed zero bounties

Six weeks of full-time work. A submission pipeline where researchers could upload findings. A triage interface where reviewers could classify severity. A payout system connected to a wallet that contained no funds because I had no clients and no researchers and no bounties to process.

Zero clients. Zero researchers. Zero submissions. One hundred percent uptime on a service that no human being ever accessed. Three years later I am employed at a major security platform performing this exact work, with the minor improvement that someone else joined the company before me and solved the problem of convincing people to use the product. The universe writes jokes with a delivery delay measured in years.

## The thing that actually works

```bash
echo "$(date): $@" >> notes.txt
```

Thirty-seven characters. I use it every single day. Three years of continuous operation. Zero crashes. Zero data loss. Zero updates. Zero dependencies. The most successful software I have ever written took less time to create than the sentence describing it.

I did not design it to be successful. I designed it to take six seconds because I needed to write something down and I refused to open a notes application. The constraints produced the architecture. The architecture was thirty-seven characters and a redirect operator.

## The triangle

Twelve thousand lines of C++ produced a single triangle on screen. Custom shader pipeline. A three-point lighting system I authored from scratch. Hand-painted bitmap textures I drew in GIMP and mapped onto the triangle's three vertices. Sixty frames per second of rotation that looked absolutely gorgeous.

I never made a game. I did not want to make a game. I wanted to know if I could make a triangle so perfect that I would feel satisfied. I achieved that triangle. The moment the triangle reached perfection I closed the project and never reopened it, because once something is perfect there is nothing left to discover about it. You can only maintain perfection and maintenance is not discovery.

The triangle still rotates in a window that exists only in my memory. The light sources were never switched off. The bitmaps will never render on any screen again. The triangle is perfect and it is dead and those two facts are connected.

## i am alive

```python
#!/usr/bin/env python3
api.update_status("i am alive")
```

One thousand ninety-five tweets. Three years of continuous cron execution. I set the crontab entry and forgot it existed.

I quit Twitter eighteen months ago. I posted a thread about why I was leaving and deleted the app. The cron job did not attend my farewell ceremony. The cron job cannot attend things because it is a single line of Python executing through a system scheduler.

It will tweet "i am alive" every day until the API key expires or the sun expands into a red giant and consumes the data center. It has outlived my engagement with the platform. It has outlived my interest in social media. It does not know it outlived anything because it does not know what "alive" means. It just says it.

## The triager

Seven agents in a pipeline. It reads bug bounty submissions, classifies their severity, detects duplicates, and writes summary notes. It judges the professional output of security researchers who have been in this industry longer than I have been alive. It is frequently more accurate than they are.

It also hallucinates attacks that would require the second law of thermodynamics to be renegotiated at a constitutional convention. On the same submission where it produces a genuinely brilliant observation about a vulnerability I completely missed, it will calmly assert that the attacker can drain the protocol by exploiting an opcode that has never existed in any version of the EVM specification. It delivers both conclusions with identical confidence. It does not know which one is real.

I built this thing. I verify its outputs. I am the human insurance policy on software I personally authored. The code has been finished for two weeks and sits in a git repository because a server requires provisioning and the person who provisions servers is waiting on another person who is waiting on a third person. The chain of human approval is longer than the codebase.

I manually triage bug bounty submissions every day while the automation that was built to eliminate that exact labor sits in version control, executing nothing, waiting for a human to press a button that a human has not pressed.

## The fun boundary

Every project in this graveyard died at the same moment. Not when the code broke. Not when the money ran out. The exact second that discovery became maintenance. The transition from "I wonder if I can" to "I now have to."

The cron job never crossed this boundary. Thirty-seven characters produce no maintenance surface. The note app never crossed it. The triangle crossed it at the precise moment of perfection. The trading bot crossed it when I opened the CSV of cumulative losses and saw a number my brain refused to process. The container runtime crossed it approximately four hours in, when I understood with the clarity of a religious experience that I was about to have to implement a TCP stack from scratch and I was not going to do that.

I will start a forty-ninth project this week. It will also die at the fun boundary. The graveyard is not evidence that I am bad at finishing things. The graveyard is evidence that I am exceptionally good at starting them. The starting is the compulsion. The finishing was never the point.