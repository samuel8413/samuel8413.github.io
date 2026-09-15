# 0004. Deploy with GitHub Actions and resolve URLs from `configure-pages`

Status: accepted. Date: 2026-09-14.

## Context

GitHub Pages serves a repository as either `https://<user>.github.io/` (user site, base `/`) or `https://<user>.github.io/<repo>/` (project site, base `/<repo>/`), or under a custom domain. Astro needs `site` and `base` at build time to emit correct canonical URLs, sitemap, asset paths and `robots.txt`. Hard-coding them couples the code to a repository name.

## Options

1. **Hard-code `site` and `base`** in `astro.config`. Breaks on rename, fork, or custom domain.
2. **Branch-based Pages** (`gh-pages` branch). Requires committing build output and a `.nojekyll`; no environment protection.
3. **GitHub Actions with `actions/configure-pages`**, which exposes `origin` and `base_path` for whatever the repository's Pages settings resolve to. Feed those to the build via `SITE_URL` and `BASE_PATH`.

## Decision

Option 3. `astro.config.ts` reads `SITE_URL` and `BASE_PATH` (empty means unset) and normalises the base to a trailing slash. Locally both are empty: base is `/` and canonical/Open Graph URLs are simply omitted.

The deploy workflow:

- calls the CI workflow (`workflow_call`) so production cannot skip a check PRs must pass;
- runs the content audit in `--strict` mode, refusing to publish placeholders;
- builds, uploads with `upload-pages-artifact`, deploys with `deploy-pages` under the `github-pages` environment;
- also runs on a monthly schedule so "Present" durations and the footer date stay current;
- uses `concurrency: pages` without cancellation so deployments never interleave.

`public/.nojekyll` is kept even though the Actions path does not run Jekyll, so a branch-based fallback would still serve `_astro/`.

## Consequences

- Fork, rename or add a custom domain and nothing in the code changes.
- `robots.txt` is only effective at the domain root; on a project site it is served but ignored by crawlers. Documented in `src/pages/robots.txt.ts`.
- Dependabot keeps actions and npm dependencies current, grouped to limit PR noise.
