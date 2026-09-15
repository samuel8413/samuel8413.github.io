import type { APIRoute } from 'astro';

/**
 * Generated at build time so the sitemap URL always matches `site` + `base`.
 * Note: crawlers only read robots.txt at the domain root, so this file is
 * effective for user/organisation Pages (`<user>.github.io`) or a custom
 * domain. For project Pages (`<user>.github.io/<repo>/`) it is harmless but ignored.
 */
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = site
    ? new URL(`${base}/sitemap-index.xml`, site).href
    : `${base}/sitemap-index.xml`;
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
