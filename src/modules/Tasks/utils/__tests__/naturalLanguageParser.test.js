import dayjs from 'dayjs';
import { parseQuickAddText } from '../naturalLanguageParser';

// Thursday, Jan 1, 2026 09:00 local — a fixed "now" so date-math is deterministic.
const NOW = new Date('2026-01-01T09:00:00');

describe('parseQuickAddText', () => {
  it('returns the plain title unchanged when there is nothing to parse', () => {
    const result = parseQuickAddText('Buy groceries', { now: NOW });
    expect(result.title).toBe('Buy groceries');
    expect(result.dueDate).toBeNull();
    expect(result.priority).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.category).toBeNull();
  });

  it('extracts a single tag and strips it from the title', () => {
    const result = parseQuickAddText('Call mom #family', { now: NOW });
    expect(result.title).toBe('Call mom');
    expect(result.tags).toEqual(['family']);
  });

  it('extracts multiple tags', () => {
    const result = parseQuickAddText('Plan trip #travel #urgent-stuff', { now: NOW });
    expect(result.title).toBe('Plan trip');
    expect(result.tags).toEqual(['travel', 'urgent-stuff']);
  });

  it('extracts a category', () => {
    const result = parseQuickAddText('Review PR @work', { now: NOW });
    expect(result.title).toBe('Review PR');
    expect(result.category).toBe('work');
  });

  it('extracts a priority token', () => {
    const result = parseQuickAddText('Ship release !urgent', { now: NOW });
    expect(result.title).toBe('Ship release');
    expect(result.priority).toBe('urgent');
  });

  it('combines tags, category, and priority in one string', () => {
    const result = parseQuickAddText('Call mom tomorrow 5pm #family @personal !high', { now: NOW });
    expect(result.title).toBe('Call mom');
    expect(result.tags).toEqual(['family']);
    expect(result.category).toBe('personal');
    expect(result.priority).toBe('high');
    expect(dayjs(result.dueDate).format('YYYY-MM-DD HH:mm')).toBe('2026-01-02 17:00');
  });

  it('parses "today"', () => {
    const result = parseQuickAddText('Water plants today', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-01');
  });

  it('parses "tomorrow"', () => {
    const result = parseQuickAddText('Submit report tomorrow', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-02');
  });

  it('parses "tonight" as 8pm today', () => {
    const result = parseQuickAddText('Watch movie tonight', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD HH:mm')).toBe('2026-01-01 20:00');
  });

  it('parses a bare weekday as the next upcoming occurrence, excluding today', () => {
    // NOW is Thursday. "thursday" should resolve to next Thursday (7 days out), not today.
    const result = parseQuickAddText('Standup thursday', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-08');
  });

  it('parses the nearest upcoming weekday when it is a few days away', () => {
    const result = parseQuickAddText('Dentist monday', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-05');
  });

  it('treats "next <weekday>" the same as the bare weekday', () => {
    const result = parseQuickAddText('Dentist next monday', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-05');
  });

  it('parses "in N days"', () => {
    const result = parseQuickAddText('Follow up in 3 days', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-04');
  });

  it('parses "in N weeks"', () => {
    const result = parseQuickAddText('Check in in 2 weeks', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-15');
  });

  it('parses an ISO date', () => {
    const result = parseQuickAddText('Renew passport 2026-03-15', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-03-15');
  });

  it('parses a slash date without a year, rolling to next year if already past', () => {
    const result = parseQuickAddText('Anniversary 12/25', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-12-25');
  });

  it('parses a month-day phrase', () => {
    const result = parseQuickAddText('Birthday party jan 20', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD')).toBe('2026-01-20');
  });

  it('parses a 12-hour time and attaches it to today when no date is given', () => {
    const result = parseQuickAddText('Lunch at 1pm', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD HH:mm')).toBe('2026-01-01 13:00');
  });

  it('parses a 24-hour time', () => {
    const result = parseQuickAddText('Sync at 14:30', { now: NOW });
    expect(dayjs(result.dueDate).format('YYYY-MM-DD HH:mm')).toBe('2026-01-01 14:30');
  });

  it('parses a 12-hour time with minutes', () => {
    const result = parseQuickAddText('Call at 9:15am', { now: NOW });
    expect(dayjs(result.dueDate).format('HH:mm')).toBe('09:15');
  });

  it('falls back to the raw text as title if everything was consumed as tokens', () => {
    const result = parseQuickAddText('#family @work !high', { now: NOW });
    expect(result.title).toBe('#family @work !high');
  });
});
