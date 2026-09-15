import { comparePartialDates } from './dates.ts';
import { buildExperience } from './experience.ts';
import type { Profile } from './model.ts';
import type { RawProfile } from './schema/profile.schema.ts';
import type { SiteConfig } from './schema/site-config.schema.ts';
import { groupSkills } from './skills.ts';

/** Shown when the export has no name yet. The content audit blocks production builds on it. */
export const PLACEHOLDER_NAME = 'Your Name';

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * Turns the validated LinkedIn export plus editorial config into the canonical
 * `Profile`. Pure and deterministic: same inputs, same output, no clock, no IO.
 */
export function normalizeProfile(raw: RawProfile, config: SiteConfig): Profile {
  const newestFirst = <T>(
    items: readonly T[],
    date: (item: T) => Parameters<typeof comparePartialDates>[0],
  ) => [...items].sort((a, b) => comparePartialDates(date(b), date(a)));

  return {
    identity: {
      name: raw.contact.full_name || PLACEHOLDER_NAME,
      headline: raw.headline,
      location: raw.contact.location,
      summaryParagraphs: splitParagraphs(raw.summary),
    },
    contact: {
      lead: config.contact.lead,
      email: config.privacy.showEmail ? raw.contact.email : undefined,
      phone: config.privacy.showPhone ? raw.contact.phone : undefined,
      linkedin: raw.contact.linkedin_url,
      github: raw.contact.github_url,
      website: raw.contact.website_url,
    },
    highlights: config.highlights,
    experience: buildExperience(raw.positions, config.experience.careerPivot),
    education: newestFirst(raw.education, (e) => e.started_on).map((e) => ({
      school: e.school,
      degree: e.degree,
      range: { start: e.started_on, end: e.finished_on },
    })),
    skillGroups: groupSkills(raw.skills, config.skills).groups,
    languages: raw.languages,
    certifications: newestFirst(raw.certifications, (c) => c.started_on).map((c) => ({
      name: c.name,
      authority: c.authority,
      issuedOn: c.started_on,
      url: c.url,
      licenseNumber: c.license_number,
    })),
    honors: newestFirst(raw.honors, (h) => h.issued_on).map((h) => ({
      title: h.title,
      description: h.description,
      issuedOn: h.issued_on,
    })),
    projects: newestFirst(raw.projects, (p) => p.started_on).map((p) => ({
      title: p.title,
      range: { start: p.started_on, end: p.finished_on },
      description: p.description,
      url: p.url,
    })),
    publications: newestFirst(raw.publications, (p) => p.published_on).map((p) => ({
      name: p.name,
      publisher: p.publisher,
      publishedOn: p.published_on,
      url: p.url,
      description: p.description,
    })),
  };
}
