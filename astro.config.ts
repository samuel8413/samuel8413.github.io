import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

/**
 * Deployment target is resolved from the environment so one config serves:
 *  - local dev/preview          (no env: base "/", no canonical URLs)
 *  - user pages  <u>.github.io  (SITE_URL=https://u.github.io      BASE_PATH=/)
 *  - project pages /<repo>      (SITE_URL=https://u.github.io      BASE_PATH=/repo)
 *  - custom domain              (SITE_URL=https://example.com       BASE_PATH=/)
 * The deploy workflow feeds both values from `actions/configure-pages`, so a
 * repository rename or custom domain needs no code change.
 */
const localConfig = JSON.parse(
  readFileSync(new URL('./content/site.config.json', import.meta.url), 'utf8'),
) as {
  site?: { url?: string };
};

/** Empty strings mean "not configured", both in env vars and in site.config.json. */
const nonEmpty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed === '' ? undefined : trimmed;
};

const site = nonEmpty(process.env.SITE_URL) ?? nonEmpty(localConfig.site?.url);
/** Normalised to a trailing slash: `configure-pages` emits `/repo`, and the sitemap dedupes cleanly only with `/repo/`. */
const base = (nonEmpty(process.env.BASE_PATH) ?? '/').replace(/\/?$/, '/');

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [
    // The résumé view is a second rendering of the same content; keep one canonical entry.
    sitemap({ filter: (page) => !/\/cv\/?$/.test(page) }),
  ],

  image: {
    // Responsive images by default; markup uses data attributes, not inline styles, so CSP stays strict.
    layout: 'constrained',
    responsiveStyles: true,
  },

  build: {
    // Small stylesheets are inlined (fewer requests); Astro hashes them for the CSP.
    inlineStylesheets: 'auto',
  },

  security: {
    /**
     * GitHub Pages cannot send HTTP headers, so the policy ships as a <meta> tag.
     * Astro hashes every script and style it emits; the single hand-written inline
     * script (theme boot) registers its own hash in BaseLayout.
     * `frame-ancestors`, `report-uri` and `sandbox` are not allowed in meta CSP and are omitted.
     */
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'none'",
        "img-src 'self' data:",
        "base-uri 'none'",
        "form-action 'none'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
});
