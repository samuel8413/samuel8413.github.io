# 0007. Render the résumé as its own route from the same domain model

Status: accepted. Date: 2026-09-14. Supersedes [0006](0006-print-stylesheet-for-pdf.md).

## Context

The site is a portfolio: long, sectioned, visual. A résumé is a document: one column, dense, classic order, one or two pages, no chrome. Trying to get the second from the first with `@media print` gave a result that was obviously a website printout.

## Options

1. **Heavier print CSS on the home page.** Cannot reorder sections, change wording ("Get in touch"), or collapse older roles to one line. Every visual tweak to the site risks the print output.
2. **Generate a PDF in CI** with headless Chromium from a print-tuned page. Still needs that page; adds an artefact to keep in sync.
3. **A second presentation of the same model**: `/cv/` renders `ResumeDocument` from the canonical `Profile` with its own components and stylesheet, sized in points and inches so screen preview and paper match. The header's "Save as PDF" links to `/cv/?print`, which opens the print dialog on arrival.

## Decision

Option 3. What differs from the web page is presentation policy, so it lives in `site.config.json` under `resume`: show or hide the portrait (off by default, since practice varies by market), summary override, how many recent tenures get bullets (older ones become one line each), and which optional sections appear.

Page fit is enforced by a Playwright test that measures the print-media height at Letter width against a two-page budget, and by break rules that never split a bullet or separate a heading from its first line while still allowing a long tenure to span pages.

The route is `noindex` and excluded from the sitemap: the home page stays the canonical presentation.

## Consequences

- One data source, two views. Adding a field means touching the model once and deciding per view whether it belongs on paper.
- The result reads as a résumé: two pages, no site chrome, clickable links without URL clutter, ATS-friendly single column.
- Two stylesheets to maintain, but each is small and owns a single purpose. The home page's `print.css` is now page-scoped and minimal.
- No PDF artefact is stored; the browser produces it. If a hosted file becomes a hard requirement, a CI step can print `/cv/` with Playwright and publish it alongside the site.
