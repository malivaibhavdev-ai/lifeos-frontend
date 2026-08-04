import { resolveQuadrant, getMoveToQuadrantUpdate, MATRIX_QUADRANTS } from '../matrixQuadrants';

describe('resolveQuadrant', () => {
  it('maps every importance/urgency combination to exactly one quadrant', () => {
    expect(resolveQuadrant({ importance: 'high', urgency: 'high' })).toBe('do');
    expect(resolveQuadrant({ importance: 'high', urgency: 'low' })).toBe('schedule');
    expect(resolveQuadrant({ importance: 'low', urgency: 'high' })).toBe('delegate');
    expect(resolveQuadrant({ importance: 'low', urgency: 'low' })).toBe('eliminate');
  });

  it('every quadrant definition round-trips through resolveQuadrant', () => {
    for (const quadrant of MATRIX_QUADRANTS) {
      expect(resolveQuadrant({ importance: quadrant.importance, urgency: quadrant.urgency })).toBe(quadrant.key);
    }
  });
});

describe('getMoveToQuadrantUpdate', () => {
  it('returns the importance/urgency pair for a valid quadrant', () => {
    expect(getMoveToQuadrantUpdate('do')).toEqual({ importance: 'high', urgency: 'high' });
    expect(getMoveToQuadrantUpdate('eliminate')).toEqual({ importance: 'low', urgency: 'low' });
  });

  it('returns null for an unknown quadrant', () => {
    expect(getMoveToQuadrantUpdate('nonexistent')).toBeNull();
  });
});
