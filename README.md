# Engineer portfolio

A resume and portfolio site, statically generated with [Astro](https://astro.build) and deployed to GitHub Pages. The content is a LinkedIn-shaped JSON export; the site is the presentation layer around it.

It is also meant to be read as code. The architecture, tests and CI are intentionally the kind you would want on a much larger project, scaled down to what a single page needs. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and the [decision records](docs/adr/).

## What you get

- Static HTML, zero client-side framework. The only JavaScript is a theme toggle and a print helper.
- Content validated at build time with Zod. A typo in the JSON fails the build with a readable message.
- Strict Content Security Policy shipped as a meta tag, with every script and style hashed.
- WCAG 2.2 AA verified by axe in CI, in light and dark mode, on desktop and mobile.
- Responsive AVIF/WebP portrait, JSON-LD `Person`, Open Graph, sitemap, robots.txt, canonical URLs.
- A printable résumé at `/cv/`: same data, laid out as a two-page document. "Save as PDF" opens it with the print dialog ready.
- One workflow for pull requests, one for production. Production reuses the PR checks and adds a strict content audit.

## Quick start

Requirements: Node 24 (`.nvmrc`) and npm 10.

```sh
npm ci
npm run dev          # http://localhost:4321
```

Before opening a pull request:

```sh
npm run validate     # content audit, lint, format, types, unit tests
npm run build
npm run test:e2e     # Playwright + axe against the built site (first time: npx playwright install chromium)
```

## Editing your content

Two files, both under `content/`:

| File               | What it is                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `profile.json`     | Your LinkedIn-shaped data: contact, headline, summary, positions, education, skills, certifications |
| `site.config.json` | Editorial choices: headline numbers, skill grouping, privacy switches, site metadata                |

Run `npm run content:check` after editing. It validates the schema and lists editorial findings. The deployment runs the same check in `--strict` mode and refuses to publish while blocking errors remain (for example an empty name or no contact channel). Full guide: [docs/CONTENT.md](docs/CONTENT.md).

Replace the portrait at `src/assets/headshot.jpg` (square, at least 1200 px). Astro generates the responsive variants.

The résumé view has its own knobs under `resume` in `site.config.json`: portrait on or off, summary override, how many recent roles get bullet points, and which optional sections appear on paper.

## Deploying to GitHub Pages

1. Push the repository to GitHub.
2. In **Settings > Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the _Deploy to GitHub Pages_ workflow manually).

The workflow resolves the site URL and base path from GitHub, so it works unchanged for `<user>.github.io`, `<user>.github.io/<repo>/` and custom domains. It also rebuilds monthly so "Present" tenures stay accurate. Details and troubleshooting: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Scripts

| Script                      | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `dev` / `build` / `preview` | Astro dev server, production build, serve `dist/` |
| `check`                     | Type-check TypeScript and Astro templates         |
| `lint` / `lint:fix`         | ESLint (TypeScript strict, Astro, jsx-a11y)       |
| `format` / `format:check`   | Prettier                                          |
| `test` / `test:coverage`    | Vitest unit tests for the domain layer            |
| `test:e2e`                  | Playwright: accessibility, SEO, CSP, interactions |
| `content:check[:strict]`    | Validate and audit `content/*.json`               |
| `validate`                  | Everything above except the build and e2e         |

## Project layout

```
content/            Your data. The only files you edit routinely.
src/domain/         Framework-free model, schemas, normalisers. Unit tested.
src/data/           Composition root: loads, validates and exposes typed content.
src/seo/            JSON-LD and metadata helpers.
src/components/     Astro components (ui, layout, sections, experience, resume, seo).
src/layouts/        Document shell.
src/pages/          Routes: index, cv (printable résumé), 404, robots.txt.
src/styles/         Design tokens, global styles, résumé and home-page print styles.
scripts/            CLI tools (content validation).
tests/unit, e2e/    Vitest and Playwright suites.
docs/               Architecture, ADRs, content and deployment guides.
```

## License

Code is MIT. Profile text and portrait are personal data of the owner and are not licensed for reuse. See [LICENSE](LICENSE).
