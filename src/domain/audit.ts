import type { RawProfile } from './schema/profile.schema.ts';
import type { SiteConfig } from './schema/site-config.schema.ts';
import { groupSkills } from './skills.ts';

/**
 * Editorial checks that go beyond shape validation.
 *
 * Schema errors ("this is not a URL") always fail the build. Audit findings are
 * about *completeness*: they warn during development and block only the
 * production deployment (`content:check --strict`), so the site can be
 * developed before the export is complete.
 */

export type IssueSeverity = 'error' | 'warning';

export interface ContentIssue {
  readonly severity: IssueSeverity;
  readonly path: string;
  readonly message: string;
}

export function auditContent(profile: RawProfile, config: SiteConfig): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const push = (severity: IssueSeverity, path: string, message: string) =>
    issues.push({ severity, path, message });

  if (profile.contact.full_name === '') {
    push(
      'error',
      'contact.full_name',
      'Name is empty. It drives the page title, headings and structured data.',
    );
  }
  if (!profile.contact.linkedin_url) {
    push(
      'warning',
      'contact.linkedin_url',
      'No LinkedIn URL. Recruiters expect one; it also feeds JSON-LD sameAs.',
    );
  }
  if (!profile.contact.github_url) {
    push(
      'warning',
      'contact.github_url',
      'No GitHub URL. The portfolio is meant to point at code.',
    );
  }
  if (!profile.contact.email && !profile.contact.linkedin_url) {
    push(
      'error',
      'contact',
      'No contact channel at all (email or LinkedIn). Visitors have no way to reach out.',
    );
  }
  if (config.privacy.showEmail && !profile.contact.email) {
    push(
      'warning',
      'contact.email',
      'showEmail is on but no email is set; the Contact section will omit it.',
    );
  }

  const { unmapped, stale } = groupSkills(profile.skills, config.skills);
  for (const skill of unmapped) {
    push(
      'error',
      'skills',
      `"${skill}" is not in any group in site.config.json; it will render under "Other".`,
    );
  }
  for (const skill of stale) {
    push(
      'warning',
      'site.config.skills',
      `"${skill}" is in the taxonomy but no longer in the profile.`,
    );
  }

  profile.positions.forEach((position, index) => {
    if (typeof position.description === 'string' && position.description.length < 40) {
      push(
        'warning',
        `positions[${index}].description`,
        `"${position.company}" has a very short description.`,
      );
    }
  });

  profile.certifications.forEach((certification, index) => {
    if (!certification.url) {
      push(
        'warning',
        `certifications[${index}]`,
        `"${certification.name}" has no verification URL.`,
      );
    }
  });

  return issues;
}

export function hasBlockingIssues(issues: readonly ContentIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
