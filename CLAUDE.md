# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000 (Turbopack)
npm run build    # Production build
npm run start    # Start production server (requires build first)
```

No linter or test runner is configured yet.

## Architecture

Next.js 16 App Router project. All pages and components live under `app/`.

**Routing:**
- `app/page.js` — home page (single scroll page)
- `app/secret/page.js` — `/secret` route, LV.5-only ascension page (client component; reads localStorage to gate access)
- `app/layout.js` — root layout, loads Inter font, wraps everything in `LevelProvider`, renders `LevelBadge` globally

**Global state — LevelContext (`app/context/LevelContext.js`):**
Tracks completed quest IDs in localStorage (`mk_quest_completed`). SSR-safe: initializes to `[]` on both server and client, hydrates in `useEffect`, exposes `mounted` flag so components avoid rendering stale state. Also exposes `activeChallenge` / `setActiveChallenge` so `FlappyBird` yields keyboard events while a quest challenge is focused.

**Components:** All UI lives in `app/components/`. Each has a co-located CSS Module.

**Client vs Server components:** Add `'use client'` only when a component needs hooks or browser APIs. Most interactive components (Nav, AgeCounter, QuestBoard, FlappyBird, LevelBadge, Contact, Projects) are client components.

**Styling:** Global CSS variables (colors, radii, typography) and shared utility classes (`.gradient-text`, `.btn`, `.section-tag`, `.fade-in`) live in `app/globals.css`. Component-specific styles use CSS Modules. Color palette centers on purple (`--purple-300` through `--purple-900`) on a near-black background (`--bg-base: #060608`).

**Page sections (top to bottom):**
1. `Nav` — fixed, blurs on scroll
2. `Hero` — intro, live age counter (`AgeCounter.js`, birth date `2001-10-15`)
3. `Projects` — data array at top of `Projects.js`; add new projects there
4. `QuestBoard` — Solo Leveling-style quest system with 5 inline challenges (see below)
5. `FlappyBird` — canvas RAF game, leaderboard in localStorage (`mk_flappy_lb`)
6. `Contact` / `Footer`

**Quest system (`QuestBoard.js`):**
Five challenges rendered as accordion cards, all challenge components live in the same file:
- `SpacebarChallenge` — press Space 25× (focused `<div>`, not `window`, to avoid FlappyBird conflict)
- `TypingChallenge` — type a random phrase; spaces rendered as `\u00A0` in display spans so they have visible width inside the flex container
- `ReactionChallenge` — click circle within 700ms, 3 rounds
- `SequenceChallenge` — watch 4 tiles flash, repeat order; animation uses recursive `setTimeout` chain with a `cancelled` closure flag for cleanup
- `KonamiChallenge` — enter `↑↑↓↓←→←→` (focused `<div>`)

Completing all 5 sets level to 5, triggers unlock banner and enables the `/secret` route. Progress stored in `localStorage` as `mk_quest_completed` (array of IDs).

**LevelBadge (`app/components/LevelBadge.js`):** Fixed bottom-right, shows LV.X and XP bar. At LV.5 pulses and shows "Ascend →" link to `/secret`.

**FlappyBird keyboard conflict:** `FlappyBird.js` reads `activeChallenge` from `LevelContext` and skips Space/ArrowUp handling when it is non-null.

**AgeCounter:** Displays total days and current minutes (totalMinutes % 60). Uses `Fragment` with `key` prop to avoid the React unique-key warning from adjacent elements in a map.

## Git & GitHub

Remote: `https://github.com/MeieKoning/Portfolio` (branch `main`). Always commit and push meaningful changes with clean, descriptive commit messages.
