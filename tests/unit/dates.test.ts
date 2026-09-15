import { describe, expect, it } from 'vitest';
import {
  comparePartialDates,
  formatDuration,
  formatPartialDate,
  monthsBetweenInclusive,
  parsePartialDate,
  toIsoDate,
} from '../../src/domain/dates.ts';

describe('parsePartialDate', () => {
  it.each([
    ['2013', { year: 2013 }],
    ['Oct 2024', { year: 2024, month: 10 }],
    ['September 2021', { year: 2021, month: 9 }],
    ['Oct 5, 2024', { year: 2024, month: 10, day: 5 }],
    ['Dec 23, 2024', { year: 2024, month: 12, day: 23 }],
    ['2024-10', { year: 2024, month: 10 }],
    ['2024-10-05', { year: 2024, month: 10, day: 5 }],
    ['  Nov 2020  ', { year: 2020, month: 11 }],
  ])('parses %s', (input, expected) => {
    expect(parsePartialDate(input)).toEqual(expected);
  });

  it.each(['', 'Octember 2024', 'Feb 30, 2024', '2024-13', '10/2024', 'yesterday'])(
    'rejects %s',
    (input) => {
      expect(parsePartialDate(input)).toBeNull();
    },
  );
});

describe('formatting', () => {
  it('round-trips precision into ISO and labels', () => {
    expect(toIsoDate({ year: 2013 })).toBe('2013');
    expect(toIsoDate({ year: 2024, month: 3 })).toBe('2024-03');
    expect(toIsoDate({ year: 2024, month: 10, day: 5 })).toBe('2024-10-05');
    expect(formatPartialDate({ year: 2013 })).toBe('2013');
    expect(formatPartialDate({ year: 2024, month: 3 })).toBe('Mar 2024');
    expect(formatPartialDate({ year: 2024, month: 10, day: 5 })).toBe('Oct 5, 2024');
  });

  it('never emits a day without a month', () => {
    expect(toIsoDate({ year: 2024, day: 5 })).toBe('2024');
  });
});

describe('durations', () => {
  it('counts both endpoints like LinkedIn', () => {
    expect(monthsBetweenInclusive({ year: 2021, month: 9 }, { year: 2024, month: 10 })).toBe(38);
    expect(formatDuration(38)).toBe('3 yrs 2 mos');
  });

  it('handles single units and sub-month spans', () => {
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(13)).toBe('1 yr 1 mo');
    expect(formatDuration(0)).toBe('Less than a month');
  });

  it('treats year-only dates as January', () => {
    expect(monthsBetweenInclusive({ year: 2013 }, { year: 2017 })).toBe(49);
  });
});

describe('comparePartialDates', () => {
  it('orders by year, then month, then day, with missing parts first', () => {
    const dates = [
      { year: 2024, month: 10, day: 5 },
      { year: 2024 },
      { year: 2023, month: 12 },
      { year: 2024, month: 10 },
    ];
    expect([...dates].sort(comparePartialDates)).toEqual([
      { year: 2023, month: 12 },
      { year: 2024 },
      { year: 2024, month: 10 },
      { year: 2024, month: 10, day: 5 },
    ]);
  });
});
