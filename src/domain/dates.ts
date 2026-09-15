/**
 * Partial-date primitives.
 *
 * LinkedIn exports dates with varying precision ("2013", "Oct 2024", "Oct 5, 2024").
 * Collapsing them into a JS `Date` would invent a day and a time zone, so the
 * domain keeps precision explicit and only converts at the presentation edge.
 */

export interface PartialDate {
  readonly year: number;
  /** 1-12. Absent when the source only had a year. */
  readonly month?: number;
  /** 1-31. Absent when the source only had a year or a month. */
  readonly day?: number;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const MONTH_FULL_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

const YEAR_ONLY = /^(\d{4})$/;
const MONTH_YEAR = /^([A-Za-z]{3,9})\s+(\d{4})$/;
const MONTH_DAY_YEAR = /^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/;
const ISO_LIKE = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

/** Accepts the exact three-letter abbreviation ("Sep", "Sept" is not used by LinkedIn) or the full name. */
function monthFromName(name: string): number | null {
  const lower = name.toLowerCase();
  const byAbbreviation = MONTH_LABELS.findIndex((label) => label.toLowerCase() === lower);
  if (byAbbreviation !== -1) return byAbbreviation + 1;
  const byFullName = MONTH_FULL_NAMES.indexOf(lower as (typeof MONTH_FULL_NAMES)[number]);
  return byFullName === -1 ? null : byFullName + 1;
}

function isValidDay(year: number, month: number, day: number): boolean {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * Parses the date formats found in LinkedIn exports plus ISO-like strings.
 * Returns `null` for anything it does not recognise so callers can decide
 * whether that is a validation error.
 */
export function parsePartialDate(input: string): PartialDate | null {
  const value = input.trim();

  const yearOnly = YEAR_ONLY.exec(value);
  if (yearOnly) {
    return { year: Number(yearOnly[1]) };
  }

  const monthYear = MONTH_YEAR.exec(value);
  if (monthYear) {
    const [, monthName = '', year = ''] = monthYear;
    const month = monthFromName(monthName);
    return month ? { year: Number(year), month } : null;
  }

  const monthDayYear = MONTH_DAY_YEAR.exec(value);
  if (monthDayYear) {
    const [, monthName = '', dayText = '', yearText = ''] = monthDayYear;
    const month = monthFromName(monthName);
    const day = Number(dayText);
    const year = Number(yearText);
    return month && isValidDay(year, month, day) ? { year, month, day } : null;
  }

  const iso = ISO_LIKE.exec(value);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    if (month < 1 || month > 12) return null;
    if (iso[3] === undefined) return { year, month };
    const day = Number(iso[3]);
    return isValidDay(year, month, day) ? { year, month, day } : null;
  }

  return null;
}

/** ISO 8601 with the same precision as the source, suitable for `<time datetime>`. */
export function toIsoDate(date: PartialDate): string {
  const parts = [String(date.year)];
  if (date.month !== undefined) parts.push(String(date.month).padStart(2, '0'));
  if (date.month !== undefined && date.day !== undefined) {
    parts.push(String(date.day).padStart(2, '0'));
  }
  return parts.join('-');
}

/** Human-readable label matching the precision of the source ("Oct 2024"). */
export function formatPartialDate(date: PartialDate): string {
  if (date.month === undefined) return String(date.year);
  const month = MONTH_LABELS[date.month - 1];
  if (date.day === undefined) return `${month} ${date.year}`;
  return `${month} ${date.day}, ${date.year}`;
}

/** Sort key: later dates compare greater. Missing months/days sort first. */
export function comparePartialDates(a: PartialDate, b: PartialDate): number {
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0) || (a.day ?? 0) - (b.day ?? 0);
}

export function isBefore(a: PartialDate, b: PartialDate): boolean {
  return comparePartialDates(a, b) < 0;
}

/**
 * Whole months between two dates, counting both endpoints the way LinkedIn does
 * ("Sep 2021 - Oct 2024" reads as 3 yrs 2 mos). Year-only dates assume January.
 */
export function monthsBetweenInclusive(start: PartialDate, end: PartialDate): number {
  const startIndex = start.year * 12 + (start.month ?? 1);
  const endIndex = end.year * 12 + (end.month ?? 1);
  return Math.max(0, endIndex - startIndex + 1);
}

export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  return parts.length > 0 ? parts.join(' ') : 'Less than a month';
}

export function partialDateFromDate(date: Date): PartialDate {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
