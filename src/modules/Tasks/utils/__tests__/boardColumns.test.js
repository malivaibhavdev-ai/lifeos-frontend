import { resolveBoardColumn, getMoveToColumnUpdate } from '../boardColumns';

function makeTask(overrides = {}) {
  return {
    status: 'pending',
    bucket: 'inbox',
    dueDate: null,
    isArchived: false,
    ...overrides,
  };
}

describe('resolveBoardColumn', () => {
  it('classifies an undated inbox task as inbox', () => {
    expect(resolveBoardColumn(makeTask())).toBe('inbox');
  });

  it('classifies a dated inbox-bucket task as pending', () => {
    expect(resolveBoardColumn(makeTask({ dueDate: '2026-01-01' }))).toBe('pending');
  });

  it('classifies a waiting-bucket task as waiting regardless of due date', () => {
    expect(resolveBoardColumn(makeTask({ bucket: 'waiting' }))).toBe('waiting');
  });

  it('classifies an in_progress task as in_progress', () => {
    expect(resolveBoardColumn(makeTask({ status: 'in_progress' }))).toBe('in_progress');
  });

  it('classifies completed and cancelled tasks as completed', () => {
    expect(resolveBoardColumn(makeTask({ status: 'completed' }))).toBe('completed');
    expect(resolveBoardColumn(makeTask({ status: 'cancelled' }))).toBe('completed');
  });

  it('classifies an archived task as archived regardless of status', () => {
    expect(resolveBoardColumn(makeTask({ isArchived: true, status: 'in_progress' }))).toBe('archived');
  });

  it('archived takes precedence over every other signal', () => {
    expect(resolveBoardColumn(makeTask({ isArchived: true, status: 'completed', bucket: 'waiting' }))).toBe('archived');
  });
});

describe('getMoveToColumnUpdate', () => {
  it('moving to inbox clears the due date and resets bucket', () => {
    const update = getMoveToColumnUpdate('inbox', makeTask({ dueDate: '2026-01-01', bucket: 'waiting' }));
    expect(update).toEqual({ kind: 'update', payload: { bucket: 'inbox', dueDate: null, status: 'pending' } });
  });

  it('moving to pending keeps the bucket when a due date already exists', () => {
    const update = getMoveToColumnUpdate('pending', makeTask({ dueDate: '2026-01-01', bucket: 'someday' }));
    expect(update).toEqual({ kind: 'update', payload: { bucket: 'someday', status: 'pending' } });
  });

  it('moving to pending resets an undated task back to the inbox bucket', () => {
    const update = getMoveToColumnUpdate('pending', makeTask({ dueDate: null, bucket: 'someday' }));
    expect(update).toEqual({ kind: 'update', payload: { bucket: 'inbox', status: 'pending' } });
  });

  it('moving to in_progress or completed issues a status change', () => {
    expect(getMoveToColumnUpdate('in_progress', makeTask())).toEqual({ kind: 'status', status: 'in_progress' });
    expect(getMoveToColumnUpdate('completed', makeTask())).toEqual({ kind: 'status', status: 'completed' });
  });

  it('moving to archived issues an archive action', () => {
    expect(getMoveToColumnUpdate('archived', makeTask())).toEqual({ kind: 'archive' });
  });

  it('returns null for an unknown column', () => {
    expect(getMoveToColumnUpdate('nonexistent', makeTask())).toBeNull();
  });
});
