import { comparePartialDates, isBefore, type PartialDate } from './dates.ts';
import type { CompanyTenure, DateRange, Experience, Position } from './model.ts';
import type { RawPosition, RawPositionDescription } from './schema/profile.schema.ts';
import { slugify } from './slug.ts';

/**
 * Adapter from the three description shapes LinkedIn produces to one model.
 *
 * - plain string            -> summary
 * - { intro, bullets }      -> summary + highlights
 * - { responsibilities, key_achievements } -> responsibilities + highlights
 */
export function normalizeDescription(
  description: RawPositionDescription,
): Pick<Position, 'summary' | 'highlights' | 'responsibilities'> {
  if (typeof description === 'string') {
    return { summary: description, highlights: [], responsibilities: [] };
  }
  if ('bullets' in description) {
    return { summary: description.intro, highlights: description.bullets, responsibilities: [] };
  }
  return {
    highlights: description.key_achievements,
    responsibilities: description.responsibilities,
  };
}

export function toPosition(raw: RawPosition): Position {
  return {
    id: slugify(raw.company, raw.title, String(raw.started_on.year)),
    company: raw.company,
    title: raw.title,
    location: raw.location,
    range: { start: raw.started_on, end: raw.finished_on },
    ...normalizeDescription(raw.description),
  };
}

/** Newest first. Ongoing roles sort before finished ones that started later (rare, but defined). */
export function sortPositionsNewestFirst(positions: readonly Position[]): Position[] {
  return [...positions].sort((a, b) => {
    if (a.range.end === null && b.range.end !== null) return -1;
    if (b.range.end === null && a.range.end !== null) return 1;
    return comparePartialDates(b.range.start, a.range.start);
  });
}

const earliest = (dates: readonly PartialDate[]): PartialDate =>
  dates.reduce((min, d) => (isBefore(d, min) ? d : min));
const latest = (dates: readonly PartialDate[]): PartialDate =>
  dates.reduce((max, d) => (isBefore(max, d) ? d : max));

function mergeRanges(positions: readonly Position[]): DateRange {
  const ends = positions.flatMap((p) => (p.range.end ? [p.range.end] : []));
  const ongoing = ends.length < positions.length;
  return {
    start: earliest(positions.map((p) => p.range.start)),
    end: ongoing ? null : latest(ends),
  };
}

/**
 * Groups *consecutive* positions at the same company (a promotion path) into
 * one tenure, mirroring how LinkedIn presents them. Non-consecutive returns to
 * a company remain separate entries on purpose.
 */
export function groupByCompany(positions: readonly Position[]): CompanyTenure[] {
  const groups: { company: string; positions: Position[] }[] = [];
  for (const position of sortPositionsNewestFirst(positions)) {
    const current = groups.at(-1);
    if (current?.company === position.company) {
      current.positions.push(position);
    } else {
      groups.push({ company: position.company, positions: [position] });
    }
  }
  return groups.map(({ company, positions: group }) => {
    const range = mergeRanges(group);
    return {
      id: slugify(company, String(range.start.year)),
      company,
      range,
      positions: group,
    };
  });
}

/** Tenures that ended before the pivot date are "earlier career". Ongoing tenures never are. */
export function partitionByCareerPivot(
  tenures: readonly CompanyTenure[],
  pivot: PartialDate,
): Experience {
  const primary: CompanyTenure[] = [];
  const earlier: CompanyTenure[] = [];
  for (const tenure of tenures) {
    const endedBeforePivot = tenure.range.end !== null && isBefore(tenure.range.end, pivot);
    (endedBeforePivot ? earlier : primary).push(tenure);
  }
  return { primary, earlier };
}

export function buildExperience(
  rawPositions: readonly RawPosition[],
  pivot: PartialDate,
): Experience {
  return partitionByCareerPivot(groupByCompany(rawPositions.map(toPosition)), pivot);
}
