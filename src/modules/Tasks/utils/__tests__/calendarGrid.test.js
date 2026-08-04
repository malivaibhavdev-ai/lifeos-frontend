import { groupTasksByDay } from '../calendarGrid';

describe('groupTasksByDay', () => {
  it('groups tasks by their due date, ignoring undated tasks', () => {
    const tasks = [
      { _id: '1', dueDate: '2026-01-01T09:00:00' },
      { _id: '2', dueDate: '2026-01-01T18:00:00' },
      { _id: '3', dueDate: '2026-01-02T09:00:00' },
      { _id: '4', dueDate: null },
    ];
    const grouped = groupTasksByDay(tasks);
    expect(grouped.get('2026-01-01')).toHaveLength(2);
    expect(grouped.get('2026-01-02')).toHaveLength(1);
    expect(grouped.has('2026-01-03')).toBe(false);
    expect([...grouped.values()].flat()).toHaveLength(3);
  });
});
