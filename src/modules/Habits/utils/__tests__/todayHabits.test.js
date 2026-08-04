import { filterTodayHabits } from '../todayHabits';

function habit(id, scheduleType = 'recurrence') {
  return { _id: id, scheduleType };
}

function occurrence(entityId) {
  return { entityType: 'habit', entityId };
}

describe('filterTodayHabits', () => {
  it('includes a recurrence habit only when it has a matching occurrence today', () => {
    const habits = [habit('a'), habit('b')];
    const occurrences = [occurrence('a')];
    expect(filterTodayHabits(habits, occurrences).map((h) => h._id)).toEqual(['a']);
  });

  it('always includes a flexible timesPerPeriod habit regardless of occurrences', () => {
    const habits = [habit('a', 'timesPerPeriod')];
    expect(filterTodayHabits(habits, []).map((h) => h._id)).toEqual(['a']);
  });

  it('returns an empty list when nothing is scheduled and there are no flexible habits', () => {
    const habits = [habit('a'), habit('b')];
    expect(filterTodayHabits(habits, [])).toEqual([]);
  });

  it('handles a missing/undefined occurrences argument gracefully', () => {
    const habits = [habit('a', 'timesPerPeriod'), habit('b')];
    expect(filterTodayHabits(habits, undefined).map((h) => h._id)).toEqual(['a']);
  });
});
