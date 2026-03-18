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

**Routing:** `app/page.js` is the single page (home). `app/layout.js` is the root layout — it loads the Inter font and `globals.css`.

**Components:** All UI lives in `app/components/`. Each component has a co-located CSS Module (`ComponentName.module.css`) for scoped styles.

**Client vs Server components:** Components are server components by default. Only add `'use client'` when the component needs browser APIs or React hooks. Currently only `Nav`, `AgeCounter`, `Projects`, and `Contact` are client components (scroll listeners, `useEffect`, `IntersectionObserver`).

**Styling approach:** Global CSS variables (colors, spacing, radii, typography) are defined in `app/globals.css`. Shared utility classes (`.gradient-text`, `.btn`, `.section-tag`, etc.) are also in `globals.css` and used directly in JSX. Component-specific styles use CSS Modules.

**Age counter:** `AgeCounter.js` computes elapsed time from a hardcoded birth date (`2001-10-15T00:00:00`) using `Date.now()` and ticks every second via `setInterval`. The initial state is `'—'` to avoid hydration mismatches — values populate on mount.

**Projects data:** The project list is a plain array at the top of `app/components/Projects.js`. Add new projects there; no external data source.

## Git & GitHub

Remote: `https://github.com/MeieKoning/Portfolio` (branch `main`). Always commit and push meaningful changes with clean, descriptive commit messages.
