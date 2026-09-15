import { describe, expect, it } from 'vitest';
import type { Profile } from '../../src/domain/model.ts';
import { buildPersonSchema, serializeJsonLd } from '../../src/seo/person-schema.ts';

const profile: Profile = {
  identity: {
    name: 'Ada',
    headline: 'Engineer',
    location: 'London',
    summaryParagraphs: ['Pitch.', 'More.'],
  },
  contact: { linkedin: 'https://linkedin.com/in/ada', email: 'ada@example.com' },
  highlights: [],
  experience: {
    primary: [
      {
        id: 'acme',
        company: 'Acme',
        range: { start: { year: 2020 }, end: null },
        positions: [
          {
            id: 'p',
            company: 'Acme',
            title: 'Staff Engineer',
            range: { start: { year: 2020 }, end: null },
            highlights: [],
            responsibilities: [],
          },
        ],
      },
    ],
    earlier: [],
  },
  education: [
    { school: 'MIT', degree: 'BSc', range: { start: { year: 2010 }, end: { year: 2014 } } },
  ],
  skillGroups: [{ name: 'G', skills: [{ name: 'React.js', label: 'React' }] }],
  languages: [{ name: 'English', proficiency: 'Native' }],
  certifications: [],
  honors: [],
  projects: [],
  publications: [
    {
      name: 'Essay',
      publisher: 'Medium',
      publishedOn: { year: 2024 },
      url: 'https://medium.com/@ada/essay',
    },
  ],
};

describe('buildPersonSchema', () => {
  it('describes the current role, education, skills and public profiles', () => {
    const schema = buildPersonSchema(profile, {
      url: 'https://ada.dev/',
      imageUrl: 'https://ada.dev/me.jpg',
    });
    expect(schema).toMatchObject({
      '@type': 'Person',
      name: 'Ada',
      jobTitle: 'Staff Engineer',
      url: 'https://ada.dev/',
      image: 'https://ada.dev/me.jpg',
      email: 'mailto:ada@example.com',
      worksFor: { '@type': 'Organization', name: 'Acme' },
      alumniOf: [{ '@type': 'EducationalOrganization', name: 'MIT' }],
      knowsAbout: ['React'],
      knowsLanguage: ['English'],
      sameAs: ['https://linkedin.com/in/ada', 'https://medium.com/@ada/essay'],
    });
  });

  it('omits optional fields instead of emitting undefined', () => {
    const schema = buildPersonSchema({ ...profile, contact: {}, publications: [] }, {});
    expect(schema).not.toHaveProperty('url');
    expect(schema).not.toHaveProperty('email');
    expect(schema).not.toHaveProperty('sameAs');
  });
});

describe('serializeJsonLd', () => {
  it('escapes angle brackets so content cannot close the script tag', () => {
    expect(serializeJsonLd({ name: '</script><img src=x>' })).not.toContain('</script>');
  });
});
