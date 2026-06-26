+++
date = '2021-11-01T14:00:00+05:30'
draft = false
title = '47 Dead Projects and the Exact Moment Each One Died, Fuck You'
tags = ['Meta', 'Projects']
+++

I have 47 unfinished projects. I counted them last night while avoiding actually finishing any of them. This is not a post about what I learned. This is a graveyard tour. Bring a shovel.

## The Cat Social Network

Instagram but only cats. I was 15 and thought this was a billion dollar idea. I built the auth system. Spent 3 weeks on password hashing because I wanted to implement bcrypt from scratch instead of importing a library. Realized I needed a mobile app. Googled "how to make an android app." Saw the word Gradle. Closed the tab. catbook-final-FINAL-v2 still exists in a folder somewhere.

## The Trading Bot

```python
def should_buy(price): return price < yesterday_price
def should_sell(price): return price > yesterday_price
```

It lost money. I added more indicators. It lost money more confidently. I added machine learning. It lost money faster while consuming more API credits. I was paying $50 a month to lose $20 a month. I stopped.

## The Docker Replacement

A container runtime in pure Bash because Docker was "too bloated" and I was 16 and had just discovered UNIX philosophy and thought everything could be a shell script.

```bash
chroot $1 /bin/sh
```

It ran `echo hello` beautifully. Everything else segfaulted. I spent 2 weeks debugging why `ls` didn't work. Containers are hard. Who knew.

## The Various Web3 dApps

Uniswap clones. Every single one. Different color schemes. One had a DAO. The DAO had two members: me and my alt account.

## The Note Taking App That Still Works

```bash
echo "$(date): $@" >> notes.txt
```

A shell one-liner. The most successful software I have ever written. I use it every day. 37 characters of code. Zero maintenance. Three years running.

## The Game Engine

12,000 lines of C++ to render a single triangle.

```cpp
drawTriangle(0, 0, 1, 0, 0, 1);
```

The triangle was beautiful. I never made a game.

## The One That Shipped

```python
#!/usr/bin/env python3
api.update_status("i am alive")
```

A cron job that tweets this every day. 1,095 tweets. Zero bugs. Zero maintenance. The best software is software you forget exists.

## The Bodies

The next project will also die at the fun boundary. So will the one after that. That cron job ran for 3 years without an issue and I don't know what that means and I'm not going to pretend I do.
