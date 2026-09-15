import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { auditContent, hasBlockingIssues } from '../../src/domain/audit.ts';
import { normalizeProfile, PLACEHOLDER_NAME, splitParagraphs } from '../../src/domain/normalize.ts';
import { profileSchema } from '../../src/domain/schema/profile.schema.ts';
import { siteConfigSchema } from '../../src/domain/schema/site-config.schema.ts';

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

/**
 * Contract tests against the real content files. They guard the two files the
 * owner edits by hand, so a typo fails here instead of in a deploy.
 */
describe('content files', () => {
  const rawProfile = readJson('../../content/profile.json');
  const rawConfig = readJson('../../content/site.config.json');

  it('profile.json matches the schema', () => {
    expect(() => profileSchema.parse(rawProfile)).not.toThrow();
  });

  it('site.config.json matches the schema', () => {
    expect(() => siteConfigSchema.parse(rawConfig)).not.toThrow();
  });

  it('every skill in the profile is placed in a taxonomy group', () => {
    const issues = auditContent(profileSchema.parse(rawProfile), siteConfigSchema.parse(rawConfig));
    expect(issues.filter((i) => i.path === 'skills')).toEqual([]);
  });

  it('normalizes into a profile with the expected sections', () => {
    const profile = normalizeProfile(
      profileSchema.parse(rawProfile),
      siteConfigSchema.parse(rawConfig),
    );
    expect(profile.experience.primary.length).toBeGreaterThan(0);
    expect(profile.experience.primary[0]!.range.end).toBeNull();
    expect(profile.skillGroups.map((g) => g.name)).not.toContain('Other');
    expect(profile.certifications[0]!.issuedOn.year).toBeGreaterThanOrEqual(
      profile.certifications.at(-1)!.issuedOn.year,
    );
  });
});

describe('normalizeProfile', () => {
  const baseConfig = siteConfigSchema.parse({
    site: { url: '', titleTemplate: '%s | Test', description: '' },
    experience: { careerPivot: '2020' },
    skills: { groups: [{ name: 'G', skills: ['TS'] }] },
    privacy: {},
  });
  const baseProfile = profileSchema.parse({
    contact: {
      full_name: '',
      email: 'a@b.co',
      phone: '+1',
      location: 'X',
      linkedin_url: '',
      github_url: '',
      website_url: '',
    },
    headline: 'H',
    summary: 'First.\n\nSecond\nline.',
    positions: [
      { company: 'C', title: 'T', started_on: '2021', finished_on: null, description: 'D' },
    ],
    skills: ['TS'],
  });

  it('falls back to a placeholder name and flags it as a blocking issue', () => {
    expect(normalizeProfile(baseProfile, baseConfig).identity.name).toBe(PLACEHOLDER_NAME);
    expect(hasBlockingIssues(auditContent(baseProfile, baseConfig))).toBe(true);
  });

  it('respects privacy switches', () => {
    const contact = normalizeProfile(baseProfile, baseConfig).contact;
    expect(contact.email).toBe('a@b.co');
    expect(contact.phone).toBeUndefined();
  });

  it('splits the summary into paragraphs and joins soft line breaks', () => {
    expect(splitParagraphs('First.\n\nSecond\nline.\n\n\n')).toEqual(['First.', 'Second line.']);
  });
});

describe('schema strictness', () => {
  it('rejects unknown keys so typos do not silently disappear', () => {
    expect(() =>
      siteConfigSchema.parse({
        site: { url: '', titleTemplate: '%s', description: '' },
        experience: { careerPivot: '2020' },
        skills: { groups: [{ name: 'G', skills: ['a'] }] },
        privacy: {},
        typo: true,
      }),
    ).toThrow();
  });

  it('rejects malformed URLs and dates with a readable message', () => {
    const result = profileSchema.safeParse({
      contact: {
        full_name: 'N',
        email: 'not-an-email',
        phone: '',
        location: '',
        linkedin_url: 'ftp://x',
        github_url: '',
        website_url: '',
      },
      headline: 'H',
      summary: 'S',
      positions: [
        {
          company: 'C',
          title: 'T',
          started_on: 'Octember 2020',
          finished_on: null,
          description: 'D',
        },
      ],
    });
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((i) => i.message);
    expect(messages.some((m) => m.includes('Invalid email'))).toBe(true);
    expect(messages.some((m) => m.includes('Invalid http(s) URL'))).toBe(true);
    expect(messages.some((m) => m.includes('Unrecognised date'))).toBe(true);
  });
});
