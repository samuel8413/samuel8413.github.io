# 0002. Validate LinkedIn-shaped JSON with Zod and normalise into a domain model

Status: accepted. Date: 2026-09-14.

## Context

The source data is a LinkedIn export with irregularities that are the export's, not the owner's:

- position descriptions come in three shapes (plain string, `{intro, bullets}`, `{responsibilities, key_achievements}`);
- dates come in three precisions ("2013", "Oct 2024", "Oct 5, 2024");
- "not provided" is an empty string;
- skills are a flat list of 36 LinkedIn labels, some verbose ("Python (Programming Language)").

The owner will regenerate this file from LinkedIn. Editorial choices (skill grouping, headline numbers, privacy) must survive that.

## Options

1. **Hand-normalise the JSON once** into a clean shape and render it directly. Fast now, but every regeneration re-does the manual work, and there is no validation.
2. **Render the raw shape directly** with conditionals in templates. Spreads the irregularities across every component.
3. **Schema + adapter.** A Zod schema accepts the export as it is (strict objects, union for descriptions, date parsing, empty-to-undefined). A pure normaliser produces one canonical model. Editorial choices live in a second file with its own schema.

## Decision

Option 3. `content/profile.json` (data) and `content/site.config.json` (editorial) are validated by `src/domain/schema/*` and normalised by `src/domain/normalize.ts`. Components only see the canonical `Profile`.

Dates are modelled as `PartialDate { year, month?, day? }` rather than `Date`, so precision is preserved for `<time datetime>` and labels.

Completeness problems (empty name, no contact channel, a skill not in any group) are _audit findings_, not schema errors: they warn in development and block only the production deployment. This lets the site be built before the export is complete without ever publishing a placeholder.

## Consequences

- Regenerating the export is a copy-paste; the build tells you what, if anything, needs an editorial decision.
- The domain is framework-free and unit tested, including contract tests against the real content files.
- Two files to edit instead of one. The split is documented in `docs/CONTENT.md`.
- Zod runs at build time only; nothing ships to the browser.
