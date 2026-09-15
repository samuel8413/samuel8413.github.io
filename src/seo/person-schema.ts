import type { Profile } from '../domain/model.ts';

/**
 * Builds the schema.org `Person` graph for the page. Pure and testable; the
 * component only serialises it.
 */

export interface PersonSchemaContext {
  /** Canonical page URL, when known. */
  readonly url?: string;
  /** Absolute URL of the portrait. */
  readonly imageUrl?: string;
}

export function buildPersonSchema(profile: Profile, context: PersonSchemaContext) {
  const { identity, contact, experience, education, skillGroups, languages } = profile;
  const currentTenure = experience.primary.find((tenure) => tenure.range.end === null);
  const currentPosition = currentTenure?.positions[0];

  const sameAs = [contact.linkedin, contact.github, contact.website]
    .concat(profile.publications.map((p) => p.url))
    .filter((value): value is string => Boolean(value));

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    jobTitle: currentPosition?.title ?? identity.headline,
    description: identity.summaryParagraphs[0],
    ...(context.url && { url: context.url }),
    ...(context.imageUrl && { image: context.imageUrl }),
    ...(contact.email && { email: `mailto:${contact.email}` }),
    ...(identity.location && {
      address: { '@type': 'PostalAddress', addressLocality: identity.location },
    }),
    ...(currentTenure && {
      worksFor: { '@type': 'Organization', name: currentTenure.company },
    }),
    ...(education.length > 0 && {
      alumniOf: education.map((e) => ({ '@type': 'EducationalOrganization', name: e.school })),
    }),
    knowsAbout: skillGroups.flatMap((group) => group.skills.map((skill) => skill.label)),
    knowsLanguage: languages.map((language) => language.name),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** Serialises for a `<script type="application/ld+json">` without enabling tag breakout. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
