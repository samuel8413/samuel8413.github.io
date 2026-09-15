# 0005. Ship a strict Content Security Policy as a meta tag

Status: accepted. Date: 2026-09-14.

## Context

GitHub Pages does not allow custom HTTP response headers, so the usual place for a CSP is unavailable. A `<meta http-equiv>` policy is the only option, and it has limits: `frame-ancestors`, `report-uri` and `sandbox` are ignored there.

Astro 7 hashes every script and style it emits when `security.csp` is enabled. Two things are not covered automatically: hand-written `is:inline` scripts and inline `style` attributes.

## Options

1. **No CSP.** Simplest. Leaves XSS mitigation entirely to the absence of user input.
2. **Permissive CSP** with `'unsafe-inline'`. Looks like a policy, protects against little.
3. **Strict hashed CSP** via Astro, with the one inline script (theme bootstrap, which must run before first paint) hashing itself and registering through `Astro.csp.insertScriptHash`.

## Decision

Option 3. Policy: `default-src 'none'`, `img-src 'self' data:`, `base-uri 'none'`, `form-action 'none'`, `object-src 'none'`, `upgrade-insecure-requests`, plus Astro's hashed `script-src` and `style-src`.

Supporting choices:

- Responsive image markup uses data attributes rather than inline styles, so no `style-src-attr` exception is needed.
- System fonts, so no `font-src`.
- No analytics or third-party embeds.
- The e2e suite loads the built site, exercises the interactive paths and fails on any CSP violation logged to the console.

## Consequences

- Adding an external script, font or image origin requires a deliberate edit to `astro.config.ts`. That friction is the point.
- Adding another inline script requires registering its hash the way `BaseLayout.astro` does.
- Clickjacking protection (`frame-ancestors`) is not available on Pages; the risk is low for a read-only page.
