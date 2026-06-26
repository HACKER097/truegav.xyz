+++
date = '2021-11-01T14:00:00+05:30'
draft = false
title = '47 Corpses in My Github and Counting'
tags = ['Meta', 'Projects', 'Failure', 'Graveyard']
+++

I have 47 unfinished projects. I counted. I will have 48 by next week. This is not a post about lessons learned. This is a museum.

# The Social Network For Cats

**What it was supposed to do:** Instagram but only cats. The cats would post photos. Other cats would like them. I was 15 and thought this was a billion-dollar idea.

**What happened:** I built the auth system. Spent 3 weeks on password hashing. Realized I needed a mobile app. Didn't know mobile development. Abandoned in a folder called `catbook-final-FINAL-v2`.

**The exact moment it died:** When I Googled "how to make an android app" and saw the word "Gradle."

# The Trading Bot That Would Make Me Rich

```python
# The entire trading strategy
def should_buy(price):
    return price < yesterday_price  # genius

def should_sell(price):
    return price > yesterday_price  # also genius
```

**What happened:** It lost money. Consistently. I added more indicators. It lost money more confidently. I added machine learning. It lost money faster.

**The exact moment it died:** When I calculated the API costs and realized I was paying $50/month to lose $20/month.

# The CLI That Would Replace Docker

**What it was supposed to do:** A container runtime in pure Bash. Because Docker was "too bloated." I was 16 and had just discovered UNIX philosophy.

**What happened:** It worked for exactly one use case (running `echo hello`). Any real program would crash with a segfault. I spent 2 weeks debugging why `ls` didn't work.

```bash
# The entire runtime
chroot $1 /bin/sh
```

Turns out containers are hard. Who knew.

# Projects 4-12: Various Web3 "Revolutionary" Dapps

All of them were Uniswap clones with a different color scheme. One had a DAO. The DAO had 2 members: me and my alt account.

# The Note-Taking App That Would Beat Notion

It was a markdown file.

```bash
echo "$(date): $@" >> notes.txt
```

It worked great. I still use it. This is the most successful project I've ever built and it's a shell one-liner.

# The Game Engine

I wrote a game engine. Then I realized I didn't want to make games. I wanted to write a game engine. The engine had 12,000 lines of C++ and it rendered a triangle. A single triangle.

```cpp
// 12,000 lines of framework for this
drawTriangle(0, 0, 1, 0, 0, 1);
```

The triangle was beautiful. I never made a game.

# The Pattern

Every project dies at the same point: right after the fun part ends. The fun part is architecture, core logic, the first prototype. The boring part is error handling, edge cases, documentation, deployment, marketing, support.

I have 47 fun parts and zero finishing parts.

```python
projects = 47
finished = 0
ratio = finished / projects  # 0.0
print("this is fine")
```

# The One That Actually Shipped

A cron job that tweets "i am alive" every day. 47 lines of Python. Deployed once. Never touched again.

```python
#!/usr/bin/env python3
import tweepy
import os

api = tweepy.API(os.environ["TWITTER_AUTH"])
api.update_status("i am alive")
```

It ran for 3 years. 1,095 tweets. Zero bugs. Zero features added. Zero maintenance.

The best software is the software you forget exists.

# The Bodies

I'm not going to fix this. I know myself well enough to know that the next project will also die at the fun boundary. The one after that too.

But that cron job. It ran for 3 years without a single issue.

I don't know what that means. I'm not going to pretend I do.
