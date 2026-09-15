# Architecture

This document explains how the site is put together and why. Individual decisions with alternatives considered live in [`adr/`](adr/).

## The problem being solved

Present one person's professional profile as a fast, accessible, indexable static page on GitHub Pages, from data that is regenerated from LinkedIn over time. The site must be cheap to keep correct: a content edit should not require touching components, and a mistake should fail before it is published.

Everything below follows from those constraints. Anything that does not serve them was left out.

## Layers

```
content/*.json  ──▶  domain/schema (Zod)  ──▶  domain/normalize  ──▶  data/profile.ts  ──▶  components  ──▶  HTML
   raw input          validate shape          canonical model       composition root      presentation
```

### 1. Content (`content/`)

Two JSON files with different owners and lifecycles:

- `profile.json` mirrors the LinkedIn export. It can be regenerated wholesale.
- `site.config.json` holds editorial decisions that are _about_ the profile but are not in it: how skills are grouped, which numbers to headline, privacy switches, metadata. It survives a profile regeneration.

Keeping them separate is what makes "update from LinkedIn" a safe operation.

### 2. Domain (`src/domain/`)

Pure TypeScript with no Astro or browser dependency. This is where correctness lives, and it is unit tested at ~97% coverage.

- `schema/` describes the raw files with Zod. Objects are strict (unknown keys fail), empty strings become `undefined`, URLs and emails are checked, and every date string is parsed into a `PartialDate`.
- `dates.ts` models dates with their real precision ("2013", "Oct 2024", "Oct 5, 2024") instead of coercing to `Date`, which would invent a day and a time zone.
- `experience.ts` is the adapter for the three description shapes LinkedIn produces, groups consecutive roles at one company into a tenure, and splits the timeline at a configurable career pivot.
- `skills.ts` projects the flat skill list onto the editorial taxonomy and reports what is unmapped or stale.
- `normalize.ts` assembles the canonical `Profile`. Deterministic: no clock, no IO.
- `audit.ts` produces editorial findings (missing name, no contact channel, unmapped skill). Findings are warnings in development and blocking errors in the deploy workflow.

Components never touch the raw JSON. They receive the canonical model.

### 3. Data (`src/data/profile.ts`)

The composition root. It is the single module that imports the JSON files, runs the schemas, normalises, logs audit findings and exports `profile`, `siteConfig` and `buildDate`. Astro evaluates it once per build.

### 4. Presentation (`src/components/`, `src/layouts/`, `src/pages/`)

Astro components, organised by role:

- `ui/` primitives with no domain knowledge (`Section`, `Badge`, `DateRange`, `ExternalLink`, `Icon`).
- `experience/` the timeline pieces (`CompanyTenure`, `PositionItem`).
- `sections/` one component per page section. Each renders nothing when its data is empty.
- `resume/` the printable document rendered at `/cv/` from the same model, with its own point-sized stylesheet ([ADR 0007](adr/0007-dedicated-resume-route.md)).
- `layout/` header, footer, theme toggle, skip link.
- `seo/` metadata and JSON-LD.

`pages/index.astro` and `pages/cv.astro` are composition only. It derives the navigation from the same list that decides which sections render, so the two cannot drift.

Styling uses scoped component styles plus a small token sheet (`styles/tokens.css`) with two layers: a primitive palette and semantic roles that flip with the theme. Components only reference semantic roles.

## Cross-cutting concerns

### Type safety

Strict TypeScript with `noUncheckedIndexedAccess` and `erasableSyntaxOnly` (so Node can run the scripts without a build step). Zod schemas are the source of the raw types; the canonical model is hand-written so that it reads as a domain, not as a JSON shape. `astro check` type-checks templates.

### Performance

Astro emits static HTML with no framework runtime. The two small scripts (theme toggle, print helper) are bundled and hashed. The portrait is the LCP element: it is emitted as AVIF/WebP/JPEG at four widths with `fetchpriority="high"`, and the source asset is pre-scaled to 1200 px with metadata stripped. Stylesheets under Astro's threshold are inlined. Fonts are the system stack, so there are no font requests at all.

