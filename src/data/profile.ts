import rawProfile from '../../content/profile.json';
import rawSiteConfig from '../../content/site.config.json';
import { auditContent } from '../domain/audit.ts';
import { partialDateFromDate, type PartialDate } from '../domain/dates.ts';
import type { Profile } from '../domain/model.ts';
import { normalizeProfile } from '../domain/normalize.ts';
import { profileSchema } from '../domain/schema/profile.schema.ts';
import { siteConfigSchema, type SiteConfig } from '../domain/schema/site-config.schema.ts';

/**
 * Composition root for content.
 *
 * This is the only module that touches the JSON files. It runs once per build
 * (Astro evaluates it at prerender time), validates both files, and exposes the
 * typed domain objects to the components. Schema failures throw and stop the
 * build with a readable message; editorial findings are logged and left to the
 * `content:check` script to enforce in CI.
 */

export const siteConfig: SiteConfig = siteConfigSchema.parse(rawSiteConfig);

const validatedProfile = profileSchema.parse(rawProfile);

export const profile: Profile = normalizeProfile(validatedProfile, siteConfig);

/** Build date, used for "present" tenures and the footer. Static sites are rebuilt on deploy. */
export const buildDate: PartialDate = partialDateFromDate(new Date());

for (const issue of auditContent(validatedProfile, siteConfig)) {
  console.warn(`[content:${issue.severity}] ${issue.path}: ${issue.message}`);
}
