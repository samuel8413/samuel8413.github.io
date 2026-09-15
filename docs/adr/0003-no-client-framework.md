# 0003. Ship no client-side UI framework

Status: accepted. Date: 2026-09-14.

## Context

The brief asked for componentisation, code splitting, lazy loading and rendering best practices. Those are usually framed in terms of a client-side framework. The page has exactly two interactive behaviours: a theme toggle and "save as PDF".

## Options

1. **React islands** for the interactive pieces. Demonstrates the owner's primary stack, at the cost of shipping React (~45 kB) for a button.
2. **Vanilla TypeScript in Astro `<script>` tags.** Astro bundles and hashes them; no runtime.
3. **No JavaScript at all.** Theme would follow the system only; printing would rely on the browser menu.

## Decision

Option 2. Components are Astro components (server-rendered, scoped styles). The theme toggle and print helper are small TypeScript modules.

The requirement is met in the form that fits a static page:

- _Componentisation_: `ui/`, `sections/`, `experience/`, `layout/`, `seo/` with typed props and no domain knowledge in primitives.
- _Code splitting_: per-page CSS, scripts hoisted and bundled by Astro; nothing is loaded that the page does not use.
- _Lazy loading_: images below the fold would lazy-load by default; the portrait is deliberately eager because it is the LCP element. Lower-priority text (earlier career, responsibilities) is behind native `<details>`.
- _Rendering_: everything renders at build time; the browser receives finished HTML.

## Consequences

- Near-zero JavaScript, which is the single biggest lever for performance and CSP simplicity.
- If a genuinely interactive feature appears (say, a filterable project grid), Astro islands allow adding a framework for that component only. The decision is reversible at component granularity.
- A reviewer looking for React in the repository will not find it; the ADR is the answer.