Code splitting and lazy loading, as usually understood, apply to client-side applications. Here the equivalent decisions are: no client framework, per-page CSS, and `<details>` for lower-priority content instead of JavaScript. This is documented in [ADR 0003](adr/0003-no-client-framework.md).

### Accessibility

Landmarks (`banner`, `nav`, `main`, `contentinfo`), one `h1`, sections labelled by their headings, a skip link, visible focus styles, `aria-pressed` on the theme toggle, screen-reader text on external links, `role="list"` where `list-style: none` would otherwise remove semantics in Safari, reduced-motion support, and colour tokens kept at or above 4.5:1. The e2e suite runs axe with WCAG 2.2 AA tags in both colour schemes and fails on any violation.

### SEO

Title template, description trimmed to a word boundary under 160 characters, canonical URL, Open Graph and Twitter cards with a fixed-size social image, schema.org `Person` JSON-LD built from the domain model, sitemap, robots.txt. Canonical and Open Graph URLs are only emitted when a site URL is configured, so a local build never advertises a wrong origin.

### Security

GitHub Pages cannot set HTTP headers, so the CSP is a meta tag. Astro hashes every script and style it emits; the one hand-written inline script (theme bootstrap, which must run before first paint) computes its own hash at build time and registers it. The policy is `default-src 'none'` with explicit allowances; no `unsafe-inline`. External links carry `rel="noopener noreferrer"`. JSON-LD is serialised with `<` escaped. There are no third-party scripts and no analytics. See [ADR 0005](adr/0005-csp-on-github-pages.md).

### Deployment

Two workflows. `ci.yml` runs on pushes and PRs: content check, lint, format, types, unit tests with coverage, build, then Playwright against the built artefact. `deploy.yml` runs on `main`, monthly, and on demand: it calls `ci.yml`, runs the content audit in strict mode, builds with the URL and base path resolved by `actions/configure-pages`, and deploys. See [ADR 0004](adr/0004-github-pages-deployment.md).

## Testing strategy

| Layer         | Tool                            | What it proves                                                                                                                   |
| ------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Domain        | Vitest                          | Parsing, normalisation, grouping, audit rules. Also contract tests against the real `content/` files.                            |
| Rendered site | Playwright + axe                | No WCAG 2.2 AA violations, landmarks, metadata, JSON-LD, robots/404, CSP without violations, theme persistence, print behaviour. |
| Static        | `astro check`, ESLint, Prettier | Template types, a11y lint rules, style.                                                                                          |

There are no component snapshot tests on purpose. The domain is where logic lives; the templates are exercised end to end where their behaviour is observable.

## Extending

- **New section**: add the data to `profile.json`, extend the schema and model, add a `sections/` component, register it in `index.astro`. Nothing else changes.
- **New skill**: add it on LinkedIn, regenerate the export, and `content:check` will tell you which group it needs in `site.config.json`.
- **Second language**: Astro's i18n routing and a `content/profile.<lang>.json` would slot in at the data layer. Not done now because there is one audience.
- **Web fonts**: Astro's `fonts` API self-hosts at build time and keeps the CSP intact. Not done now because the system stack costs nothing.

## Tooling notes

- **Node 24** is pinned in `.nvmrc` and `engines`. Astro 7 needs 22.12+; the Astro ESLint parser needs 22.22.3+ or 24.16+. Node 24 also runs `scripts/*.ts` natively (type stripping), which is why the domain uses explicit `.ts` import extensions and `erasableSyntaxOnly`.
- **ESLint 10** with `typescript-eslint` strict type-checked rules and `eslint-plugin-astro` (recommended + jsx-a11y strict). `eslint-plugin-jsx-a11y` still declares a peer range ending at ESLint 9; the `overrides` entry in `package.json` aligns it with the installed ESLint. Remove the override once the plugin publishes a release that lists ESLint 10.
- **Prettier** with the Astro plugin formats everything; ESLint does not enforce style.
- **Vitest** for the domain, **Playwright** for the built site. Playwright runs `astro preview` as its web server on port 4173.
- **Dependabot** groups Astro packages and tooling separately, weekly.
