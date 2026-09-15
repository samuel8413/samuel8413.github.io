# Deployment

## One-time setup

1. Create a GitHub repository and push this project.
2. **Settings > Pages > Build and deployment > Source**: choose **GitHub Actions**.
3. Optional: add a custom domain in the same settings page. Nothing in the code changes.

## What happens on push to `main`

`.github/workflows/deploy.yml`:

1. **Quality** (reused from `ci.yml`): content check, lint, format, `astro check`, unit tests with coverage, build, Playwright e2e with axe.
2. **Production build**: `content:check --strict` (blocks on placeholder name, missing contact, unmapped skills), then `astro build` with `SITE_URL` and `BASE_PATH` taken from `actions/configure-pages`.
3. **Deploy** to the `github-pages` environment.

The workflow also runs on the first of every month (so "Present" tenures and the footer date stay current) and can be started manually from the Actions tab.

## Local verification before pushing

```sh
npm run validate                 # content, lint, format, types, unit
npm run build                    # base "/", no canonical URLs
npm run test:e2e                 # against dist/ (needs: npx playwright install chromium)

# Simulate a project site
SITE_URL=https://you.github.io BASE_PATH=/your-repo npm run build
npm run preview                  # then open http://localhost:4321/your-repo/
```

## Troubleshooting

| Symptom                                             | Cause                                                                                 | Fix                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Deploy job fails at "Validate content (strict)"     | Blocking editorial errors                                                             | Run `npm run content:check` locally and fix `content/`.                                   |
| Assets 404 on `<user>.github.io/<repo>/`            | Pages source not set to GitHub Actions, or the artefact was built without `BASE_PATH` | Check Settings > Pages. The workflow sets `BASE_PATH` automatically; do not hard-code it. |
| Canonical URL is wrong after adding a custom domain | Cached build                                                                          | Re-run the workflow; `configure-pages` reads the current domain.                          |
| `robots.txt` not picked up                          | Project site: crawlers only read the domain root                                      | Expected. Use a user site or custom domain if this matters.                               |
| "Preview server already running" locally            | Astro 7 background preview lock from a previous run                                   | `npx astro preview stop`                                                                  |

## Security notes for operators

- The site has no server, no forms and no third-party scripts. The attack surface is the repository itself: protect `main` with required status checks (the `CI` workflow) and review Dependabot PRs.
- Workflow permissions are least-privilege: `contents: read` everywhere, `pages: write` and `id-token: write` only on the deploy job.
