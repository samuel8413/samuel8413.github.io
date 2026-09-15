import { z } from 'zod';
import {
  nonEmptyText,
  openEndedDate,
  optionalEmail,
  optionalText,
  optionalUrl,
  partialDate,
  stringList,
  text,
} from './primitives.ts';

/**
 * Schema for `content/profile.json`: the LinkedIn-shaped export.
 *
 * This layer describes the file *as it is*, including its irregularities,
 * so the owner can regenerate it from LinkedIn without hand-editing. The
 * canonical domain model lives in `../model.ts` and `../normalize.ts`.
 */

const contactSchema = z.strictObject({
  /** Allowed to be empty so the site can be developed before it is filled in; the content audit flags it. */
  full_name: text,
  email: optionalEmail,
  phone: optionalText,
  location: optionalText,
  linkedin_url: optionalUrl,
  github_url: optionalUrl,
  website_url: optionalUrl,
});

/**
 * LinkedIn descriptions arrive in three shapes depending on how the entry was
 * written. All three are accepted; `normalize.ts` folds them into one model.
 */
const narrativeDescription = z.strictObject({
  intro: optionalText.optional(),
  bullets: stringList.min(1),
});

const structuredDescription = z.strictObject({
  responsibilities: stringList.default([]),
  key_achievements: stringList.default([]),
});

export const positionDescriptionSchema = z.union([
  text,
  narrativeDescription,
  structuredDescription,
]);

const positionSchema = z.strictObject({
  company: nonEmptyText,
  title: nonEmptyText,
  location: optionalText.optional(),
  started_on: partialDate,
  finished_on: openEndedDate,
  description: positionDescriptionSchema,
});

const educationSchema = z.strictObject({
  school: nonEmptyText,
  degree: nonEmptyText,
  started_on: partialDate,
  finished_on: openEndedDate,
});

const languageSchema = z.strictObject({
  name: nonEmptyText,
  proficiency: nonEmptyText,
});

const certificationSchema = z.strictObject({
  name: nonEmptyText,
  authority: nonEmptyText,
  started_on: partialDate,
  url: optionalUrl.optional(),
  license_number: optionalText.optional(),
});

const honorSchema = z.strictObject({
  title: nonEmptyText,
  description: optionalText.optional(),
  issued_on: partialDate,
});

const projectSchema = z.strictObject({
  title: nonEmptyText,
  started_on: partialDate,
  finished_on: openEndedDate,
  description: nonEmptyText,
  url: optionalUrl.optional(),
});

const publicationSchema = z.strictObject({
  name: nonEmptyText,
  publisher: nonEmptyText,
  published_on: partialDate,
  url: optionalUrl.optional(),
  description: optionalText.optional(),
});

export const profileSchema = z.strictObject({
  contact: contactSchema,
  headline: nonEmptyText,
  summary: nonEmptyText,
  positions: z.array(positionSchema).min(1),
  education: z.array(educationSchema).default([]),
  skills: z.array(nonEmptyText).default([]),
  languages: z.array(languageSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  honors: z.array(honorSchema).default([]),
  projects: z.array(projectSchema).default([]),
  publications: z.array(publicationSchema).default([]),
});

export type RawProfile = z.output<typeof profileSchema>;
export type RawPosition = RawProfile['positions'][number];
export type RawPositionDescription = z.output<typeof positionDescriptionSchema>;
