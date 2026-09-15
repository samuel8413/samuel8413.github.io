import { describe, expect, it } from 'vitest';
import {
  groupByCompany,
  normalizeDescription,
  partitionByCareerPivot,
  toPosition,
} from '../../src/domain/experience.ts';
import type { Position } from '../../src/domain/model.ts';
import type { RawPosition } from '../../src/domain/schema/profile.schema.ts';

const rawPosition = (overrides: Partial<RawPosition>): RawPosition => ({
  company: 'Acme',
  title: 'Engineer',
  started_on: { year: 2020, month: 1 },
  finished_on: null,
  description: 'Did things.',
  ...overrides,
});

describe('normalizeDescription', () => {
  it('maps a plain string to a summary', () => {
    expect(normalizeDescription('Led a branch.')).toEqual({
      summary: 'Led a branch.',
      highlights: [],
      responsibilities: [],
    });
  });

  it('maps intro + bullets to summary + highlights', () => {
    expect(normalizeDescription({ intro: 'Tech lead.', bullets: ['A', 'B'] })).toEqual({
      summary: 'Tech lead.',
      highlights: ['A', 'B'],
      responsibilities: [],
    });
  });

  it('maps responsibilities + achievements without inventing a summary', () => {
    expect(normalizeDescription({ responsibilities: ['R1'], key_achievements: ['K1'] })).toEqual({
      highlights: ['K1'],
      responsibilities: ['R1'],
    });
  });
});

describe('toPosition', () => {
  it('derives a stable DOM-safe id', () => {
    const position = toPosition(rawPosition({ company: 'Rheem México', title: 'Design Trainee' }));
    expect(position.id).toBe('rheem-mexico-design-trainee-2020');
  });
});

describe('groupByCompany', () => {
  const positions: Position[] = [
    toPosition(
      rawPosition({
        company: 'B',
        started_on: { year: 2019, month: 10 },
        finished_on: { year: 2020, month: 2 },
        title: 'Sales',
      }),
    ),
    toPosition(
      rawPosition({
        company: 'C',
        started_on: { year: 2021, month: 9 },
        finished_on: null,
        title: 'Lead',
      }),
    ),
    toPosition(
      rawPosition({
        company: 'B',
        started_on: { year: 2020, month: 2 },
        finished_on: { year: 2020, month: 7 },
        title: 'Manager',
      }),
    ),
    toPosition(
      rawPosition({
        company: 'A',
        started_on: { year: 2018, month: 5 },
        finished_on: { year: 2019, month: 10 },
        title: 'Trainee',
      }),
    ),
  ];

  it('sorts newest first and merges consecutive positions at one company', () => {
    const tenures = groupByCompany(positions);
    expect(tenures.map((t) => t.company)).toEqual(['C', 'B', 'A']);
    expect(tenures[1]!.positions.map((p) => p.title)).toEqual(['Manager', 'Sales']);
  });

  it('merges the date range across the promotion path', () => {
    const [, b] = groupByCompany(positions);
    expect(b!.range).toEqual({ start: { year: 2019, month: 10 }, end: { year: 2020, month: 7 } });
  });

  it('keeps an ongoing tenure open-ended', () => {
    const [c] = groupByCompany(positions);
    expect(c!.range.end).toBeNull();
  });

  it('does not merge non-consecutive returns to the same company', () => {
    const boomerang = [
      toPosition(
        rawPosition({ company: 'X', started_on: { year: 2018 }, finished_on: { year: 2019 } }),
      ),
      toPosition(
        rawPosition({ company: 'Y', started_on: { year: 2019 }, finished_on: { year: 2020 } }),
      ),
      toPosition(rawPosition({ company: 'X', started_on: { year: 2020 }, finished_on: null })),
    ];
    expect(groupByCompany(boomerang).map((t) => t.company)).toEqual(['X', 'Y', 'X']);
  });
});

describe('partitionByCareerPivot', () => {
  it('sends tenures that ended before the pivot to earlier career, never ongoing ones', () => {
    const tenures = groupByCompany([
      toPosition(
        rawPosition({
          company: 'Old',
          started_on: { year: 2018 },
          finished_on: { year: 2020, month: 7 },
        }),
      ),
      toPosition(
        rawPosition({
          company: 'Bridge',
          started_on: { year: 2020, month: 11 },
          finished_on: { year: 2021, month: 5 },
        }),
      ),
      toPosition(rawPosition({ company: 'Now', started_on: { year: 2024 }, finished_on: null })),
    ]);
    const { primary, earlier } = partitionByCareerPivot(tenures, { year: 2020, month: 11 });
    expect(primary.map((t) => t.company)).toEqual(['Now', 'Bridge']);
    expect(earlier.map((t) => t.company)).toEqual(['Old']);
  });
});
