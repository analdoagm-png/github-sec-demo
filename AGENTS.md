<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project overview

Security Findings — a GitHub Advanced Security–style dashboard (Next.js
App Router + TypeScript, plain CSS Modules, no Tailwind). Scaffolded
from a Figma file (`portfolio-sourcefile`, file key
`ti7TCH6aLLutT4OIAvSQec`) and pushed to `analdoagm-png/github-sec-demo`
on GitHub.

## Routes

- `/` — Services (landing page): KPI stat cards + a services table.
- `/findings` — Findings: a paginated, filterable findings table.
- Both routes share the same navbar, filter panel, and pagination.

## Structure

- `app/globals.css` — design tokens (colors, spacing, type scale,
  shadows) as CSS custom properties, extracted from Figma. Also the
  Inter font hookup and the base reset.
- `app/shared.module.css` — chrome shared by every page: navbar, page
  shell, filter header/tags, table scaffolding, pagination. The
  responsive breakpoints are documented once in a comment at the top
  of this file (tablet ≤1024px, mobile ≤700px) — keep new breakpoints
  consistent with it rather than inventing new numbers per file.
- `app/components/Navbar.tsx` — nav links with active-route
  highlighting via `usePathname`.
- `app/components/Pagination.tsx` — reusable page / page-size controls.
- `app/components/FilterPanel.tsx` (+ `.module.css`) — the right-side
  slide-over filter panel: overlay, fixed header/footer, scrollable
  body, tree checkboxes with parent/child "select all" + indeterminate
  state.
- `app/lib/filters.ts` — the filter taxonomy (State / Severity / SLA
  Status / Exception Status) and the `matchesFilters` predicate both
  pages use to filter their dummy rows.
- `app/lib/owners.ts` — the shared pool of service/team names both
  pages draw from, so the same services show up consistently
  everywhere.
- `app/page.tsx` + `page.module.css` — Services page.
- `app/findings/page.tsx` + `page.module.css` — Findings page.
- `public/icons/` — SVGs/PNGs downloaded from Figma asset URLs (those
  URLs expire ~7 days after being fetched — re-download from Figma if
  an icon needs to change rather than hand-editing the SVGs).

## Conventions

- No Tailwind — style with CSS Modules plus the custom properties in
  `globals.css`. Reuse a `shared.module.css` class before adding a new
  page-specific one.
- Treat `DESIGN.md` as the UI consistency reference. Keep it synchronized
  whenever changing design tokens, shared visual patterns, responsive rules,
  accessibility treatments, or component styling conventions.
- Table data is generated from small template pools (see
  `buildFindings` / `buildServices` in each page), not hand-duplicated
  rows. Keep content generic/fictional (no real vendor or tool names)
  since this repo is public — a past pass already replaced Figma's
  placeholder text for this exact reason.
- On mobile, table rows collapse from a grid into cards with a
  severity-colored left edge (the `--row-accent` CSS variable set
  inline per row) and inline mobile-only labels (`shared.mobileLabel`)
  standing in for the column headers that get hidden.
- Severity is Critical/High/Moderate/Low/Informational everywhere
  (`--color-severity-*` tokens) — this must match `app/lib/filters.ts`
  exactly since the panel filters on these values.

## Commands

- `npm run dev` — dev server (use the browser preview tools to run
  and check it, not raw Bash)
- `npx tsc --noEmit` — typecheck
- `npx eslint app/` — lint
