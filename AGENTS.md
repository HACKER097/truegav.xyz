# AGENTS.md

## Project

Hugo blog with minimal dark theme. Monospace everything (JetBrains Mono).

## Commands

```bash
hugo                          # build site
node scripts/shikify.mjs      # highlight code blocks (run after hugo)
```

Always run both after changes. Shiki overwrites Hugo's code output.

## Structure

```
content/posts/          # markdown posts
themes/minimal/         # theme (layouts + CSS)
scripts/shikify.mjs     # post-build syntax highlighting
scripts/slate-xp-extra.json  # shiki theme file
public/                 # generated output (gitignored)
```

## Design System

### Colors (Slate XP Extra)

Do NOT change the palette. These are locked in.

```
bg:        #161a1e    fg:        #e0e4dc
grey:      #8a9490    grey_dim:  #4a5450
surface:   #1c2128    border:    #2a323c
```

Accents: amber, teal, blue, green, red, purple, coral, orange, cyan.
See `:root` in `style.css` for hex values.

### Typography

- Font: JetBrains Mono (monospace only)
- Body: 16px, line-height 1.75
- h1: 1.75rem, weight 700, line-height 1.15
- h2: 0.85rem, weight 700, uppercase, letter-spacing 0.08em, color green
- h3: 0.9rem, weight 700, color blue
- Dates/metadata: 0.75-0.8rem, grey_dim, tabular-nums

### Spacing

4px base scale: sp-1 (4), sp-2 (8), sp-3 (12), sp-4 (16), sp-6 (24), sp-8 (32), sp-12 (48), sp-16 (64).

### Transitions

All transitions: `0.1s` (fast, almost instant). No easing unless specific reason.

## UI Rules

These are non-negotiable. Read before making changes.

1. **One hover interaction per element.** Never have competing hover states (e.g. color change AND position shift on different targets within the same row).

2. **Visual hierarchy must be preserved on hover.** If a row has a date and title, only the title changes color on hover. Date stays dim.

3. **No underlines on links.** Links change color only. Content links use a subtle bottom border instead.

4. **No gimmicks.** No glitch effects, no noise textures, no typing animations, no ASCII art, no terminal prompts, no blinking cursors.

5. **Borders are structural, not decorative.** They separate content, not decorate it.

6. **Color accents are intentional.** Green = structural (h2, logo hover). Blue = h3. Cyan = interactive hover. Amber = inline code. Red = keywords. Other accents for syntax only.

7. **Keep it monospace.** The whole site is one font. Don't introduce other fonts.

## CSS Location

Source: `themes/minimal/static/css/style.css`
Generated: `public/css/style.css` (do not edit directly)

## Content

Posts go in `content/posts/`. Each post is a directory with `index.md`. Hugo builds them to `public/posts/`.
