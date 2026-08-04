import { resolveLandingView, taskMatchesView } from '../viewMatcher';

const NOW = new Date('2026-01-08T12:00:00'); // a Thursday

function makeTask(overrides = {}) {
  return {
    _id: 't1',
    status: 'pending',
    bucket: 'inbox',
    dueDate: null,
    isFlagged: false,
    priority: 'medium',
    ...overrides,
  };
}

describe('taskMatchesView', () => {
  it('matches "today" only for active tasks due today', () => {
    const dueToday = makeTask({ dueDate: '2026-01-08T18:00:00' });
    expect(taskMatchesView(dueToday, 'today', { now: NOW })).toBe(true);

    const dueTomorrow = makeTask({ dueDate: '2026-01-09T09:00:00' });
    expect(taskMatchesView(dueTomorrow, 'today', { now: NOW })).toBe(false);

    const completedToday = makeTask({ dueDate: '2026-01-08T18:00:00', status: 'completed' });
    expect(taskMatchesView(completedToday, 'today', { now: NOW })).toBe(false);
  });

  it('excludes a task from "today" the moment it is completed', () => {
    const task = makeTask({ dueDate: '2026-01-08T18:00:00', status: 'completed' });
    expect(taskMatchesView(task, 'today', { now: NOW })).toBe(false);
  });

  it('matches "completed" only for completed tasks, regardless of due date', () => {
    const completedNoDate = makeTask({ status: 'completed', dueDate: null });
    expect(taskMatchesView(completedNoDate, 'completed', { now: NOW })).toBe(true);

    const pendingTask = makeTask({ status: 'pending' });
    expect(taskMatchesView(pendingTask, 'completed', { now: NOW })).toBe(false);
  });

  it('removes a task from "completed" once uncompleted', () => {
    const uncompleted = makeTask({ status: 'pending', dueDate: '2026-01-08T18:00:00' });
    expect(taskMatchesView(uncompleted, 'completed', { now: NOW })).toBe(false);
    // ...and it correctly reappears in "today" since its dueDate is preserved.
    expect(taskMatchesView(uncompleted, 'today', { now: NOW })).toBe(true);
  });

  it('matches "inbox" only for active, undated, inbox-bucket tasks', () => {
    const undated = makeTask();
    expect(taskMatchesView(undated, 'inbox', { now: NOW })).toBe(true);

    const dated = makeTask({ dueDate: '2026-01-08T18:00:00' });
    expect(taskMatchesView(dated, 'inbox', { now: NOW })).toBe(false);

    const someday = makeTask({ bucket: 'someday' });
    expect(taskMatchesView(someday, 'inbox', { now: NOW })).toBe(false);
  });

  it('matches "overdue" for active tasks with a past due date', () => {
    const overdue = makeTask({ dueDate: '2026-01-05T09:00:00' });
    expect(taskMatchesView(overdue, 'overdue', { now: NOW })).toBe(true);
  });

  it('matches "upcoming" for active tasks due after today', () => {
    const upcoming = makeTask({ dueDate: '2026-01-20T09:00:00' });
    expect(taskMatchesView(upcoming, 'upcoming', { now: NOW })).toBe(true);
  });

  it('matches "flagged" only for active flagged tasks', () => {
    const flagged = makeTask({ isFlagged: true });
    expect(taskMatchesView(flagged, 'flagged', { now: NOW })).toBe(true);

    const flaggedButCompleted = makeTask({ isFlagged: true, status: 'completed' });
    expect(taskMatchesView(flaggedButCompleted, 'flagged', { now: NOW })).toBe(false);
  });

  it('matches "highPriority" for active high/urgent tasks', () => {
    expect(taskMatchesView(makeTask({ priority: 'high' }), 'highPriority', { now: NOW })).toBe(true);
    expect(taskMatchesView(makeTask({ priority: 'urgent' }), 'highPriority', { now: NOW })).toBe(true);
    expect(taskMatchesView(makeTask({ priority: 'medium' }), 'highPriority', { now: NOW })).toBe(false);
  });

  it('matches "all" unconditionally', () => {
    expect(taskMatchesView(makeTask({ status: 'completed' }), 'all', { now: NOW })).toBe(true);
    expect(taskMatchesView(makeTask(), 'all', { now: NOW })).toBe(true);
  });
});

describe('resolveLandingView', () => {
  it('lands a dateless task in inbox', () => {
    expect(resolveLandingView(makeTask())).toBe('inbox');
  });

  it('lands a task due today in today', () => {
    expect(resolveLandingView(makeTask({ dueDate: new Date().toISOString() }))).toBe('today');
  });

  it('lands an overdue task in overdue when created with a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(resolveLandingView(makeTask({ dueDate: past.toISOString() }))).toBe('overdue');
  });
});
