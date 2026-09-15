import { z } from 'zod';
import { parsePartialDate, type PartialDate } from '../dates.ts';

/**
 * Shared Zod building blocks for the raw content files.
 *
 * The LinkedIn export uses empty strings for "not provided", so every optional
 * scalar is normalised to `undefined` here. Downstream code never has to
 * distinguish between `""`, whitespace and a missing key.
 */

export const text = z.string().trim();

export const nonEmptyText = text.min(1, 'Value must not be empty');

export const optionalText = text.transform((value) => (value === '' ? undefined : value));

export const optionalUrl = text.transform((value, ctx) => {
  if (value === '') return undefined;
  const result = z.url({ protocol: /^https?$/ }).safeParse(value);
  if (!result.success) {
    ctx.addIssue({ code: 'custom', message: `Invalid http(s) URL: "${value}"` });
    return z.NEVER;
  }
  return result.data;
});

export const optionalEmail = text.transform((value, ctx) => {
  if (value === '') return undefined;
  const result = z.email().safeParse(value);
  if (!result.success) {
    ctx.addIssue({ code: 'custom', message: `Invalid email address: "${value}"` });
    return z.NEVER;
  }
  return result.data;
});

export const partialDate = text.transform((value, ctx): PartialDate => {
  const parsed = parsePartialDate(value);
  if (!parsed) {
    ctx.addIssue({
      code: 'custom',
      message: `Unrecognised date "${value}". Expected "2013", "Oct 2024", "Oct 5, 2024" or ISO (2024-10-05).`,
    });
    return z.NEVER;
  }
  return parsed;
});

/** `null` in the source means "present"/ongoing. */
export const openEndedDate = z.union([z.null(), partialDate]);

export const stringList = z.array(text.min(1));
