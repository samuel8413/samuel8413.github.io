import { z } from 'zod';
import { nonEmptyText, optionalText, optionalUrl, partialDate, stringList } from './primitives.ts';

/**
 * Schema for `content/site.config.json`: editorial decisions that are *about*
 * the profile but are not part of the LinkedIn export (how skills are grouped,
 * which numbers to headline, privacy switches, site metadata).
 *
 * Keeping this separate lets the profile be regenerated from LinkedIn without
 * losing presentation choices, and keeps those choices out of the components.
 */

const skillGroupSchema = z.strictObject({
  name: nonEmptyText,
  skills: stringList.min(1),
});

const highlightSchema = z.strictObject({
  value: nonEmptyText,
  label: nonEmptyText,
  detail: optionalText.optional(),
});

export const siteConfigSchema = z.strictObject({
  site: z.strictObject({
    /** Canonical origin. Overridden by the SITE_URL env var in CI; may be empty locally. */
    url: optionalUrl,
    /** `%s` is replaced with the person's name. */
    titleTemplate: nonEmptyText.refine((t) => t.includes('%s'), 'titleTemplate must contain %s'),
    /** Meta description. Empty falls back to the first paragraph of the summary. */
    description: optionalText,
    /** Public repository of this site. Rendered in the footer as "View source". */
    repositoryUrl: optionalUrl.optional(),
  }),
  experience: z.strictObject({
    /**
     * Positions that ended before this date are shown as "earlier career".
     * Lets a career change be presented honestly without burying the current profile.
     */
    careerPivot: partialDate,
  }),
  highlights: z.array(highlightSchema).max(6).default([]),
  skills: z.strictObject({
    groups: z.array(skillGroupSchema).min(1),
    /** Display overrides for verbose LinkedIn skill names. */
    labels: z.record(z.string(), nonEmptyText).default({}),
  }),
  contact: z
    .strictObject({
      /** Sentence shown above the contact channels. */
      lead: optionalText.optional(),
    })
    .default({}),
  /**
   * The printable résumé at /cv/. It is a second presentation of the same
   * data, tuned for one or two Letter/A4 pages, so it needs a few knobs the
   * web page does not.
   */
  resume: z
    .strictObject({
      /** Portraits are common in some markets and discouraged in others; off by default. */
      showPhoto: z.boolean().default(false),
      /** Overrides the summary. Empty falls back to the first paragraph of the profile summary. */
      summary: optionalText.optional(),
      /** Most recent tenures to expand with bullets; older ones are listed in one line each. */
      detailedTenures: z.number().int().min(0).max(20).default(2),
      /** Which optional sections make it onto the paper. */
      include: z
        .strictObject({
          certifications: z.boolean().default(true),
          publications: z.boolean().default(true),
          projects: z.boolean().default(false),
          earlierCareer: z.boolean().default(true),
        })
        // `prefault` (not `default`) so the inner defaults are still applied when the block is omitted.
        .prefault({}),
    })
    .prefault({}),
  privacy: z.strictObject({
    showEmail: z.boolean().default(true),
    showPhone: z.boolean().default(false),
  }),
});

export type SiteConfig = z.output<typeof siteConfigSchema>;
export type SkillTaxonomy = SiteConfig['skills'];
