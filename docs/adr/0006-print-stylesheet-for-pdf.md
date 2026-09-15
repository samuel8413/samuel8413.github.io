# 0006. Use a print stylesheet instead of generating a PDF

Status: superseded by [0007](0007-dedicated-resume-route.md). Date: 2026-09-14.

## Context

Recruiters ask for a PDF. Options ranged from committing a PDF to generating one at build time.

## Decision (original)

Restyle the home page with a print stylesheet and let `window.print()` produce the PDF.

## Why it was superseded

Printing the home page produced six and a half pages that read as a printed website: section eyebrows, metric cards, skill chips, a large portrait, a contact section and a footer. Print CSS can hide and compact, but it cannot reorder content, change headings or restructure a layout built for scrolling. A shareable résumé needs its own document structure. See ADR 0007.

The print stylesheet remains as a fallback for people who press Ctrl+P on the home page, scoped to that page only.
