import {
  resolveColor,
  resolveIcon,
  groupOccurrencesByDay,
  minutesFromMidnight,
  minutesToY,
  yToMinutes,
  snapMinutes,
  yToSnappedStartTime,
  getBlockLayout,
  assignOverlapColumns,
  HOUR_HEIGHT,
} from '../occurrenceHelpers';

describe('resolveColor / resolveIcon', () => {
  it("prefers the occurrence's own color over the entityType default", () => {
    expect(resolveColor({ entityType: 'task', color: '#ff0000' })).toBe('#ff0000');
  });

  it('falls back to the entityType default when color is null', () => {
    expect(resolveColor({ entityType: 'task', color: null })).toBe('#2563eb');
  });

  it('falls back to a generic gray for an unknown entityType with no color', () => {
    expect(resolveColor({ entityType: 'unknownThing', color: null })).toBe('#64748b');
  });

  it('falls back to the entityType default icon when none is provided', () => {
    expect(resolveIcon({ entityType: 'focusSession', icon: null })).toBe('flame-outline');
  });
});

describe('groupOccurrencesByDay', () => {
  it('places a single-day occurrence under its one day', () => {
    const occurrences = [{ startTime: '2026-01-05T09:00:00.000Z', endTime: '2026-01-05T10:00:00.000Z' }];
    const grouped = groupOccurrencesByDay(occurrences);
    expect(grouped.get('2026-01-05')).toHaveLength(1);
    expect(grouped.size).toBe(1);
  });

  it('places a point-in-time occurrence (equal start/end) under its single day', () => {
    const occurrences = [{ startTime: '2026-01-05T09:00:00.000Z', endTime: '2026-01-05T09:00:00.000Z' }];
    const grouped = groupOccurrencesByDay(occurrences);
    expect(grouped.get('2026-01-05')).toHaveLength(1);
  });

  it('places a multi-day occurrence on every day it spans', () => {
    // Local (non-UTC) timestamps, same convention as the rest of this file —
    // keeps the test's expected days independent of the runner's timezone.
    const occurrences = [{ startTime: '2026-01-05T22:00:00', endTime: '2026-01-07T02:00:00' }];
    const grouped = groupOccurrencesByDay(occurrences);
    expect(grouped.has('2026-01-05')).toBe(true);
    expect(grouped.has('2026-01-06')).toBe(true);
    expect(grouped.has('2026-01-07')).toBe(true);
    expect(grouped.size).toBe(3);
  });
});

describe('minute/pixel conversions', () => {
  it('minutesFromMidnight computes minutes since local midnight for the given day', () => {
    const dayDate = new Date('2026-01-05T00:00:00');
    const date = new Date('2026-01-05T09:30:00');
    expect(minutesFromMidnight(date, dayDate)).toBe(570); // 9h30m
  });

  it('minutesFromMidnight clamps a date before the day to 0', () => {
    const dayDate = new Date('2026-01-05T00:00:00');
    const date = new Date('2026-01-04T09:00:00');
    expect(minutesFromMidnight(date, dayDate)).toBe(0);
  });

  it('minutesFromMidnight clamps a date after the day to 1440', () => {
    const dayDate = new Date('2026-01-05T00:00:00');
    const date = new Date('2026-01-07T09:00:00');
    expect(minutesFromMidnight(date, dayDate)).toBe(1440);
  });

  it('minutesToY and yToMinutes are inverses at the configured HOUR_HEIGHT', () => {
    expect(minutesToY(60)).toBe(HOUR_HEIGHT);
    expect(yToMinutes(HOUR_HEIGHT)).toBe(60);
    expect(yToMinutes(minutesToY(90))).toBe(90);
  });

  it('snapMinutes rounds to the nearest 15-minute increment', () => {
    expect(snapMinutes(7)).toBe(0);
    expect(snapMinutes(8)).toBe(15);
    expect(snapMinutes(22)).toBe(15);
    expect(snapMinutes(23)).toBe(30);
  });
});

