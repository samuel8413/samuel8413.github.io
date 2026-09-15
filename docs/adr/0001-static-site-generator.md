# 0001. Use Astro as a static site generator

Status: accepted. Date: 2026-09-14.

## Context

The site is one page of mostly static content that must score well on performance, accessibility and SEO, and deploy to GitHub Pages (static files only). The owner's professional stack is React and Next.js, so the temptation was to reach for those.

## Options

1. **Vite + React SPA.** Familiar stack. Needs a prerender step for SEO, ships a runtime for content that never changes, and pushes toward client-side patterns (code splitting, lazy loading) that solve problems this page does not have.
2. **Next.js static export.** Also familiar. Heavier toolchain and framework for a single static page; image optimisation needs a custom loader on static hosts.
3. **Astro.** Static HTML by default, first-class image optimisation, built-in CSP hashing, sitemap integration, scoped styles, TypeScript templates checked by `astro check`. Islands are available if interactivity is ever needed.
4. **Hand-written HTML.** Simplest possible, but content would live in markup, with no validation and no image pipeline.

## Decision

Astro 7, with zero UI framework integrations.

## Consequences

- Lighthouse-class performance without effort: no hydration, no runtime.
- Content lives in JSON and is validated; markup is generated.
- Contributors need to learn Astro's component syntax, which is close to JSX and HTML.
- Astro 7 requires Node 22.12+. The project pins Node 24 via `.nvmrc`.
- Choosing a tool other than the owner's daily stack is itself a signal: pick the tool that fits the problem.