describe('yToSnappedStartTime', () => {
  const dayDate = new Date('2026-01-05T00:00:00');

  it('converts a y offset into a snapped start time on the given day', () => {
    const y = minutesToY(9 * 60 + 7); // 9:07 -> snaps to 9:00
    const result = yToSnappedStartTime(y, dayDate);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('clamps a negative y to midnight', () => {
    const result = yToSnappedStartTime(-50, dayDate);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('clamps a y past the end of the day so the block still fits before midnight', () => {
    const result = yToSnappedStartTime(minutesToY(23 * 60 + 59), dayDate);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(45); // 24:00 - 15min minimum block
  });
});

describe('getBlockLayout', () => {
  const dayDate = new Date('2026-01-05T00:00:00');

  it('computes top/height in pixels for a normal occurrence', () => {
    const occurrence = { startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T10:30:00' };
    const layout = getBlockLayout(occurrence, dayDate);
    expect(layout.top).toBe(minutesToY(9 * 60));
    expect(layout.height).toBe(minutesToY(90));
  });

  it('floors the height to the minimum block size for a point-in-time occurrence', () => {
    const occurrence = { startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T09:00:00' };
    const layout = getBlockLayout(occurrence, dayDate);
    expect(layout.height).toBe(minutesToY(15));
  });
});

describe('assignOverlapColumns', () => {
  const dayDate = new Date('2026-01-05T00:00:00');

  it('gives a single occurrence full width (column 0 of 1)', () => {
    const occurrences = [{ startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T10:00:00' }];
    const result = assignOverlapColumns(occurrences, dayDate);
    expect(result[0]).toMatchObject({ column: 0, columnCount: 1 });
  });

  it('splits two overlapping occurrences into separate columns of the same cluster', () => {
    const occurrences = [
      { startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T10:00:00' },
      { startTime: '2026-01-05T09:30:00', endTime: '2026-01-05T10:30:00' },
    ];
    const result = assignOverlapColumns(occurrences, dayDate);
    expect(result[0].columnCount).toBe(2);
    expect(result[1].columnCount).toBe(2);
    expect(result[0].column).not.toBe(result[1].column);
  });

  it('keeps non-overlapping occurrences in separate single-width clusters', () => {
    const occurrences = [
      { startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T10:00:00' },
      { startTime: '2026-01-05T14:00:00', endTime: '2026-01-05T15:00:00' },
    ];
    const result = assignOverlapColumns(occurrences, dayDate);
    expect(result[0]).toMatchObject({ column: 0, columnCount: 1 });
    expect(result[1]).toMatchObject({ column: 0, columnCount: 1 });
  });

  it('shares one cluster across a transitively-overlapping chain, reusing a column once it frees up', () => {
    // A: 9:00-10:00, B: 9:30-10:30, C: 10:15-11:00 — A/C don't directly
    // overlap so they can share a column, but all three belong to one
    // cluster (A-B and B-C overlap) and must agree on the same columnCount.
    // Max concurrency at any instant is 2 (e.g. A+B at 9:45), so 2 columns.
    const occurrences = [
      { startTime: '2026-01-05T09:00:00', endTime: '2026-01-05T10:00:00' }, // A
      { startTime: '2026-01-05T09:30:00', endTime: '2026-01-05T10:30:00' }, // B
      { startTime: '2026-01-05T10:15:00', endTime: '2026-01-05T11:00:00' }, // C
    ];
    const [a, b, c] = assignOverlapColumns(occurrences, dayDate);
    expect(a.columnCount).toBe(2);
    expect(b.columnCount).toBe(2);
    expect(c.columnCount).toBe(2);
    expect(a.column).toBe(0);
    expect(b.column).toBe(1);
    expect(c.column).toBe(0); // reuses A's column once A has ended
  });
});
